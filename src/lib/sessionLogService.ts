import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';
import { broadcastSync, subscribeToSyncMessages } from './realtimeSync';
import { isOfflineModeActive } from './offlineManager';

export interface SessionActionLog {
  id: string;
  time: string;
  module: string;
  actionType: string;
  description: string;
  status: 'Sukses' | 'Terverifikasi' | 'Peringatan' | 'Dibatalkan';
}

export interface SessionRecord {
  id: string;
  accountEmail: string;
  accountName: string;
  roleTitle: string;
  dateDay: string;
  loginTime: string;
  loginTimestamp: number;
  logoutTime?: string;
  duration: string;
  isActive: boolean;
  devicePc: string;
  browser: string;
  ipAddress: string;
  macAddress: string;
  locationName: string;
  coordinates: string;
  actions: SessionActionLog[];
}

const STORAGE_KEY_RECORDS = 'ostifak_real_session_records';
const STORAGE_KEY_ACTIVE_ID = 'ostifak_active_session_id';

// Helper to detect real device name from navigator
export const getRealDeviceName = (): string => {
  if (typeof window === 'undefined') return 'Perangkat Komputer Standar';
  const ua = navigator.userAgent;
  const platform = navigator.platform || '';

  if (/Android/i.test(ua)) {
    return `Smartphone Android (${window.screen.width}x${window.screen.height})`;
  }
  if (/iPhone/i.test(ua)) {
    return `Apple iPhone iOS (${window.screen.width}x${window.screen.height})`;
  }
  if (/iPad/i.test(ua)) {
    return `Apple iPad (${window.screen.width}x${window.screen.height})`;
  }
  if (/Macintosh|Mac OS X/i.test(ua)) {
    return `Apple Mac (${platform || 'macOS'})`;
  }
  if (/Windows/i.test(ua)) {
    return `Windows PC (${platform || 'Win64'})`;
  }
  if (/Linux/i.test(ua)) {
    return `Linux PC (${platform || 'x86_64'})`;
  }
  return 'Desktop / Laptop Workstation';
};

// Helper to detect real browser name & version
export const getRealBrowserName = (): string => {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;

  let browser = 'Browser Web';
  let version = '';

  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Microsoft Edge';
    version = ua.match(/Edg\/([0-9.]+)/i)?.[1] || '';
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = 'Google Chrome';
    version = ua.match(/Chrome\/([0-9.]+)/i)?.[1] || '';
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
    version = ua.match(/Version\/([0-9.]+)/i)?.[1] || '';
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = 'Mozilla Firefox';
    version = ua.match(/Firefox\/([0-9.]+)/i)?.[1] || '';
  }

  const bit = navigator.userAgent.includes('WOW64') || navigator.userAgent.includes('Win64') || navigator.userAgent.includes('x86_64') ? '(64-bit)' : '';
  return `${browser} ${version} ${bit}`.trim();
};

// Helper to format date in Indonesian (e.g., "Rabu, 26 Agustus 2026")
export const formatIndonesianDate = (date: Date): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
};

