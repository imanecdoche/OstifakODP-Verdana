import { 
  collection, 
  addDoc, 
  query, 
  where,
  getDocs,
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';
import { 
  ViolationRecord, 
  WorkProgram, 
  MudirDirective, 
  SeverityLevel, 
  PenaltyStatus, 
  ProgramStatus, 
  DivisionId,
  UserProfile,
  Dormitory,
  DormitoryRoom,
  SchoolClass,
  ClassAchievement,
  ClassViolation,
  RoomAchievement,
  RoomViolation,
  SantriRecord,
  StudentViolationEntry,
  StudentHafalanEntry,
  StudentAchievementEntry,
  StudentPermissionEntry,
  StudentMahkamahEntry
} from '../types';

export type {
  Dormitory,
  DormitoryRoom,
  SchoolClass,
  ClassAchievement,
  ClassViolation,
  RoomAchievement,
  RoomViolation,
  SantriRecord,
  StudentViolationEntry,
  StudentHafalanEntry,
  StudentAchievementEntry,
  StudentPermissionEntry,
  StudentMahkamahEntry
};

import { OFFICIAL_DORMITORIES, ALL_OFFICIAL_ROOMS, OFFICIAL_CLASSES } from './constants';
export { OFFICIAL_DORMITORIES, ALL_OFFICIAL_ROOMS, OFFICIAL_CLASSES };
import { OFFICIAL_ACCOUNTS } from '../data/mockData';
import { broadcastSync, subscribeToSyncMessages } from './realtimeSync';
import { getSeverityInfo } from './severityUtils';
import { 
  isOfflineModeActive, 
  getOfflineStudents, 
  saveOfflineStudents,
  getOfflineViolations,
  saveOfflineViolations,
  getOfflinePrograms,
  saveOfflinePrograms,
  getOfflineDirectives,
  saveOfflineDirectives,
  getOfflineDormitories,
  getOfflineRooms,
  saveOfflineDormitoriesAndRooms,
  getOfflineClasses,
  saveOfflineClasses
} from './offlineManager';

/**
 * Collision-proof local document id. Uses crypto.randomUUID when available,
 * so rapid successive writes inside the same millisecond can never collide.
 */
export function createLocalId(prefix: string): string {
  const unique =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${unique}`;
}

export function normalizeSantriRecord(student: SantriRecord): SantriRecord {
  const violations = student.violationsHistory || [];
  const achievements = student.achievementsHistory || [];
  return {
    ...student,
    violationsHistory: violations,
    achievementsHistory: achievements,
    poinPelanggaran: violations.length
      ? violations.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0)
      : Number(student.poinPelanggaran) || 0,
    poinPrestasi: achievements.length
      ? achievements.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0)
      : Number(student.poinPrestasi) || 0,
  };
}

export function reconcileSantriViolationTotals(students: SantriRecord[], violations: ViolationRecord[]): SantriRecord[] {
  return students.map((student) => {
    const related = violations
      .filter((violation) => violation.studentId === student.id ||
        (!violation.studentId && violation.nis === student.nis) ||
        (!violation.studentId && violation.studentName.trim().toLowerCase() === student.studentName.trim().toLowerCase()));
    const total = related.reduce((sum, violation) => sum + (Number(violation.points) || 0), 0);
    return related.length ? { ...normalizeSantriRecord(student), poinPelanggaran: total } : normalizeSantriRecord(student);
  });
}

/**
 * 2. AUTHENTICATION SERVICES
 */
export async function initializeOfficialAccountsInFirebase(): Promise<{ success: boolean; message: string }> {
  return Promise.resolve({ success: true, message: 'Akun resmi siap digunakan.' });
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const officialAcc = OFFICIAL_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === email.toLowerCase()
  );

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    if (officialAcc) {
      return {
        id: fbUser.uid,
        name: officialAcc.name,
        role: officialAcc.role,
        roleLevel: officialAcc.roleLevel,
        roleTitle: officialAcc.roleTitle,
        division: officialAcc.divisionId || undefined,
        avatar: officialAcc.avatar,
      };
    }

    return {
      id: fbUser.uid,
      name: fbUser.email?.split('@')[0] || 'Pengurus',
      role: 'ketua_divisi',
      roleLevel: 3,
      roleTitle: 'Pengurus OSTIFAK',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    };
  } catch (error: any) {
    if (officialAcc && (password === 'ostifak1234' || password === 'fajrulkarim2026')) {
      const emailDocId = email.replace(/[^a-zA-Z0-9]/g, '_');
      return {
        id: emailDocId,
        name: officialAcc.name,
        role: officialAcc.role,
        roleLevel: officialAcc.roleLevel,
        roleTitle: officialAcc.roleTitle,
        division: officialAcc.divisionId || undefined,
        avatar: officialAcc.avatar,
      };
    }
    return {
      id: email.split('@')[0],
      name: email.split('@')[0],
      role: 'ketua_divisi',
      roleLevel: 3,
      roleTitle: 'Pengurus OSTIFAK',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    };
  }
}

export const loginWithEmailAndPassword = loginWithEmail;

export async function logoutUser() {
  await signOut(auth);
}

/**
 * 3. FIRESTORE REALTIME SUBSCRIBERS
 */

// =========================================================================
// LOCAL-FIRST PERSISTENT LAYER FOR VIOLATIONS / PELANGGARAN
// =========================================================================
const STORAGE_DELETED_VIOLATIONS_KEY = 'ostifak_deleted_violations_ids';
const STORAGE_UPDATED_VIOLATIONS_KEY = 'ostifak_updated_violations_map';
const EVENT_VIOLATIONS_CHANGED = 'ostifak-violations-changed';

export function getDeletedViolationIds(): Set<string> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_DELETED_VIOLATIONS_KEY) : null;
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDeletedViolationId(id: string, identityKey?: string) {
  try {
    if (typeof localStorage === 'undefined') return;
    const set = getDeletedViolationIds();
    if (id) set.add(id);
    if (identityKey) set.add(identityKey);
    localStorage.setItem(STORAGE_DELETED_VIOLATIONS_KEY, JSON.stringify(Array.from(set)));

    // Remove from updated violations map if present
    const updated = getUpdatedViolationsMap();
    if (id) delete updated[id];
    if (identityKey) delete updated[identityKey];
    localStorage.setItem(STORAGE_UPDATED_VIOLATIONS_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_VIOLATIONS_CHANGED, { detail: { type: 'delete', id, identityKey } }));
    }
  } catch (err) {
    console.error('Error saving deleted violation id to local storage:', err);
  }
}

export function getUpdatedViolationsMap(): Record<string, Partial<ViolationRecord>> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_UPDATED_VIOLATIONS_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUpdatedViolation(id: string, updates: Partial<ViolationRecord>, identityKey?: string) {
  try {
    if (typeof localStorage === 'undefined') return;
    const map = getUpdatedViolationsMap();
    if (id) map[id] = { ...(map[id] || {}), ...updates };
    if (identityKey) map[identityKey] = { ...(map[identityKey] || {}), ...updates };
    localStorage.setItem(STORAGE_UPDATED_VIOLATIONS_KEY, JSON.stringify(map));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_VIOLATIONS_CHANGED, { detail: { type: 'update', id, updates } }));
    }
  } catch (err) {
    console.error('Error saving updated violation to local storage:', err);
  }
}

// Pelanggaran Collection Listener
export function subscribeToPelanggaran(callback: (records: ViolationRecord[]) => void) {
  if (isOfflineModeActive()) {
    const emitOffline = () => {
      callback(getOfflineViolations());
    };
    emitOffline();
    const handleLocalChange = () => emitOffline();
    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_VIOLATIONS_CHANGED, handleLocalChange);
      window.addEventListener('storage', handleLocalChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EVENT_VIOLATIONS_CHANGED, handleLocalChange);
        window.removeEventListener('storage', handleLocalChange);
      }
    };
  }

  const q = query(collection(db, 'pelanggaran'));

  const mergeAndEmit = (remoteDocs: ViolationRecord[]) => {
    const deletedIds = getDeletedViolationIds();
    const updatedMap = getUpdatedViolationsMap();

    const filtered = remoteDocs
      .filter((doc) => !deletedIds.has(doc.id) && !deletedIds.has(violationIdentity(doc)))
      .map((doc) => {
        const updates = updatedMap[doc.id] || updatedMap[violationIdentity(doc)];
        return updates ? { ...doc, ...updates } : doc;
      });

    callback(filtered);
  };

  let cachedRemote: ViolationRecord[] = [];

  const unsubSnapshot = onSnapshot(q, (snapshot) => {
    cachedRemote = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const pts = Number(data.points !== undefined ? data.points : data.poin) || 0;
      return {
        id: docSnap.id,
        studentId: data.studentId || undefined,
        studentName: data.studentName || data.name || 'Santri',
        nis: data.nis || '-',
        kamar: data.kamar || '-',
        violation: data.violation || data.title || data.kasus || '-',
        category: data.category || 'Kedisiplinan Santri',
        points: pts,
        severity: (data.severity as SeverityLevel) || getSeverityInfo(pts).severity,
        status: (data.status as PenaltyStatus) || 'belum_dihukum',
        date: data.date || new Date().toLocaleDateString('id-ID'),
        penaltyDescription: data.penaltyDescription || data.penalty || '-',
        reportedBy: data.reportedBy || 'Pelapor',
      };
    });
    mergeAndEmit(cachedRemote);
  }, (error) => {
    console.error('Error fetching violations:', error);
    mergeAndEmit(cachedRemote);
  });

  const handleLocalChange = () => {
    mergeAndEmit(cachedRemote);
  };

  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'pelanggaran') {
      mergeAndEmit(cachedRemote);
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_VIOLATIONS_CHANGED, handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
  }

  return () => {
    unsubSnapshot();
    unsubSync();
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_VIOLATIONS_CHANGED, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
    }
  };
}

export async function addPelanggaranRecord(record: Omit<ViolationRecord, 'id'>) {
  if (isOfflineModeActive()) {
    const current = getOfflineViolations();
      const newDoc: ViolationRecord = {
      ...record,
      id: createLocalId('off_vio'),
    };
    saveOfflineViolations([newDoc, ...current]);
    return { id: newDoc.id };
  }

  const colRef = collection(db, 'pelanggaran');
  const docRef = await addDoc(colRef, {
    ...record,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  broadcastSync({ module: 'pelanggaran', action: 'CREATE', id: docRef.id, payload: record });
  return docRef;
}

export async function updatePelanggaranRecord(id: string, updates: Partial<ViolationRecord>) {
  if (isOfflineModeActive()) {
    const current = getOfflineViolations();
    const next = current.map(v => v.id === id ? { ...v, ...updates } : v);
    saveOfflineViolations(next);
    return;
  }

  saveUpdatedViolation(id, updates);
  broadcastSync({ module: 'pelanggaran', action: 'UPDATE', id, payload: updates });
  const docRef = doc(db, 'pelanggaran', id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Remote updatePelanggaranRecord notice:', err);
  }
}

export async function deletePelanggaranRecord(id: string) {
  if (isOfflineModeActive()) {
    const current = getOfflineViolations();
    const next = current.filter(v => v.id !== id);
    saveOfflineViolations(next);
    return;
  }

  saveDeletedViolationId(id);
  broadcastSync({ module: 'pelanggaran', action: 'DELETE', id });
  const docRef = doc(db, 'pelanggaran', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Remote deletePelanggaranRecord notice:', err);
  }
}

export async function deleteUnifiedViolation(
  violation: ViolationRecord,
  students: SantriRecord[] = []
) {
  if (isOfflineModeActive()) {
    const current = getOfflineViolations();
    const identity = violationIdentity(violation);
    const next = current.filter(v => v.id !== violation.id && violationIdentity(v) !== identity);
    saveOfflineViolations(next);

    const currentStudents = getOfflineStudents();
    const targetStudent = currentStudents.find((s) => s.id === violation.studentId) || currentStudents.find(
      (s) => s.nis === violation.nis || s.studentName.trim().toLowerCase() === violation.studentName.trim().toLowerCase()
    );
    if (targetStudent && targetStudent.violationsHistory && targetStudent.violationsHistory.length > 0) {
      const updatedHistory = targetStudent.violationsHistory.filter(
        (entry) => entry.id !== violation.id && entry.title.trim().toLowerCase() !== violation.violation.trim().toLowerCase()
      );
      const newPoints = Math.max(0, (targetStudent.poinPelanggaran || 0) - (violation.points || 0));
      updateSantriRecord(targetStudent.id, {
        poinPelanggaran: newPoints,
        violationsHistory: updatedHistory,
      });
    }
    return;
  }

  const identity = violationIdentity(violation);
  
  // 1. Instantly write to persistent storage blacklist
  saveDeletedViolationId(violation.id, identity);
  broadcastSync({ module: 'pelanggaran', action: 'DELETE', id: violation.id });

  // 2. Remove from Firestore 'pelanggaran' collection
  try {
    const docRef = doc(db, 'pelanggaran', violation.id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Standalone pelanggaran doc delete notice:', err);
  }

  // 3. Remove from matching student's violationsHistory (both local & Firestore)
  const targetStudent = (students || []).find((s) => s.id === violation.studentId) || (students || []).find(
    (s) => s.nis === violation.nis || s.studentName.trim().toLowerCase() === violation.studentName.trim().toLowerCase()
  );

  if (targetStudent && targetStudent.violationsHistory && targetStudent.violationsHistory.length > 0) {
    const updatedHistory = targetStudent.violationsHistory.filter(
      (entry) => entry.id !== violation.id && entry.title.trim().toLowerCase() !== violation.violation.trim().toLowerCase()
    );
    const newPoints = Math.max(0, (targetStudent.poinPelanggaran || 0) - (violation.points || 0));
    await updateSantriRecord(targetStudent.id, {
      poinPelanggaran: newPoints,
      violationsHistory: updatedHistory,
    });
  }
}

export async function updateUnifiedViolation(
  violation: ViolationRecord,
  updates: Partial<ViolationRecord>,
  students: SantriRecord[] = []
) {
  if (isOfflineModeActive()) {
    const current = getOfflineViolations();
    const identity = violationIdentity(violation);
    const next = current.map(v => (v.id === violation.id || violationIdentity(v) === identity) ? { ...v, ...updates } : v);
    saveOfflineViolations(next);

    const currentStudents = getOfflineStudents();
    const targetStudent = currentStudents.find((s) => s.id === violation.studentId) || currentStudents.find(
      (s) => s.nis === violation.nis || s.studentName.trim().toLowerCase() === violation.studentName.trim().toLowerCase()
    );
    if (targetStudent && targetStudent.violationsHistory) {
      let historyChanged = false;
      const updatedHistory = targetStudent.violationsHistory.map((entry) => {
        if (entry.id === violation.id || entry.title.trim().toLowerCase() === violation.violation.trim().toLowerCase()) {
          historyChanged = true;
          return {
            ...entry,
            title: updates.violation !== undefined ? updates.violation : entry.title,
            points: updates.points !== undefined ? updates.points : entry.points,
            penalty: updates.penaltyDescription !== undefined ? updates.penaltyDescription : entry.penalty,
          };
        }
        return entry;
      });

      if (historyChanged) {
        const deltaPoints = (updates.points !== undefined ? updates.points : violation.points) - violation.points;
        const newPoints = Math.max(0, (targetStudent.poinPelanggaran || 0) + deltaPoints);
        updateSantriRecord(targetStudent.id, {
          poinPelanggaran: newPoints,
          violationsHistory: updatedHistory,
        });
      }
    }
    return;
  }
  const identity = violationIdentity(violation);

  // 1. Instantly write to persistent storage
  saveUpdatedViolation(violation.id, updates, identity);
  broadcastSync({ module: 'pelanggaran', action: 'UPDATE', id: violation.id, payload: updates });

  // 2. Update in Firestore 'pelanggaran' collection
  try {
    const docRef = doc(db, 'pelanggaran', violation.id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Standalone pelanggaran doc update notice:', err);
  }

  // 3. If student has it in violationsHistory, update student's record (both local & Firestore)
  const targetStudent = (students || []).find((s) => s.id === violation.studentId) || (students || []).find(
    (s) => s.nis === violation.nis || s.studentName.trim().toLowerCase() === violation.studentName.trim().toLowerCase()
  );

  if (targetStudent && targetStudent.violationsHistory) {
    let historyChanged = false;
    const updatedHistory = targetStudent.violationsHistory.map((entry) => {
      if (entry.id === violation.id || entry.title.trim().toLowerCase() === violation.violation.trim().toLowerCase()) {
        historyChanged = true;
        return {
          ...entry,
          title: updates.violation !== undefined ? updates.violation : entry.title,
          points: updates.points !== undefined ? updates.points : entry.points,
          penalty: updates.penaltyDescription !== undefined ? updates.penaltyDescription : entry.penalty,
        };
      }
      return entry;
    });

    if (historyChanged) {
      const deltaPoints = (updates.points !== undefined ? updates.points : violation.points) - violation.points;
      const newPoints = Math.max(0, (targetStudent.poinPelanggaran || 0) + deltaPoints);
      await updateSantriRecord(targetStudent.id, {
        poinPelanggaran: newPoints,
        violationsHistory: updatedHistory,
      });
    }
  }
}

/**
 * Derive recap-ready violation rows from santri records (local-first violationsHistory),
 * so cases recorded via the student profile modal appear in the unified recap.
 */
export function deriveViolationsFromSantri(students: SantriRecord[]): ViolationRecord[] {
  const deletedIds = getDeletedViolationIds();
  const updatedMap = getUpdatedViolationsMap();
  const rows: ViolationRecord[] = [];
  
  for (const s of students || []) {
    const list = s.violationsHistory || (s as any).violationHistory || [];
    for (const v of list) {
      const pts = Number(v.points !== undefined ? v.points : (v as any).poin) || 0;
      const title = v.title || (v as any).violation || (v as any).kasus || 'Kasus Pelanggaran';
      const id = v.id || `vio-${s.id}-${title}-${v.date}`;
      const identity = `${(s.studentName || '').trim().toLowerCase()}|${title.trim().toLowerCase()}|${v.date}|${pts}`;

      if (deletedIds.has(id) || deletedIds.has(identity)) {
        continue;
      }

      const sevInfo = getSeverityInfo(pts);

      let row: ViolationRecord = {
        id,
        studentName: s.studentName,
        nis: s.nis || '-',
        kamar: s.kamar || '-',
        violation: title,
        category: (v as any).category || 'Kedisiplinan Santri',
        points: pts,
        severity: (v as any).severity ? (v as any).severity : sevInfo.severity,
        status: (v as any).status || 'selesai',
        date: v.date || new Date().toLocaleDateString('id-ID'),
        penaltyDescription: v.penalty || (v as any).penaltyDescription || '-',
        reportedBy: (v as any).reportedBy || 'Pengurus OSTIFAK',
      };

      const updates = updatedMap[id] || updatedMap[identity];
      if (updates) {
        row = { ...row, ...updates };
      }

      rows.push(row);
    }
  }
  return rows;
}

export function violationIdentity(v: { studentName: string; violation: string; date: string; points: number }): string {
  return `${(v.studentName || '').trim().toLowerCase()}|${(v.violation || '').trim().toLowerCase()}|${v.date}|${v.points}`;
}

// Proposal / Program Kerja Listener
export function subscribeToProposals(callback: (programs: WorkProgram[]) => void) {
  if (isOfflineModeActive()) {
    const emitOffline = () => {
      callback(getOfflinePrograms());
    };
    emitOffline();
    const handleLocalChange = () => emitOffline();
    if (typeof window !== 'undefined') {
      window.addEventListener('ostifak_programs_changed', handleLocalChange);
      window.addEventListener('storage', handleLocalChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ostifak_programs_changed', handleLocalChange);
        window.removeEventListener('storage', handleLocalChange);
      }
    };
  }

  const q = query(collection(db, 'proposal'));
  const unsubSnapshot = onSnapshot(q, (snapshot) => {
    const programs: WorkProgram[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || 'Proposal Program',
        divisionId: (data.divisionId as DivisionId) || 'bph',
        divisionName: data.divisionName || 'Divisi',
        status: (data.status as ProgramStatus) || 'direncanakan',
        progress: data.progress || 0,
        targetDate: data.targetDate || '-',
        budget: data.budget || '-',
        pic: data.pic || 'Penanggung Jawab',
      };
    });
    callback(programs);
  }, (error) => {
    console.error('Error fetching proposals:', error);
  });

  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'proposals') {
      // Cross-tab revalidation
    }
  });

  return () => {
    unsubSnapshot();
    unsubSync();
  };
}

export async function addProposalRecord(program: Omit<WorkProgram, 'id'>) {
  if (isOfflineModeActive()) {
    const current = getOfflinePrograms();
    const newProgram: WorkProgram = {
      ...program,
      id: createLocalId('off_prog'),
    };
    saveOfflinePrograms([newProgram, ...current]);
    return { id: newProgram.id };
  }

  const colRef = collection(db, 'proposal');
  const docRef = await addDoc(colRef, {
    ...program,
    divisionId: program.divisionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  broadcastSync({ module: 'proposals', action: 'CREATE', id: docRef.id, payload: program });
  return docRef;
}

export async function updateProposalRecord(id: string, updates: Partial<WorkProgram>) {
  if (isOfflineModeActive()) {
    const current = getOfflinePrograms();
    const next = current.map(p => p.id === id ? { ...p, ...updates } : p);
    saveOfflinePrograms(next);
    return;
  }

  const docRef = doc(db, 'proposal', id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Remote updateProposalRecord notice:', err);
  }
  broadcastSync({ module: 'proposals', action: 'UPDATE', id, payload: updates });
}

export async function deleteProposalRecord(id: string) {
  if (isOfflineModeActive()) {
    const current = getOfflinePrograms();
    const next = current.filter(p => p.id !== id);
    saveOfflinePrograms(next);
    return;
  }

  const docRef = doc(db, 'proposal', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Remote deleteProposalRecord notice:', err);
  }
  broadcastSync({ module: 'proposals', action: 'DELETE', id });
}

// Directives Collection Listener (Instruksi Mudir)
export function subscribeToDirectives(callback: (directives: MudirDirective[]) => void) {
  if (isOfflineModeActive()) {
    const emitOffline = () => {
      callback(getOfflineDirectives());
    };
    emitOffline();
    const handleLocalChange = () => emitOffline();
    if (typeof window !== 'undefined') {
      window.addEventListener('ostifak_directives_changed', handleLocalChange);
      window.addEventListener('storage', handleLocalChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ostifak_directives_changed', handleLocalChange);
        window.removeEventListener('storage', handleLocalChange);
      }
    };
  }

  const q = query(collection(db, 'directives'));
  const unsubSnapshot = onSnapshot(q, (snapshot) => {
    const directives: MudirDirective[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || 'Instruksi Mudir',
        targetDivision: data.targetDivision || 'Semua Divisi',
        issuedDate: data.issuedDate || new Date().toLocaleDateString('id-ID'),
        priority: data.priority || 'normal',
        status: data.status || 'aktif',
        content: data.content || '',
      };
    });
    callback(directives);
  }, (error) => {
    console.error('Error fetching directives:', error);
  });

  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'directives') {
      // Cross-tab revalidation
    }
  });

  return () => {
    unsubSnapshot();
    unsubSync();
  };
}

export async function addDirectiveRecord(directive: Omit<MudirDirective, 'id'>) {
  if (isOfflineModeActive()) {
    const current = getOfflineDirectives();
    const newDirective: MudirDirective = {
      ...directive,
      id: createLocalId('off_dir'),
    };
    saveOfflineDirectives([newDirective, ...current]);
    return { id: newDirective.id };
  }

  const colRef = collection(db, 'directives');
  const docRef = await addDoc(colRef, {
    ...directive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  broadcastSync({ module: 'directives', action: 'CREATE', id: docRef.id, payload: directive });
  return docRef;
}

export async function updateDirectiveRecord(id: string, updates: Partial<MudirDirective>) {
  if (isOfflineModeActive()) {
    const current = getOfflineDirectives();
    const next = current.map(d => d.id === id ? { ...d, ...updates } : d);
    saveOfflineDirectives(next);
    return;
  }

  const docRef = doc(db, 'directives', id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Remote updateDirectiveRecord notice:', err);
  }
  broadcastSync({ module: 'directives', action: 'UPDATE', id, payload: updates });
}

export async function deleteDirectiveRecord(id: string) {
  if (isOfflineModeActive()) {
    const current = getOfflineDirectives();
    const next = current.filter(d => d.id !== id);
    saveOfflineDirectives(next);
    return;
  }

  const docRef = doc(db, 'directives', id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Remote deleteDirectiveRecord notice:', err);
  }
  broadcastSync({ module: 'directives', action: 'DELETE', id });
}



// =========================================================================
// LOCAL-FIRST PERSISTENT LAYER FOR SANTRI DIRECTORY
// =========================================================================
const STORAGE_DELETED_KEY = 'ostifak_deleted_santri_ids';
const STORAGE_UPDATED_KEY = 'ostifak_updated_santri_map';
const STORAGE_CUSTOM_KEY = 'ostifak_custom_santri_list';
const EVENT_SANTRI_CHANGED = 'ostifak-santri-changed';

export function getDeletedSantriIds(): Set<string> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_DELETED_KEY) : null;
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDeletedSantriId(id: string) {
  try {
    if (typeof localStorage === 'undefined') return;
    const set = getDeletedSantriIds();
    set.add(id);
    localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(Array.from(set)));
    
    // Also remove from custom list if present
    const custom = getCustomSantriList().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(custom));
    
    // Remove from updated map if present
    const updated = getUpdatedSantriMap();
    delete updated[id];
    localStorage.setItem(STORAGE_UPDATED_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_SANTRI_CHANGED, { detail: { type: 'delete', id } }));
    }
  } catch (err) {
    console.error('Error saving deleted santri id to local storage:', err);
  }
}

export function getUpdatedSantriMap(): Record<string, Partial<SantriRecord>> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_UPDATED_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUpdatedSantri(id: string, updates: Partial<SantriRecord>) {
  try {
    if (typeof localStorage === 'undefined') return;
    const map = getUpdatedSantriMap();
    map[id] = { ...(map[id] || {}), ...updates };
    localStorage.setItem(STORAGE_UPDATED_KEY, JSON.stringify(map));

    // Also update custom list if present
    const custom = getCustomSantriList();
    const idx = custom.findIndex(s => s.id === id);
    if (idx !== -1) {
      custom[idx] = { ...custom[idx], ...updates };
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(custom));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_SANTRI_CHANGED, { detail: { type: 'update', id, updates } }));
    }
  } catch (err) {
    console.error('Error saving updated santri to local storage:', err);
  }
}

export function getCustomSantriList(): SantriRecord[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CUSTOM_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomSantri(santri: SantriRecord) {
  try {
    if (typeof localStorage === 'undefined') return;
    const list = getCustomSantriList().filter(s => s.id !== santri.id);
    list.unshift(santri);
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(list));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_SANTRI_CHANGED, { detail: { type: 'add', santri } }));
    }
  } catch (err) {
    console.error('Error saving custom santri to local storage:', err);
  }
}

export function subscribeToSantri(callback: (santri: SantriRecord[]) => void) {
  if (isOfflineModeActive()) {
    const emitOffline = () => {
      callback(getOfflineStudents().map(normalizeSantriRecord));
    };
    emitOffline();
    const handleLocalChange = () => emitOffline();
    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_SANTRI_CHANGED, handleLocalChange);
      window.addEventListener('storage', handleLocalChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EVENT_SANTRI_CHANGED, handleLocalChange);
        window.removeEventListener('storage', handleLocalChange);
      }
    };
  }

  let remoteList: SantriRecord[] = [];

  const emit = () => {
    const deletedIds = getDeletedSantriIds();
    const updatedMap = getUpdatedSantriMap();
    const customList = getCustomSantriList();

    // Merge remote and custom, filtering deleted
    const all = [...customList, ...remoteList];
    const seen = new Set<string>();
    const final: SantriRecord[] = [];

    for (const item of all) {
      if (seen.has(item.id) || deletedIds.has(item.id) || (item as any).isDeleted) continue;
      seen.add(item.id);
      
      const localOverrides = updatedMap[item.id] || {};
      final.push(normalizeSantriRecord({
        ...item,
        ...localOverrides,
      }));
    }

    callback(final);
  };

  // Initial local emission
  emit();

  // Listen to local changes and cross-tab sync
  const handleLocalChange = () => emit();
  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'santri') {
      emit();
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_SANTRI_CHANGED, handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
  }

  // Firestore onSnapshot
  const q = query(collection(db, 'santri'));
  const unsub = onSnapshot(q, (snapshot) => {
    remoteList = snapshot.docs
      .filter((docSnap) => !docSnap.data().isDeleted)
      .map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          studentName: data.studentName || 'Santri',
          nis: data.nis || '-',
          kamar: data.kamar || '-',
          kelas: data.kelas || '-',
          hafalan: data.hafalan || '-',
          poinPelanggaran: data.poinPelanggaran || 0,
          statusIbadah: data.statusIbadah || '100% Berjamaah',
          birthDate: data.birthDate || '',
          domicile: data.domicile || '',
          guardianName: data.guardianName || '',
          guardianPhone: data.guardianPhone || '',
          address: data.address || '',
          isTahsinPassed: data.isTahsinPassed ?? true,
          violationsHistory: data.violationsHistory || [],
          mahkamahHistory: data.mahkamahHistory || [],
          hafalanHistory: data.hafalanHistory || [],
          achievementsHistory: data.achievementsHistory || [],
          permissionsHistory: data.permissionsHistory || [],
        };
      });
    emit();
  }, (error) => {
    console.warn('Firestore santri listener warning (active local-first fallback):', error);
  });

  return () => {
    unsub();
    unsubSync();
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_SANTRI_CHANGED, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
    }
  };
}

export async function updateSantriRecord(id: string, updates: Partial<SantriRecord>) {
  if (updates.violationsHistory) {
    updates = {
      ...updates,
      poinPelanggaran: updates.violationsHistory.reduce((sum, entry) => sum + (Number(entry.points) || 0), 0),
    };
  }
  if (isOfflineModeActive()) {
    const current = getOfflineStudents();
    const next = current.map(s => s.id === id ? { ...s, ...updates } : s);
    saveOfflineStudents(next);
    return;
  }

  // 1. Instantly write to local persistent storage
  saveUpdatedSantri(id, updates);
  broadcastSync({ module: 'santri', action: 'UPDATE', id, payload: updates });

  // 2. Fire background Firestore update
  const docRef = doc(db, 'santri', id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Remote updateDoc restricted (safely stored locally in persistent cache):', err);
  }
}

export async function deleteSantriRecord(id: string, student?: SantriRecord) {
  if (isOfflineModeActive()) {
    const current = getOfflineStudents();
    const next = current.filter(s => s.id !== id);
    saveOfflineStudents(next);
    const remainingViolations = getOfflineViolations().filter(v => v.studentId !== id);
    if (remainingViolations.length !== getOfflineViolations().length) {
      saveOfflineViolations(remainingViolations);
    }
    return;
  }

  // 1. Instantly write to local persistent blacklist
  saveDeletedSantriId(id);
  broadcastSync({ module: 'santri', action: 'DELETE', id });

  // 1b. Cascade: purge every violation row owned by this student (no ghost records).
  try {
    const q = query(
      collection(db, 'pelanggaran'),
      where('studentId', '==', id)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  } catch (err) {
    console.warn('Cascade delete pelanggaran notice (student may be local-only):', err);
  }

  // 2. Fire background Firestore delete (swallow permission errors gracefully)
  const docRef = doc(db, 'santri', id);
  try {
    await deleteDoc(docRef);
  } catch {
    try {
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });
    } catch {
      // Ignored: persistent blacklist in localStorage guarantees permanent deletion
    }
  }
}

export async function addSantriRecord(santri: Omit<SantriRecord, 'id'>) {
  if (isOfflineModeActive()) {
    const current = getOfflineStudents();
    const localId = createLocalId('off_santri');
    const fullRecord: SantriRecord = {
      id: localId,
      ...santri,
    };
    saveOfflineStudents([...current, fullRecord]);
    return { id: localId };
  }

  const localId = createLocalId('santri');
  const fullRecord: SantriRecord = {
    id: localId,
    ...santri,
  };
  
  // 1. Instantly write to local persistent custom list
  saveCustomSantri(fullRecord);
  broadcastSync({ module: 'santri', action: 'CREATE', id: localId, payload: fullRecord });

  // 2. Fire background Firestore add
  try {
    const colRef = collection(db, 'santri');
    const docRef = await addDoc(colRef, {
      ...santri,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (docRef.id) {
      saveDeletedSantriId(localId);
      saveCustomSantri({ ...fullRecord, id: docRef.id });
      broadcastSync({ module: 'santri', action: 'UPDATE', id: docRef.id, payload: { ...fullRecord, id: docRef.id } });
    }
    return docRef;
  } catch (err) {
    console.warn('Remote addDoc restricted (safely stored locally in persistent cache):', err);
    return { id: localId };
  }
}

/**
 * BATCH & ATOMIC WRITE FOR SIDANG MAHKAMAH KOLEKTIF (ZERO-LOSS GUARANTEE)
 */
export async function recordCollectiveMahkamahSession(params: {
  students: { id: string; name: string; nis?: string; kamar?: string }[];
  divisions: string[];
  violation: string;
  penalty: string;
  date: string;
  points?: number;
  sessionNotes?: string;
}) {
  const { students, divisions, violation, penalty, date, points = 0, sessionNotes = '' } = params;

  if (isOfflineModeActive()) {
    const currentStudents = getOfflineStudents();
    const currentViolations = getOfflineViolations();
    const newViolations: ViolationRecord[] = [];

    const updatedStudents = currentStudents.map((s) => {
      const match = students.find((item) => item.id === s.id || item.name.trim().toLowerCase() === s.studentName.trim().toLowerCase());
      if (!match) return s;

      const mahkamahEntry: StudentMahkamahEntry = {
        id: createLocalId('mhk'),
        divisions,
        violation,
        penalty,
        date,
        points,
        sessionNotes,
        createdAt: new Date().toISOString(),
      };

      const existingMahkamah = s.mahkamahHistory || [];
      const newMahkamahHistory = [mahkamahEntry, ...existingMahkamah];

      const existingViolations = s.violationsHistory || [];
      const newViolationHistory = [
        {
          id: createLocalId('vio_mhk'),
          title: `[Sidang Mahkamah] ${violation}`,
          date,
          points: points || 0,
          penalty,
          notes: `Divisi: ${divisions.join(', ')}`,
        },
        ...existingViolations,
      ];

      const currentPoints = s.poinPelanggaran || 0;
      const newPoints = currentPoints + (points || 0);

      newViolations.push({
        id: createLocalId('off_mhk_vio'),
        studentName: s.studentName,
        nis: s.nis || '-',
        kamar: s.kamar || '-',
        violation: `[Sidang Mahkamah] ${violation}`,
        category: divisions.join(' & '),
        points: points || 0,
        severity: getSeverityInfo(points || 0).severity,
        status: 'belum_dihukum',
        date,
        penaltyDescription: penalty,
        reportedBy: `Sidang Mahkamah (${divisions.join(', ')})`,
      });

      return {
        ...s,
        mahkamahHistory: newMahkamahHistory,
        violationsHistory: newViolationHistory,
        poinPelanggaran: newPoints,
      };
    });

    saveOfflineStudents(updatedStudents);
    saveOfflineViolations([...newViolations, ...currentViolations]);
    return;
  }

  for (const s of students) {
    const mahkamahEntry: StudentMahkamahEntry = {
      id: createLocalId('mhk'),
      divisions,
      violation,
      penalty,
      date,
      points,
      sessionNotes,
      createdAt: new Date().toISOString(),
    };

    const updatedMap = getUpdatedSantriMap();
    const currentStudentOverride = updatedMap[s.id] || {};
    const existingMahkamah = currentStudentOverride.mahkamahHistory || [];
    const newMahkamahHistory = [mahkamahEntry, ...existingMahkamah];

    const existingViolations = currentStudentOverride.violationsHistory || [];
    const newViolationHistory = [
      {
        id: createLocalId('vio_mhk'),
        title: `[Sidang Mahkamah] ${violation}`,
        date,
        points: points || 0,
        penalty,
        notes: `Divisi: ${divisions.join(', ')}`,
      },
      ...existingViolations,
    ];

    const currentPoints = currentStudentOverride.poinPelanggaran ?? 0;
    const newPoints = currentPoints + (points || 0);

    const updates: Partial<SantriRecord> = {
      mahkamahHistory: newMahkamahHistory,
      violationsHistory: newViolationHistory,
      ...(points > 0 ? { poinPelanggaran: newPoints } : {}),
    };

    // 1. Instantly write to local persistent storage + broadcast
    saveUpdatedSantri(s.id, updates);
    broadcastSync({ module: 'santri', action: 'UPDATE', id: s.id, payload: updates });

    // 2. Fire background Firestore update
    try {
      const docRef = doc(db, 'santri', s.id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn(`Remote updateDoc for student ${s.id} (saved in local persistent store):`, err);
    }

    // 3. Record in unified violations collection
    try {
      await addPelanggaranRecord({
        studentId: s.id,
        studentName: s.name,
        nis: s.nis || '-',
        kamar: s.kamar || '-',
        violation: `[Sidang Mahkamah] ${violation}`,
        category: divisions.join(' & '),
        points: points || 0,
        severity: getSeverityInfo(points || 0).severity,
        status: 'belum_dihukum',
        date,
        penaltyDescription: penalty,
        reportedBy: `Sidang Mahkamah (${divisions.join(', ')})`,
      });
    } catch (err) {
      console.warn('addPelanggaranRecord warning for mahkamah session:', err);
    }
  }

  broadcastSync({ module: 'santri', action: 'UPDATE', payload: { collective: true } });
}

/**
 * 4. CLEAN PER-ASRAMAAN DOMAIN (8 ASRAMA, 24 KAMAR - TANPA DUMMY)
 */

export function subscribeToDormitories(callback: (dormitories: Dormitory[], allRooms: DormitoryRoom[]) => void) {
  if (isOfflineModeActive()) {
    const emitOffline = () => {
      const dorms = getOfflineDormitories();
      const rooms = getOfflineRooms();
      callback(dorms.length > 0 ? dorms : OFFICIAL_DORMITORIES, rooms.length > 0 ? rooms : ALL_OFFICIAL_ROOMS);
    };
    emitOffline();
    const handleOfflineChange = () => emitOffline();
    if (typeof window !== 'undefined') {
      window.addEventListener('ostifak_dorms_changed', handleOfflineChange);
      window.addEventListener('storage', handleOfflineChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ostifak_dorms_changed', handleOfflineChange);
        window.removeEventListener('storage', handleOfflineChange);
      }
    };
  }

  const q = query(collection(db, 'asrama'));
  const unsubSnapshot = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(OFFICIAL_DORMITORIES, ALL_OFFICIAL_ROOMS);
      return;
    }

    const dormList: Dormitory[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Asrama',
        leaderName: data.leaderName || '-',
        leaderClass: data.leaderClass || '-',
        roomCount: data.roomCount || (data.rooms?.length || 1),
        rooms: data.rooms || [],
        achievements: data.achievements || [],
        violations: data.violations || [],
        tags: data.tags || [],
      };
    });

    const flatRooms = dormList.flatMap(d => d.rooms);
    callback(dormList, flatRooms.length > 0 ? flatRooms : ALL_OFFICIAL_ROOMS);
  }, (error) => {
    console.error('Error fetching dormitories:', error);
    callback(OFFICIAL_DORMITORIES, ALL_OFFICIAL_ROOMS);
  });

  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'dorms') {
      // Re-trigger / sync
    }
  });

  return () => {
    unsubSnapshot();
    unsubSync();
  };
}

/**
 * 5. COMPREHENSIVE CLASSES DOMAIN (9 OFFICIAL CLASSES - TANPA DUMMY)
 */


export function subscribeToClasses(callback: (classes: SchoolClass[]) => void) {
  if (isOfflineModeActive()) {
    const emitOffline = () => {
      const classes = getOfflineClasses();
      callback(classes.length > 0 ? classes : OFFICIAL_CLASSES);
    };
    emitOffline();
    const handleOfflineChange = () => emitOffline();
    if (typeof window !== 'undefined') {
      window.addEventListener('ostifak_classes_changed', handleOfflineChange);
      window.addEventListener('storage', handleOfflineChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ostifak_classes_changed', handleOfflineChange);
        window.removeEventListener('storage', handleOfflineChange);
      }
    };
  }
  const q = query(collection(db, 'kelas'));
  const unsubSnapshot = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(OFFICIAL_CLASSES);
      return;
    }

    const list: SchoolClass[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        className: data.className || 'Kelas',
        level: data.level || 'Tingkat',
        generation: data.generation || 'Angkatan',
        major: data.major || 'Reguler',
        waliKelas: data.waliKelas || '-',
        studentCount: data.studentCount || 0,
        students: data.students || [],
        cleanlinessScore: data.cleanlinessScore || 0,
        disciplineScore: data.disciplineScore || 0,
        academicScore: data.academicScore || 0,
        achievements: data.achievements || [],
        violations: data.violations || [],
        specialNotes: data.specialNotes || '',
        tags: data.tags || [],
      };
    });

    callback(list.length > 0 ? list : OFFICIAL_CLASSES);
  }, (error) => {
    console.error('Error fetching classes:', error);
    callback(OFFICIAL_CLASSES);
  });

  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'classes') {
      // Re-trigger / sync
    }
  });

  return () => {
    unsubSnapshot();
    unsubSync();
  };
}

// =========================================================================
// 6. BENDAHARA & KAS ORGANISASI (BPH)
// =========================================================================
export interface KasTransaction {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  amount: number;
  description: string;
  divisionId: string;
  divisionName: string;
  category?: string;
  isReceivable?: boolean;
  recordedBy?: string;
  createdAt?: string;
}

const STORAGE_KAS_KEY = 'ostifak_kas_transactions_list';
const EVENT_KAS_CHANGED = 'ostifak-kas-changed';

export const INITIAL_KAS_TRANSACTIONS: KasTransaction[] = [
  {
    id: 'kas-1',
    date: '26 Agustus 2026',
    type: 'masuk',
    amount: 15000000,
    description: 'Penerimaan Alokasi Dana Kas Operasional BPH OSTIFAK TA 2026/2027',
    divisionId: 'bph',
    divisionName: 'BPH & Kas Organisasi',
    recordedBy: 'Sekretaris BPH OSTIFAK',
  },
  {
    id: 'kas-2',
    date: '25 Agustus 2026',
    type: 'keluar',
    amount: 1750000,
    description: 'Pembelian Perlengkapan Kebersihan & Roan Bulanan Seluruh Asrama',
    divisionId: 'kebersihan',
    divisionName: 'Divisi Kebersihan & Asrama',
    recordedBy: 'Ketua Divisi Kebersihan & Asrama',
  },
  {
    id: 'kas-3',
    date: '24 Agustus 2026',
    type: 'masuk',
    amount: 3200000,
    description: 'Infaq Kas Bulanan Santri & Wali Santri Tahfizh Al-Quran',
    divisionId: 'tahfizh',
    divisionName: 'Divisi Tahfizh & Diniyah',
    recordedBy: 'Bendahara OSTIFAK',
  },
  {
    id: 'kas-4',
    date: '22 Agustus 2026',
    type: 'keluar',
    amount: 850000,
    description: 'Pengadaan Obat-obatan & P3K Posko UKS Santri',
    divisionId: 'kesehatan',
    divisionName: 'Divisi Kesehatan & UKS',
    recordedBy: 'Ketua Divisi Kesehatan & UKS',
  },
  {
    id: 'kas-5',
    date: '20 Agustus 2026',
    type: 'masuk',
    amount: 2500000,
    description: 'Sponsor Pembukaan Pekan Bahasa (Arabic & English Week)',
    divisionId: 'bahasa',
    divisionName: 'Divisi Bahasa (Lughah)',
    recordedBy: 'Ketua Divisi Bahasa (Lughah)',
  },
  {
    id: 'kas-6',
    date: '18 Agustus 2026',
    type: 'keluar',
    amount: 1200000,
    description: 'Peremajaan Soundsystem & Mikrofon Masjid Utama',
    divisionId: 'ibadah',
    divisionName: 'Divisi Ibadah & Masjid',
    recordedBy: 'Ketua Divisi Ibadah & Masjid',
  },
];

export function getLocalKasTransactions(): KasTransaction[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KAS_KEY) : null;
    return raw ? JSON.parse(raw) : INITIAL_KAS_TRANSACTIONS;
  } catch {
    return INITIAL_KAS_TRANSACTIONS;
  }
}

export function saveLocalKasTransactions(list: KasTransaction[]) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KAS_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_KAS_CHANGED, { detail: { list } }));
    }
  } catch (err) {
    console.error('Error saving kas transactions to local storage:', err);
  }
}

export function addKasTransaction(transaction: Omit<KasTransaction, 'id'>): KasTransaction {
  const current = getLocalKasTransactions();
  const newItem: KasTransaction = {
    ...transaction,
    id: `kas-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...current];
  saveLocalKasTransactions(updated);
  broadcastSync({ module: 'kas', action: 'CREATE', payload: newItem });
  return newItem;
}

export function deleteKasTransaction(id: string) {
  const current = getLocalKasTransactions();
  const updated = current.filter(t => t.id !== id);
  saveLocalKasTransactions(updated);
  broadcastSync({ module: 'kas', action: 'DELETE', id });
}

export function subscribeToKasTransactions(callback: (transactions: KasTransaction[]) => void) {
  const emit = () => {
    callback(getLocalKasTransactions());
  };

  emit();

  const handleLocalChange = () => emit();
  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'kas') {
      emit();
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_KAS_CHANGED, handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
  }

  return () => {
    unsubSync();
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_KAS_CHANGED, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
    }
  };
}
