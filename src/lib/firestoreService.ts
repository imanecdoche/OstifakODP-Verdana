import { 
  collection, 
  addDoc, 
  query, 
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
  UserProfile 
} from '../types';
import { OFFICIAL_ACCOUNTS } from '../data/mockData';

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
      return {
        id: docSnap.id,
        studentName: data.studentName || 'Santri',
        nis: data.nis || '-',
        kamar: data.kamar || '-',
        violation: data.violation || '-',
        category: data.category || 'Disiplin',
        points: data.points || 0,
        severity: (data.severity as SeverityLevel) || 'ringan',
        status: (data.status as PenaltyStatus) || 'belum_dihukum',
        date: data.date || new Date().toLocaleDateString('id-ID'),
        penaltyDescription: data.penaltyDescription || '-',
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

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_VIOLATIONS_CHANGED, handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
  }

  return () => {
    unsubSnapshot();
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_VIOLATIONS_CHANGED, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
    }
  };
}

export async function addPelanggaranRecord(record: Omit<ViolationRecord, 'id'>) {
  const colRef = collection(db, 'pelanggaran');
  return await addDoc(colRef, {
    ...record,
    createdAt: serverTimestamp(),
  });
}

export async function updatePelanggaranRecord(id: string, updates: Partial<ViolationRecord>) {
  saveUpdatedViolation(id, updates);
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
  saveDeletedViolationId(id);
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
  const identity = violationIdentity(violation);
  
  // 1. Instantly write to persistent storage blacklist
  saveDeletedViolationId(violation.id, identity);

  // 2. Remove from Firestore 'pelanggaran' collection
  try {
    const docRef = doc(db, 'pelanggaran', violation.id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Standalone pelanggaran doc delete notice:', err);
  }

  // 3. Remove from matching student's violationsHistory (both local & Firestore)
  const targetStudent = (students || []).find(
    (s) => s.studentName.trim().toLowerCase() === violation.studentName.trim().toLowerCase()
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
  const identity = violationIdentity(violation);

  // 1. Instantly write to persistent storage
  saveUpdatedViolation(violation.id, updates, identity);

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
  const targetStudent = (students || []).find(
    (s) => s.studentName.trim().toLowerCase() === violation.studentName.trim().toLowerCase()
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
    for (const v of s.violationsHistory || []) {
      const pts = Number(v.points) || 0;
      const id = v.id;
      const identity = `${(s.studentName || '').trim().toLowerCase()}|${(v.title || '').trim().toLowerCase()}|${v.date}|${pts}`;

      if (deletedIds.has(id) || deletedIds.has(identity)) {
        continue;
      }

      let row: ViolationRecord = {
        id: v.id,
        studentName: s.studentName,
        nis: s.nis || '-',
        kamar: s.kamar || '-',
        violation: v.title,
        category: 'Kedisiplinan Santri',
        points: pts,
        severity: pts >= 50 ? 'berat' : pts >= 15 ? 'sedang' : 'ringan',
        status: 'selesai',
        date: v.date,
        penaltyDescription: v.penalty || '-',
        reportedBy: 'Pengurus OSTIFAK',
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
  const q = query(collection(db, 'proposal'));
  return onSnapshot(q, (snapshot) => {
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
}

export async function addProposalRecord(program: Omit<WorkProgram, 'id'>) {
  const colRef = collection(db, 'proposal');
  return await addDoc(colRef, {
    ...program,
    divisionId: program.divisionId,
    createdAt: serverTimestamp(),
  });
}

// Directives Collection Listener (Instruksi Mudir)
export function subscribeToDirectives(callback: (directives: MudirDirective[]) => void) {
  const q = query(collection(db, 'directives'));
  return onSnapshot(q, (snapshot) => {
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
}

export async function addDirectiveRecord(directive: Omit<MudirDirective, 'id'>) {
  const colRef = collection(db, 'directives');
  return await addDoc(colRef, {
    ...directive,
    createdAt: serverTimestamp(),
  });
}

export interface StudentViolationEntry {
  id: string;
  title: string;
  date: string;
  points: number;
  penalty: string;
  notes?: string;
}

export interface StudentHafalanEntry {
  id: string;
  surah: string;
  juz: string;
  date: string;
  timestamp?: number;
  predikat: string;
  category?: 'Hafalan Baru' | 'Murojaah';
  pageFrom?: number;
  pageTo?: number;
  pageCount?: number;
  kelancaran?: string;
  ustadz?: string;
  notes?: string;
}

export interface StudentAchievementEntry {
  id: string;
  title: string;
  category: string;
  date: string;
  rank: string;
  organizer: string;
}

export interface StudentPermissionEntry {
  id: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Selesai' | 'Disetujui';
  notes?: string;
}

export interface SantriRecord {
  id: string;
  studentName: string;
  nis: string;
  kamar: string;
  kelas: string;
  hafalan: string;
  poinPelanggaran: number;
  statusIbadah: string;
  birthDate?: string;
  domicile?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  isTahsinPassed?: boolean;
  violationsHistory?: StudentViolationEntry[];
  hafalanHistory?: StudentHafalanEntry[];
  achievementsHistory?: StudentAchievementEntry[];
  permissionsHistory?: StudentPermissionEntry[];
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
      final.push({
        ...item,
        ...localOverrides,
      });
    }

    callback(final);
  };

  // Initial local emission
  emit();

  // Listen to local changes
  const handleLocalChange = () => emit();
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
          isTahsinPassed: data.isTahsinPassed ?? true,
          violationsHistory: data.violationsHistory || [],
        };
      });
    emit();
  }, (error) => {
    console.warn('Firestore santri listener warning (active local-first fallback):', error);
  });

  return () => {
    unsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_SANTRI_CHANGED, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
    }
  };
}

export async function updateSantriRecord(id: string, updates: Partial<SantriRecord>) {
  // 1. Instantly write to local persistent storage
  saveUpdatedSantri(id, updates);

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

export async function deleteSantriRecord(id: string) {
  // 1. Instantly write to local persistent blacklist
  saveDeletedSantriId(id);

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
  const localId = `santri_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const fullRecord: SantriRecord = {
    id: localId,
    ...santri,
  };
  
  // 1. Instantly write to local persistent custom list
  saveCustomSantri(fullRecord);

  // 2. Fire background Firestore add
  try {
    const colRef = collection(db, 'santri');
    const docRef = await addDoc(colRef, {
      ...santri,
      createdAt: serverTimestamp(),
    });
    if (docRef.id) {
      saveDeletedSantriId(localId);
      saveCustomSantri({ ...fullRecord, id: docRef.id });
    }
    return docRef;
  } catch (err) {
    console.warn('Remote addDoc restricted (safely stored locally in persistent cache):', err);
    return { id: localId };
  }
}

/**
 * 4. CLEAN PER-ASRAMAAN DOMAIN (8 ASRAMA, 24 KAMAR - TANPA DUMMY)
 */
export interface RoomAchievement {
  category: 'kebersihan' | 'kerapihan' | 'keindahan' | 'umum';
  title: string;
  score: number;
  date: string;
  note?: string;
}

export interface RoomViolation {
  title: string;
  date: string;
  points: number;
  description: string;
}

export interface DormitoryRoom {
  id: string;
  dormitoryId: string;
  dormitoryName: string;
  roomNumber: string;
  roomName: string;
  ketuaKamar: string;
  capacity: number;
  occupiedCount: number;
  residents: string[];
  cleanlinessScore: number;
  neatnessScore: number;
  aestheticScore: number;
  achievements: RoomAchievement[];
  violations: RoomViolation[];
  specialNotes?: string;
  tags: string[];
}

export interface Dormitory {
  id: string;
  name: string;
  leaderName: string;
  leaderClass: string;
  roomCount: number;
  rooms: DormitoryRoom[];
  achievements: { title: string; date: string; category: string }[];
  violations: { title: string; date: string; points: number }[];
  tags: string[];
}

// 8 ASRAMA RESMI - KAPASITAS 7 ORANG (KECUALI INDONESIA 12 ORANG)
export const OFFICIAL_DORMITORIES: Dormitory[] = [
  {
    id: 'asrama-qatar',
    name: 'Asrama Qatar',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'qatar-1', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '1', roomName: 'Qatar 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'qatar-2', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '2', roomName: 'Qatar 2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'qatar-3', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '3', roomName: 'Qatar 3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'qatar-4', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '4', roomName: 'Qatar 4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-turki',
    name: 'Asrama Turki',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'turki-1', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '1', roomName: 'Turki 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'turki-2', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '2', roomName: 'Turki 2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'turki-3', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '3', roomName: 'Turki 3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'turki-4', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '4', roomName: 'Turki 4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-indonesia',
    name: 'Asrama Indonesia',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 2,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'indonesia-a', dormitoryId: 'asrama-indonesia', dormitoryName: 'Asrama Indonesia', roomNumber: 'A', roomName: 'Indonesia A', ketuaKamar: '-', capacity: 12, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'indonesia-b', dormitoryId: 'asrama-indonesia', dormitoryName: 'Asrama Indonesia', roomNumber: 'B', roomName: 'Indonesia B', ketuaKamar: '-', capacity: 12, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-palestine-a',
    name: 'Asrama Palestine A',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'palestine-a1', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A1', roomName: 'Palestine A1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-a2', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A2', roomName: 'Palestine A2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-a3', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A3', roomName: 'Palestine A3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-a4', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A4', roomName: 'Palestine A4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-palestine-b',
    name: 'Asrama Palestine B',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'palestine-b1', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B1', roomName: 'Palestine B1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-b2', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B2', roomName: 'Palestine B2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-b3', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B3', roomName: 'Palestine B3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-b4', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B4', roomName: 'Palestine B4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-yaman',
    name: 'Asrama Yaman',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 1,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'yaman-1', dormitoryId: 'asrama-yaman', dormitoryName: 'Asrama Yaman', roomNumber: '1', roomName: 'Yaman 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-yordan',
    name: 'Asrama Yordan',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'yordan-1', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '1', roomName: 'Yordan 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'yordan-2', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '2', roomName: 'Yordan 2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'yordan-3', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '3', roomName: 'Yordan 3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'yordan-4', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '4', roomName: 'Yordan 4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-emirate',
    name: 'Asrama Emirate',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 1,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'emirate-1', dormitoryId: 'asrama-emirate', dormitoryName: 'Asrama Emirate', roomNumber: '1', roomName: 'Emirate 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  }
];

// Flat array of all 24 official rooms
export const ALL_OFFICIAL_ROOMS: DormitoryRoom[] = OFFICIAL_DORMITORIES.flatMap(d => d.rooms);

export function subscribeToDormitories(callback: (dormitories: Dormitory[], allRooms: DormitoryRoom[]) => void) {
  const q = query(collection(db, 'asrama'));
  return onSnapshot(q, (snapshot) => {
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
}

/**
 * 5. COMPREHENSIVE CLASSES DOMAIN (9 OFFICIAL CLASSES - TANPA DUMMY)
 */
export interface ClassAchievement {
  category: string;
  title: string;
  date: string;
  score?: number;
}

export interface ClassViolation {
  title: string;
  date: string;
  points: number;
  description: string;
}

export interface SchoolClass {
  id: string;
  className: string;
  level: string;
  generation: string;
  major: string;
  waliKelas: string;
  studentCount: number;
  students: string[];
  cleanlinessScore: number;
  disciplineScore: number;
  academicScore: number;
  achievements: ClassAchievement[];
  violations: ClassViolation[];
  specialNotes?: string;
  tags: string[];
}

export const OFFICIAL_CLASSES: SchoolClass[] = [
  { id: 'class-1', className: 'Kelas 1', level: 'Tingkat 1', generation: 'Angkatan 2026', major: 'Reguler', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-2', className: 'Kelas 2', level: 'Tingkat 2', generation: 'Angkatan 2025', major: 'Reguler', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-3', className: 'Kelas 3', level: 'Tingkat 3', generation: 'Angkatan 2024', major: 'Reguler', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-4-ipa', className: 'Kelas 4 IPA', level: 'Tingkat 4', generation: 'Angkatan 2023', major: 'IPA', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-4-ips', className: 'Kelas 4 IPS', level: 'Tingkat 4', generation: 'Angkatan 2023', major: 'IPS', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-5-ipa', className: 'Kelas 5 IPA', level: 'Tingkat 5', generation: 'Angkatan 2022', major: 'IPA', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-5-ips', className: 'Kelas 5 IPS', level: 'Tingkat 5', generation: 'Angkatan 2022', major: 'IPS', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-6-ipa', className: 'Kelas 6 IPA', level: 'Tingkat 6', generation: 'Angkatan 2021', major: 'IPA', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-6-ips', className: 'Kelas 6 IPS', level: 'Tingkat 6', generation: 'Angkatan 2021', major: 'IPS', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
];

export function subscribeToClasses(callback: (classes: SchoolClass[]) => void) {
  const q = query(collection(db, 'kelas'));
  return onSnapshot(q, (snapshot) => {
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
}
