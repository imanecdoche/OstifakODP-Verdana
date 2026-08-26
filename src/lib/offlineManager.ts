/**
 * Offline Mode Manager & Storage Isolation Service
 * OSTIFAK ODP — 100% LocalStorage Isolation (100 MB Quota)
 */

import { UserProfile, ViolationRecord, WorkProgram, MudirDirective } from '../types';
import { 
  mockViolations, 
  mockWorkPrograms, 
  mockMudirDirectives, 
  OFFICIAL_ACCOUNTS 
} from '../data/mockData';
import { 
  SchoolClass, 
  OFFICIAL_CLASSES, 
  Dormitory, 
  DormitoryRoom, 
  OFFICIAL_DORMITORIES, 
  ALL_OFFICIAL_ROOMS,
  SantriRecord
} from './firestoreService';

// Storage Keys for Offline Isolation
export const OFFLINE_KEYS = {
  IS_OFFLINE: 'ostifak_offline_mode',
  STORAGE_QUOTA: 'ostifak_offline_storage_quota',
  USER: 'ostifak_offline_user',
  SANTRI: 'ostifak_offline_students',
  VIOLATIONS: 'ostifak_offline_violations',
  PROGRAMS: 'ostifak_offline_programs',
  DIRECTIVES: 'ostifak_offline_directives',
  DORMITORIES: 'ostifak_offline_dormitories',
  ROOMS: 'ostifak_offline_rooms',
  CLASSES: 'ostifak_offline_classes',
  ACHIEVEMENTS: 'ostifak_offline_achievements',
  DELETED_VIOLATIONS: 'ostifak_offline_deleted_violations',
  UPDATED_VIOLATIONS: 'ostifak_offline_updated_violations',
  MAHKAMAH_SESSIONS: 'ostifak_offline_mahkamah_sessions',
  SESSION_RECORDS: 'ostifak_offline_session_records',
} as const;

export const OFFLINE_STORAGE_QUOTA_LABEL = '100 MB';

/**
 * Check whether the application is currently running in Total Offline Mode
 */
export function isOfflineModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(OFFLINE_KEYS.IS_OFFLINE) === 'true';
  } catch {
    return false;
  }
}

/**
 * Default Offline User Profile for local operations
 */
export const DEFAULT_OFFLINE_USER: UserProfile = {
  id: 'offline_operator',
  name: 'Petugas Lapangan (Mode Offline)',
  email: 'offline@ostifak.edu',
  role: 'admin',
  roleTitle: 'Administrator Offline',
  division: 'keamanan',
  assignedDivision: 'keamanan',
};

/**
 * Initialize and seed localStorage with a complete base dataset if not already present
 */
export function initializeOfflineStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Quota Marker
    localStorage.setItem(OFFLINE_KEYS.STORAGE_QUOTA, OFFLINE_STORAGE_QUOTA_LABEL);

    // 2. Santri Records
    if (!localStorage.getItem(OFFLINE_KEYS.SANTRI)) {
      // Try to copy from online local cache if available, or fall back to empty array
      const onlineCache = localStorage.getItem('ostifak_custom_santri_list');
      const baseSantri = onlineCache ? JSON.parse(onlineCache) : [];
      localStorage.setItem(OFFLINE_KEYS.SANTRI, JSON.stringify(baseSantri));
    }

    // 3. Violations Records
    if (!localStorage.getItem(OFFLINE_KEYS.VIOLATIONS)) {
      const onlineCache = localStorage.getItem('ostifak_local_violations');
      const baseViolations = onlineCache ? JSON.parse(onlineCache) : mockViolations;
      localStorage.setItem(OFFLINE_KEYS.VIOLATIONS, JSON.stringify(baseViolations));
    }

    // 4. Work Programs
    if (!localStorage.getItem(OFFLINE_KEYS.PROGRAMS)) {
      localStorage.setItem(OFFLINE_KEYS.PROGRAMS, JSON.stringify(mockWorkPrograms));
    }

    // 5. Mudir Directives
    if (!localStorage.getItem(OFFLINE_KEYS.DIRECTIVES)) {
      localStorage.setItem(OFFLINE_KEYS.DIRECTIVES, JSON.stringify(mockMudirDirectives));
    }

    // 6. Dormitories & Rooms
    if (!localStorage.getItem(OFFLINE_KEYS.DORMITORIES)) {
      localStorage.setItem(OFFLINE_KEYS.DORMITORIES, JSON.stringify(OFFICIAL_DORMITORIES));
    }
    if (!localStorage.getItem(OFFLINE_KEYS.ROOMS)) {
      localStorage.setItem(OFFLINE_KEYS.ROOMS, JSON.stringify(ALL_OFFICIAL_ROOMS));
    }

    // 7. Classes
    if (!localStorage.getItem(OFFLINE_KEYS.CLASSES)) {
      localStorage.setItem(OFFLINE_KEYS.CLASSES, JSON.stringify(OFFICIAL_CLASSES));
    }
  } catch (err) {
    console.error('Error initializing offline storage:', err);
  }
}

