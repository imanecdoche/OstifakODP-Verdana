import type { 
  Student, 
  SantriRecord, 
  PortfolioViolationRecord, 
  PortfolioAchievementRecord, 
  MonthlyArchiveRecord,
  RedemptionRecord,
  ViolationCategory 
} from '../types';
import { calculateDecay } from '../utils/disciplineCalculator';

/**
 * Migration & Backward Compatibility Utility for Student Portfolio & Dual-Metric System
 * Ensures seamless conversion of legacy student records into the new SSOT structure.
 */
export function migrateStudentPortfolio(rawStudent: any): Student {
  const now = new Date().toISOString();

  if (!rawStudent || typeof rawStudent !== 'object') {
    return {
      id: '',
      nis: '',
      name: '',
      studentName: '',
      dormitoryId: '',
      kamar: '',
      classId: '',
      kelas: '',
      createdAt: now,
      hafalan: '0 Juz',

      violationHistory: [],
      lifetimePK: 0,
      activePK: 0,
      lastViolationDate: null,
      hasDecayLock: false,

      achievementHistory: [],
      lifetimePP: 0,
      activePP: 0,
      monthlyArchives: [],

      poinPelanggaran: 0,
      poinPrestasi: 0,
      statusIbadah: '100% Berjamaah',
      violationsHistory: [],
      mahkamahHistory: [],
      hafalanHistory: [],
      achievementsHistory: [],
      permissionsHistory: [],
    };
  }

  const id = rawStudent.id || '';
  const nis = rawStudent.nis || '';
  const name = (rawStudent.name || rawStudent.studentName || '').trim();
  const studentName = (rawStudent.studentName || rawStudent.name || '').trim();
  const dormitoryId = rawStudent.dormitoryId || rawStudent.kamar || '';
  const kamar = rawStudent.kamar || rawStudent.dormitoryId || '';
  const classId = rawStudent.classId || rawStudent.kelas || '';
  const kelas = rawStudent.kelas || rawStudent.classId || '';
  const createdAt = rawStudent.createdAt || now;
  const hafalan = rawStudent.hafalan || '0 Juz';

  // 1. Process Violation History (Buku saku permanen)
  let violationHistory: PortfolioViolationRecord[] = [];
  if (Array.isArray(rawStudent.violationHistory)) {
    violationHistory = rawStudent.violationHistory.map((v: any, index: number) => ({
      id: String(v.id || `v_${id}_${index}_${Date.now()}`),
      date: String(v.date || now.split('T')[0]),
      title: String(v.title || v.violation || v.kasus || 'Pelanggaran'),
      category: (['ringan', 'sedang', 'berat'].includes(v.category) ? v.category : 'ringan') as ViolationCategory,
      points: Number(v.points) || 0,
      notes: v.notes || v.penaltyDescription || v.penalty || undefined,
      resolved: typeof v.resolved === 'boolean' ? v.resolved : (v.status === 'selesai' || true),
    }));
  } else if (Array.isArray(rawStudent.violationsHistory)) {
    // Migration from legacy violationsHistory format
    violationHistory = rawStudent.violationsHistory.map((v: any, index: number) => ({
      id: String(v.id || `v_${id}_${index}_${Date.now()}`),
      date: String(v.date || now.split('T')[0]),
      title: String(v.title || 'Pelanggaran'),
      category: (['ringan', 'sedang', 'berat'].includes(v.category) ? v.category : 'ringan') as ViolationCategory,
      points: Number(v.points) || 0,
      notes: v.notes || v.penalty || undefined,
      resolved: true,
    }));
  }

  // 2. Process Redemption History
  const redemptionHistory: RedemptionRecord[] = Array.isArray(rawStudent.redemptionHistory)
    ? rawStudent.redemptionHistory.map((r: any, index: number) => ({
        id: String(r.id || `red_${id}_${index}_${Date.now()}`),
        date: String(r.date || now.split('T')[0]),
        ppUsed: Number(r.ppUsed) || 0,
        pkDeducted: Number(r.pkDeducted) || 0,
        reason: String(r.reason || 'Penebusan Restoratif'),
      }))
    : [];

  // 3. Process Lifetime & Active PK
  const legacyPK = Number(rawStudent.poinPelanggaran) || Number(rawStudent.totalPK) || Number(rawStudent.points) || 0;
  const historyPKSum = violationHistory.reduce((sum, v) => sum + (Number(v.points) || 0), 0);

  const lifetimePK = typeof rawStudent.lifetimePK === 'number'
    ? rawStudent.lifetimePK
    : Math.max(legacyPK, historyPKSum);

  // 4. Process Last Violation Date & Decay Lock
  let lastViolationDate: string | null = rawStudent.lastViolationDate !== undefined ? rawStudent.lastViolationDate : null;
  if (!lastViolationDate && violationHistory.length > 0) {
    const validDates = violationHistory
      .map((v) => v.date)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (validDates.length > 0) {
      lastViolationDate = validDates[0];
    }
  }

  const hasDecayLock = typeof rawStudent.hasDecayLock === 'boolean'
    ? rawStudent.hasDecayLock
    : violationHistory.some((v) => (v.category === 'berat' || v.points >= 50) && !v.resolved);

  // 4. Process Achievement History
  let achievementHistory: PortfolioAchievementRecord[] = [];
  if (Array.isArray(rawStudent.achievementHistory)) {
    achievementHistory = rawStudent.achievementHistory.map((a: any, index: number) => ({
      id: String(a.id || `ach_${id}_${index}_${Date.now()}`),
      date: String(a.date || now.split('T')[0]),
      title: String(a.title || 'Prestasi'),
      category: String(a.category || 'Umum'),
      points: Number(a.points) || 0,
      proofUrl: a.proofUrl || undefined,
    }));
  } else if (Array.isArray(rawStudent.achievementsHistory)) {
    // Migration from legacy achievementsHistory format
    achievementHistory = rawStudent.achievementsHistory.map((a: any, index: number) => ({
      id: String(a.id || `ach_${id}_${index}_${Date.now()}`),
      date: String(a.date || now.split('T')[0]),
      title: String(a.title || 'Prestasi'),
      category: String(a.category || 'Umum'),
      points: Number(a.points) || 0,
      proofUrl: undefined,
    }));
  }

  // 5. Process Lifetime & Active PP
  const legacyPPSum = Number(rawStudent.poinPrestasi) || 0;
  const historyPPSum = achievementHistory.reduce((sum, a) => sum + (Number(a.points) || 0), 0);

  const lifetimePP = typeof rawStudent.lifetimePP === 'number'
    ? rawStudent.lifetimePP
    : Math.max(legacyPPSum, historyPPSum);

  const activePP = typeof rawStudent.activePP === 'number'
    ? rawStudent.activePP
    : (rawStudent.poinPrestasi !== undefined ? Number(rawStudent.poinPrestasi) : legacyPPSum);

  // 6. Process Monthly Archives
  const monthlyArchives: MonthlyArchiveRecord[] = Array.isArray(rawStudent.monthlyArchives)
    ? rawStudent.monthlyArchives.map((m: any) => ({
        month: String(m.month || ''),
        totalPP: Number(m.totalPP) || 0,
        rank: m.rank !== undefined ? Number(m.rank) : undefined,
      }))
    : [];

  const tempStudent: Student = {
    ...rawStudent,
    id,
    nis,
    name,
    studentName,
    dormitoryId,
    kamar,
    classId,
    kelas,
    createdAt,
    hafalan,

    violationHistory,
    redemptionHistory,
    lifetimePK,
    activePK: typeof rawStudent.activePK === 'number' ? rawStudent.activePK : legacyPK,
    lastViolationDate,
    hasDecayLock,

    achievementHistory,
    lifetimePP,
    activePP,
    monthlyArchives,

    poinPelanggaran: 0,
    poinPrestasi: activePP,
    statusIbadah: rawStudent.statusIbadah || '100% Berjamaah',

    violationsHistory: rawStudent.violationsHistory || [],
    mahkamahHistory: rawStudent.mahkamahHistory || [],
    hafalanHistory: rawStudent.hafalanHistory || [],
    achievementsHistory: rawStudent.achievementsHistory || [],
    permissionsHistory: rawStudent.permissionsHistory || [],
  };

  const decayResult = calculateDecay(tempStudent);
  const activePK = decayResult.activePK;

  return {
    ...tempStudent,
    activePK,
    poinPelanggaran: activePK,
  };
}

/**
 * Creates a brand new Student record with clean defaults and an empty valid portfolio object.
 * NO dummy or mock data injected.
 */
export function createNewDefaultStudent(
  initial: Partial<Student> & { id: string; nis: string; name: string }
): Student {
  const now = new Date().toISOString();
  const name = initial.name || initial.studentName || '';
  const dormitoryId = initial.dormitoryId || initial.kamar || '';
  const classId = initial.classId || initial.kelas || '';

  return migrateStudentPortfolio({
    ...initial,
    id: initial.id,
    nis: initial.nis,
    name,
    studentName: name,
    dormitoryId,
    kamar: dormitoryId,
    classId,
    kelas: classId,
    createdAt: initial.createdAt || now,
    hafalan: initial.hafalan || '0 Juz',

    activePK: 0,
    activePP: 0,
    lifetimePK: 0,
    lifetimePP: 0,
    hasDecayLock: false,
    lastViolationDate: null,

    violationHistory: [],
    achievementHistory: [],
    monthlyArchives: [],

    poinPelanggaran: 0,
    poinPrestasi: 0,
    statusIbadah: '100% Berjamaah',
  });
}