// Helper to format time in HH:mm:ss WIB
export const formatTimeWithSeconds = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${m}:${s} WIB`;
};

// Helper to format human-readable duration
export const formatDurationFromTimestamps = (startMs: number, endMs: number): string => {
  const diffSec = Math.max(0, Math.floor((endMs - startMs) / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} Jam`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes} Menit`);
  parts.push(`${seconds} Detik`);
  return parts.join(' ');
};

// Cleanse any hallucinated/fictional coordinates from cached records
const sanitizeRecord = (rec: SessionRecord): SessionRecord => {
  let coordinates = rec.coordinates;
  let locationName = rec.locationName;
  let macAddress = rec.macAddress;

  if (coordinates && coordinates.includes('-6.372541')) {
    coordinates = '-';
  }
  if (locationName && (locationName.includes('Fajrul Karim') || locationName.includes('Depok'))) {
    locationName = '-';
  }
  if (macAddress && macAddress.includes('F4:D4:88:5B:31:C2')) {
    macAddress = '-';
  }

  return {
    ...rec,
    coordinates: coordinates || '-',
    locationName: locationName || '-',
    macAddress: macAddress || '-',
  };
};

// Read all stored real session records from local cache
export const getStoredSessionRecords = (): SessionRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeRecord);
  } catch (e) {
    console.error('Error reading session records:', e);
    return [];
  }
};

// Save session records to localStorage & dispatch custom update event
export const saveSessionRecords = (records: SessionRecord[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = records.map(sanitizeRecord);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('ostifak_session_records_updated'));
  } catch (e) {
    console.error('Error saving session records:', e);
  }
};

/**
 * Real-time multi-device subscription to session records.
 * Uses Cloud Firestore with local optimistic fallback and BroadcastChannel.
 */
export const subscribeToSessionRecords = (callback: (records: SessionRecord[]) => void): (() => void) => {
  // 1. Emit local cached records immediately
  callback(getStoredSessionRecords());

  // 2. Listen to cross-tab / local network sync events
  const handleLocalSync = () => {
    callback(getStoredSessionRecords());
  };

  const unsubSync = subscribeToSyncMessages((msg) => {
    if (msg.module === 'sessions') {
      callback(getStoredSessionRecords());
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('ostifak_session_records_updated', handleLocalSync);
    window.addEventListener('storage', handleLocalSync);
  }

  // If running in total offline mode, skip remote Firestore listener
  if (isOfflineModeActive()) {
    return () => {
      unsubSync();
      if (typeof window !== 'undefined') {
        window.removeEventListener('ostifak_session_records_updated', handleLocalSync);
        window.removeEventListener('storage', handleLocalSync);
      }
    };
  }

  // 3. Listen to Firestore Cloud 'sessions' collection real-time
  const q = query(collection(db, 'sessions'), orderBy('loginTimestamp', 'desc'), limit(100));
  const unsubFirestore = onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteSessions: SessionRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return sanitizeRecord({
            id: d.id,
            accountEmail: data.accountEmail || '-',
            accountName: data.accountName || 'Pengguna',
            roleTitle: data.roleTitle || 'Pengurus',
            dateDay: data.dateDay || '',
            loginTime: data.loginTime || '',
            loginTimestamp: Number(data.loginTimestamp) || Date.now(),
            logoutTime: data.logoutTime,
            duration: data.duration || 'Sesi Sedang Aktif',
            isActive: Boolean(data.isActive),
            devicePc: data.devicePc || getRealDeviceName(),
            browser: data.browser || getRealBrowserName(),
            ipAddress: data.ipAddress || '-',
            macAddress: data.macAddress || '-',
            locationName: data.locationName || '-',
            coordinates: data.coordinates || '-',
            actions: Array.isArray(data.actions) ? data.actions : [],
          });
        });

        // Merge remote with local active session
        const localActiveId = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ACTIVE_ID) : null;
        const localRecords = getStoredSessionRecords();
        const activeLocal = localRecords.find((s) => s.id === localActiveId && s.isActive);

        const mergedMap = new Map<string, SessionRecord>();
        remoteSessions.forEach((s) => mergedMap.set(s.id, s));
        if (activeLocal) {
          mergedMap.set(activeLocal.id, activeLocal);
        }

        const mergedList = Array.from(mergedMap.values()).sort((a, b) => b.loginTimestamp - a.loginTimestamp);
        saveSessionRecords(mergedList);
        callback(mergedList);
      }
    },
    (err) => {
      console.warn('Firestore session sync listener notice:', err);
    }
  );

  return () => {
    unsubFirestore();
    unsubSync();
    if (typeof window !== 'undefined') {
      window.removeEventListener('ostifak_session_records_updated', handleLocalSync);
      window.removeEventListener('storage', handleLocalSync);
    }
  };
};

// Optional real geolocation capture without guessing or hallucinating
export const fetchRealGeolocationIfAllowed = (sessionId: string): void => {
  if (typeof window === 'undefined' || !navigator.geolocation) return;

  try {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!pos || !pos.coords) return;
        const { latitude, longitude } = pos.coords;
        const coordStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        const locStr = `Koordinat GPS (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;
        
        const records = getStoredSessionRecords();
        const updated = records.map((rec) => {
          if (rec.id === sessionId) {
            return {
              ...rec,
              coordinates: coordStr,
              locationName: locStr,
            };
          }
          return rec;
        });
        // Sync to cloud Firestore (skipped in offline mode)
        if (!isOfflineModeActive()) {
          try {
            const docRef = doc(db, 'sessions', sessionId);
            updateDoc(docRef, {
              coordinates: coordStr,
              locationName: locStr,
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          } catch {}
        }

        broadcastSync({ module: 'sessions', action: 'UPDATE', id: sessionId });
      },
      () => {
        // Fallback: If permission is denied or unavailable, stay as '-'
      },
      { timeout: 4000, maximumAge: 60000 }
    );
  } catch {}
};