/**
 * Enable Offline Mode, seed local storage, set active user and persist offline flag
 */
export function enableOfflineMode(user?: UserProfile): UserProfile {
  const activeUser = user || DEFAULT_OFFLINE_USER;
  try {
    localStorage.setItem(OFFLINE_KEYS.IS_OFFLINE, 'true');
    localStorage.setItem(OFFLINE_KEYS.STORAGE_QUOTA, OFFLINE_STORAGE_QUOTA_LABEL);
    localStorage.setItem(OFFLINE_KEYS.USER, JSON.stringify(activeUser));
    localStorage.setItem('ostifak_auth_user', JSON.stringify(activeUser));
    initializeOfflineStorage();
    window.dispatchEvent(new CustomEvent('ostifak-offline-mode-changed', { detail: { isOffline: true } }));
  } catch (err) {
    console.error('Error enabling offline mode:', err);
  }
  return activeUser;
}

/**
 * Disable Offline Mode and return to standard mode
 */
export function disableOfflineMode(): void {
  try {
    localStorage.removeItem(OFFLINE_KEYS.IS_OFFLINE);
    localStorage.removeItem(OFFLINE_KEYS.USER);
    window.dispatchEvent(new CustomEvent('ostifak-offline-mode-changed', { detail: { isOffline: false } }));
  } catch (err) {
    console.error('Error disabling offline mode:', err);
  }
}

// -------------------------------------------------------------
// OFFLINE STORAGE GETTERS & SETTERS (Strictly Isolated LocalStorage)
// -------------------------------------------------------------

export function getOfflineStudents(): SantriRecord[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.SANTRI);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline students:', e);
  }
  return mockStudents as unknown as SantriRecord[];
}

export function saveOfflineStudents(students: SantriRecord[]): void {
  try {
    localStorage.setItem(OFFLINE_KEYS.SANTRI, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent('ostifak_santri_changed', { detail: { isOffline: true } }));
  } catch (e) {
    console.error('Error saving offline students:', e);
  }
}

export function getOfflineViolations(): ViolationRecord[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.VIOLATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline violations:', e);
  }
  return mockViolations as unknown as ViolationRecord[];
}

export function saveOfflineViolations(violations: ViolationRecord[]): void {
  try {
    localStorage.setItem(OFFLINE_KEYS.VIOLATIONS, JSON.stringify(violations));
    window.dispatchEvent(new CustomEvent('ostifak_violations_changed', { detail: { isOffline: true } }));
  } catch (e) {
    console.error('Error saving offline violations:', e);
  }
}

export function getOfflinePrograms(): WorkProgram[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.PROGRAMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline programs:', e);
  }
  return mockWorkPrograms as unknown as WorkProgram[];
}

export function saveOfflinePrograms(programs: WorkProgram[]): void {
  try {
    localStorage.setItem(OFFLINE_KEYS.PROGRAMS, JSON.stringify(programs));
    window.dispatchEvent(new CustomEvent('ostifak_programs_changed', { detail: { isOffline: true } }));
  } catch (e) {
    console.error('Error saving offline programs:', e);
  }
}

export function getOfflineDirectives(): MudirDirective[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.DIRECTIVES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline directives:', e);
  }
  return mockDirectives as unknown as MudirDirective[];
}

export function saveOfflineDirectives(directives: MudirDirective[]): void {
  try {
    localStorage.setItem(OFFLINE_KEYS.DIRECTIVES, JSON.stringify(directives));
    window.dispatchEvent(new CustomEvent('ostifak_directives_changed', { detail: { isOffline: true } }));
  } catch (e) {
    console.error('Error saving offline directives:', e);
  }
}

export function getOfflineDormitories(): Dormitory[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.DORMITORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline dormitories:', e);
  }
  return OFFICIAL_DORMITORIES;
}

export function getOfflineRooms(): DormitoryRoom[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.ROOMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline rooms:', e);
  }
  return ALL_OFFICIAL_ROOMS;
}

export function saveOfflineDormitoriesAndRooms(dorms: Dormitory[], rooms: DormitoryRoom[]): void {
  try {
    localStorage.setItem(OFFLINE_KEYS.DORMITORIES, JSON.stringify(dorms));
    localStorage.setItem(OFFLINE_KEYS.ROOMS, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent('ostifak_dorms_changed', { detail: { isOffline: true } }));
  } catch (e) {
    console.error('Error saving offline dorms/rooms:', e);
  }
}

export function getOfflineClasses(): SchoolClass[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline classes:', e);
  }
  return OFFICIAL_CLASSES;
}

export function saveOfflineClasses(classes: SchoolClass[]): void {
  try {
    localStorage.setItem(OFFLINE_KEYS.CLASSES, JSON.stringify(classes));
    window.dispatchEvent(new CustomEvent('ostifak_classes_changed', { detail: { isOffline: true } }));
  } catch (e) {
    console.error('Error saving offline classes:', e);
  }
}
