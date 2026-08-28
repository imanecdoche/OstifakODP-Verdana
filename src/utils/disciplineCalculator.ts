import type { 
  Student, 
  PortfolioViolationRecord, 
  PortfolioAchievementRecord, 
  MonthlyArchiveRecord,
  RedemptionRecord,
  ViolationCategory 
} from '../types';

export interface DecayCalculationResult {
  activePK: number;
  baseActivePK: number;
  cleanDays: number;
  decayPoints: number;
  isDecaying: boolean;
  isLocked: boolean;
  daysSinceLastViolation: number;
  statusLabel: string;
  decayStatus: 'clean' | 'grace_period' | 'decaying' | 'locked';
}

/**
 * Helper to calculate difference in full calendar days between two dates
 */
function differenceInDays(dateA: Date, dateB: Date): number {
  const diffTime = dateA.getTime() - dateB.getTime();
  if (diffTime <= 0) return 0;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * TAHAP 2: DECAY ENGINE & DUAL-METRIC SSOT CALCULATOR
 * Calculates real-time activePK, grace period (14 days), decay recovery (-1 PK/day),
 * and decay locks (unresolved heavy violations).
 */
export function calculateDecay(student: Student, currentDate: Date = new Date()): DecayCalculationResult {
  const history = student.violationHistory || [];
  const redemptionHistory = student.redemptionHistory || [];

  // Base active PK = total violation points minus redeemed PK
  const totalRawPK = history.reduce((sum, v) => sum + (Number(v.points) || 0), 0);
  const totalRedeemedPK = redemptionHistory.reduce((sum, r) => sum + (Number(r.pkDeducted) || 0), 0);
  const baseActivePK = Math.max(0, totalRawPK - totalRedeemedPK);

  // If no violations or lastViolationDate is null, student is clean
  if (!student.lastViolationDate || history.length === 0 || baseActivePK === 0) {
    return {
      activePK: 0,
      baseActivePK: 0,
      cleanDays: 0,
      decayPoints: 0,
      isDecaying: false,
      isLocked: false,
      daysSinceLastViolation: 0,
      statusLabel: 'Bersih (0 PK)',
      decayStatus: 'clean',
    };
  }

  // Calculate days elapsed since last violation
  let lastDate: Date;
  try {
    lastDate = new Date(student.lastViolationDate);
    if (isNaN(lastDate.getTime())) {
      lastDate = new Date();
    }
  } catch {
    lastDate = new Date();
  }

  const daysSinceLastViolation = Math.max(0, differenceInDays(currentDate, lastDate));

  // Check Decay Lock: Has unresolved heavy violation
  const hasUnresolvedHeavy = history.some(v => (v.category === 'berat' || Number(v.points) >= 50) && !v.resolved);
  const isLocked = Boolean(student.hasDecayLock || hasUnresolvedHeavy);

  if (isLocked) {
    return {
      activePK: baseActivePK,
      baseActivePK,
      cleanDays: 0,
      decayPoints: 0,
      isDecaying: false,
      isLocked: true,
      daysSinceLastViolation,
      statusLabel: 'Perlu Sidang Mahkamah',
      decayStatus: 'locked',
    };
  }

  // Grace period standard is 14 days
  const GRACE_PERIOD_DAYS = 14;

  if (daysSinceLastViolation <= GRACE_PERIOD_DAYS) {
    const daysRemaining = GRACE_PERIOD_DAYS - daysSinceLastViolation;
    return {
      activePK: baseActivePK,
      baseActivePK,
      cleanDays: 0,
      decayPoints: 0,
      isDecaying: false,
      isLocked: false,
      daysSinceLastViolation,
      statusLabel: `Masa Tenang: ${daysRemaining} hari lagi`,
      decayStatus: 'grace_period',
    };
  }

  // Active Decay phase: > 14 days clean
  const cleanDays = daysSinceLastViolation - GRACE_PERIOD_DAYS;
  const decayPoints = cleanDays * 1; // -1 PK per clean day
  const activePK = Math.max(0, baseActivePK - decayPoints);
  const isDecaying = activePK > 0;

  return {
    activePK,
    baseActivePK,
    cleanDays,
    decayPoints,
    isDecaying,
    isLocked: false,
    daysSinceLastViolation,
    statusLabel: isDecaying ? `Memulihkan (-1 PK/hari)` : `Bersih (0 PK)`,
    decayStatus: isDecaying ? 'decaying' : 'clean',
  };
}

/**
 * Mutator: Adds a new violation to student, updating lifetimePK, lastViolationDate, hasDecayLock & activePK.
 */
export function addViolationToStudent(
  student: Student,
  violation: { title: string; category?: ViolationCategory; points: number; notes?: string; date?: string }
): Student {
  const now = new Date().toISOString();
  const dateStr = violation.date || now.split('T')[0];
  const points = Number(violation.points) || 0;
  const category: ViolationCategory = violation.category || (points >= 50 ? 'berat' : points >= 20 ? 'sedang' : 'ringan');

  const newRecord: PortfolioViolationRecord = {
    id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: dateStr,
    title: violation.title || 'Pelanggaran',
    category,
    points,
    notes: violation.notes,
    resolved: false,
  };

  const updatedHistory = [newRecord, ...(student.violationHistory || [])];
  const isHeavy = category === 'berat' || points >= 50;
  const hasDecayLock = student.hasDecayLock || isHeavy;
  const lifetimePK = (student.lifetimePK || 0) + points;

  const tempStudent: Student = {
    ...student,
    violationHistory: updatedHistory,
    lastViolationDate: dateStr,
    hasDecayLock,
    lifetimePK,
  };

  const decayResult = calculateDecay(tempStudent);

  return {
    ...tempStudent,
    activePK: decayResult.activePK,
    poinPelanggaran: decayResult.activePK,
  };
}

/**
 * Mutator: Resolves a violation record (Sidang Mahkamah / Amnesti).
 * Unlocks decay if no other unresolved heavy violations remain.
 */
export function resolveViolationForStudent(student: Student, violationId: string): Student {
  const updatedHistory = (student.violationHistory || []).map((v) => {
    if (v.id === violationId || v.title.trim().toLowerCase() === violationId.trim().toLowerCase()) {
      return { ...v, resolved: true };
    }
    return v;
  });

  const remainingHeavy = updatedHistory.some((v) => (v.category === 'berat' || v.points >= 50) && !v.resolved);
  const hasDecayLock = remainingHeavy;

  const tempStudent: Student = {
    ...student,
    violationHistory: updatedHistory,
    hasDecayLock,
  };

  const decayResult = calculateDecay(tempStudent);

  return {
    ...tempStudent,
    activePK: decayResult.activePK,
    poinPelanggaran: decayResult.activePK,
  };
}

/**
 * Mutator: Adds an achievement to student, updating lifetimePP and activePP.
 */
export function addAchievementToStudent(
  student: Student,
  achievement: { title: string; category?: string; points: number; proofUrl?: string; date?: string }
): Student {
  const now = new Date().toISOString();
  const dateStr = achievement.date || now.split('T')[0];
  const points = Number(achievement.points) || 0;

  const newRecord: PortfolioAchievementRecord = {
    id: `ach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: dateStr,
    title: achievement.title || 'Prestasi',
    category: achievement.category || 'Umum',
    points,
    proofUrl: achievement.proofUrl,
  };

  const updatedHistory = [newRecord, ...(student.achievementHistory || [])];
  const lifetimePP = (student.lifetimePP || 0) + points;
  const activePP = (student.activePP || 0) + points;

  return {
    ...student,
    achievementHistory: updatedHistory,
    lifetimePP,
    activePP,
    poinPrestasi: activePP,
  };
}

/**
 * TAHAP 4: RESTORATIVE JUSTICE / TEBUS POIN
 * Converts active PP into active PK reduction (default ratio: 2 PP = 1 PK).
 * Logs redemption into redemptionHistory audit trail.
 */
export function redeemPointsForDiscipline(
  student: Student,
  ppToRedeem: number,
  reason: string,
  ratio: number = 2
): { success: boolean; student: Student; message: string } {
  const activePP = Number(student.activePP) || 0;
  const activePK = Number(student.activePK) || 0;

  if (ppToRedeem <= 0) {
    return { success: false, student, message: 'Jumlah PP yang akan ditebus harus lebih dari 0.' };
  }

  if (activePP < ppToRedeem) {
    return { success: false, student, message: `Saldo PP aktif tidak mencukupi (Tersedia: ${activePP} PP).` };
  }

  if (activePK <= 0) {
    return { success: false, student, message: 'Santri tidak memiliki Poin Pelanggaran (PK) aktif untuk ditebus.' };
  }

  const pkDeducted = Math.min(activePK, Math.floor(ppToRedeem / ratio));
  if (pkDeducted <= 0) {
    return { success: false, student, message: `Jumlah PP terlalu kecil untuk menukar PK pada rasio ${ratio}:1.` };
  }

  const now = new Date().toISOString();
  const newRedemption: RedemptionRecord = {
    id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: now.split('T')[0],
    ppUsed: ppToRedeem,
    pkDeducted,
    reason: reason || 'Penebusan Restoratif / Kompensasi Santri',
  };

  const newRedemptionHistory = [newRedemption, ...(student.redemptionHistory || [])];
  const newActivePP = activePP - ppToRedeem;
  const newActivePK = Math.max(0, activePK - pkDeducted);

  const updatedStudent: Student = {
    ...student,
    redemptionHistory: newRedemptionHistory,
    activePP: newActivePP,
    poinPrestasi: newActivePP,
    activePK: newActivePK,
    poinPelanggaran: newActivePK,
  };

  return {
    success: true,
    student: updatedStudent,
    message: `Berhasil menebus ${ppToRedeem} PP untuk pemulihan -${pkDeducted} PK.`,
  };
}

/**
 * TAHAP 4: OTOMASI ARSIP BULANAN (MONTHLY ROLLOVER)
 * Archives activePP to monthlyArchives for all active students and resets activePP to 0.
 * lifetimePP remains untouched.
 */
export function archiveMonthlyAchievements(students: Student[], targetMonth: string): Student[] {
  const now = new Date().toISOString();

  return students.map((student) => {
    const activePP = Number(student.activePP) || 0;
    if (activePP <= 0) return student;

    const existingArchives = student.monthlyArchives || [];
    const newArchiveEntry: MonthlyArchiveRecord = {
      month: targetMonth,
      totalPP: activePP,
      recordedAt: now,
    };

    // Replace if month already archived or append
    const existingIndex = existingArchives.findIndex((m) => m.month === targetMonth);
    let updatedArchives: MonthlyArchiveRecord[];
    if (existingIndex !== -1) {
      updatedArchives = [...existingArchives];
      updatedArchives[existingIndex] = newArchiveEntry;
    } else {
      updatedArchives = [newArchiveEntry, ...existingArchives];
    }

    return {
      ...student,
      monthlyArchives: updatedArchives,
      activePP: 0,
      poinPrestasi: 0,
    };
  });
}