// Initialize / Record a new live login session
export const recordLoginSession = (user: UserProfile): SessionRecord => {
  const now = new Date();
  const sessionId = `ses-${now.getTime()}`;
  const nowMs = now.getTime();

  const hostname = window.location.hostname || '127.0.0.1';
  const port = window.location.port ? `:${window.location.port}` : '';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

  const ipDisplay = isLocal
    ? `${hostname}${port} (Local Network Access)`
    : `${hostname} (Cloud Hosting Gateway)`;

  const newSession: SessionRecord = {
    id: sessionId,
    accountEmail: user.email || `${user.id}@ostifak.edu`,
    accountName: user.name,
    roleTitle: user.role === 'mudir' ? 'Mudir Pesantren' : user.roleTitle,
    dateDay: formatIndonesianDate(now),
    loginTime: formatTimeWithSeconds(now),
    loginTimestamp: nowMs,
    duration: 'Sesi Sedang Aktif',
    isActive: true,
    devicePc: getRealDeviceName(),
    browser: getRealBrowserName(),
    ipAddress: ipDisplay,
    macAddress: '-',
    locationName: '-',
    coordinates: '-',
    actions: [
      {
        id: `act-${nowMs}-1`,
        time: formatTimeWithSeconds(now),
        module: 'Autentikasi & Gerbang Masuk',
        actionType: 'Login Berhasil',
        description: `Autentikasi kredensial pengguna rill untuk akun ${user.name} (${user.roleTitle})`,
        status: 'Sukses',
      },
    ],
  };

  const currentRecords = getStoredSessionRecords();
  // Mark any previous active sessions as ended
  const updatedRecords = currentRecords.map((s) => {
    if (s.isActive) {
      return {
        ...s,
        isActive: false,
        logoutTime: formatTimeWithSeconds(now),
        duration: formatDurationFromTimestamps(s.loginTimestamp, nowMs),
      };
    }
    return s;
  });

  // Prepend new active session
  const finalRecords = [newSession, ...updatedRecords];
  saveSessionRecords(finalRecords);
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, sessionId);

  // Sync new session to Firestore cloud (skipped if in offline mode)
  if (!isOfflineModeActive()) {
    try {
      const docRef = doc(db, 'sessions', sessionId);
      setDoc(docRef, {
        ...newSession,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) => {
        console.warn('Remote session setDoc notice:', err);
      });
    } catch {}
  }

  // Broadcast to other open tabs / devices
  broadcastSync({ module: 'sessions', action: 'CREATE', payload: newSession });

  // Attempt real geolocation if user grants permission
  fetchRealGeolocationIfAllowed(sessionId);

  return newSession;
};

// Record an individual action log in the active session
export const recordSessionAction = (
  moduleName: string,
  actionType: string,
  description: string,
  status: 'Sukses' | 'Terverifikasi' | 'Peringatan' | 'Dibatalkan' = 'Sukses'
): void => {
  if (typeof window === 'undefined') return;
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  if (!activeId) return;

  const now = new Date();
  const newAction: SessionActionLog = {
    id: `act-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
    time: formatTimeWithSeconds(now),
    module: moduleName,
    actionType: actionType,
    description: description,
    status: status,
  };

  const records = getStoredSessionRecords();
  let found = false;
  let updatedActions: SessionActionLog[] = [];

  const updatedRecords = records.map((rec) => {
    if (rec.id === activeId && rec.isActive) {
      found = true;
      updatedActions = [...rec.actions, newAction];
      return {
        ...rec,
        actions: updatedActions,
      };
    }
    return rec;
  });

  if (found) {
    saveSessionRecords(updatedRecords);

    // Sync action log to Firestore cloud (skipped if in offline mode)
    if (!isOfflineModeActive()) {
      try {
        const docRef = doc(db, 'sessions', activeId);
        updateDoc(docRef, {
          actions: updatedActions,
          updatedAt: serverTimestamp(),
        }).catch((err) => {
          console.warn('Remote session action updateDoc notice:', err);
        });
      } catch {}
    }

    broadcastSync({ module: 'sessions', action: 'UPDATE', id: activeId, payload: { newAction } });
  }
};

// End current session on logout
export const recordLogoutSession = (): void => {
  if (typeof window === 'undefined') return;
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  const now = new Date();
  const nowMs = now.getTime();

  if (activeId) {
    const records = getStoredSessionRecords();
    let updatedTarget: SessionRecord | null = null;

    const updatedRecords = records.map((rec) => {
      if (rec.id === activeId && rec.isActive) {
        updatedTarget = {
          ...rec,
          isActive: false,
          logoutTime: formatTimeWithSeconds(now),
          duration: formatDurationFromTimestamps(rec.loginTimestamp, nowMs),
          actions: [
            ...rec.actions,
            {
              id: `act-${nowMs}-logout`,
              time: formatTimeWithSeconds(now),
              module: 'Autentikasi & Gerbang Masuk',
              actionType: 'Logout Sesi',
              description: 'Pengguna mengakhiri sesi dan keluar dari portal',
              status: 'Sukses' as const,
            },
          ],
        };
        return updatedTarget;
      }
      return rec;
    });

    saveSessionRecords(updatedRecords);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);

    if (updatedTarget) {
      // Sync logout status to Firestore cloud (skipped in offline mode)
      if (!isOfflineModeActive()) {
        try {
          const docRef = doc(db, 'sessions', activeId);
          updateDoc(docRef, {
            isActive: false,
            logoutTime: (updatedTarget as SessionRecord).logoutTime,
            duration: (updatedTarget as SessionRecord).duration,
            actions: (updatedTarget as SessionRecord).actions,
            updatedAt: serverTimestamp(),
          }).catch((err) => {
            console.warn('Remote session logout updateDoc notice:', err);
          });
        } catch {}
      }

      broadcastSync({ module: 'sessions', action: 'UPDATE', id: activeId });
    }
  }
};
