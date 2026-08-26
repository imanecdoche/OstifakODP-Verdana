import { SantriRecord, StudentAchievementEntry, updateSantriRecord } from './firestoreService';
import { recordSessionAction } from './sessionLogService';
import { gooeyToast } from 'goey-toast';

export interface PPAwardResult {
  studentId: string;
  studentName: string;
  nis: string;
  category: string;
  rank: string;
  points: number; // PP
  achievementId: string;
  title: string;
}

export interface MonthlyExecutionStatus {
  lastExecutedKey: string | null;
  lastExecutedDate: string | null;
  nextScheduledDate: string;
  isEligibleNow: boolean;
}

/**
 * Helper to parse hafalan string into numeric juz
 */
export function parseHafalanNumber(hafalan: string): number {
  if (!hafalan) return 0;
  const match = hafalan.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Get next scheduled execution timestamp (Last day of current month at 21:00 WIB / UTC+7)
 */
export function getNextMonthlyPPSchedule(): { targetDate: Date; formattedSchedule: string; isPassedThisMonth: boolean } {
  const now = new Date();
  
  // Calculate last day of current month
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  
  // Last day of month
  const lastDayDate = new Date(year, month + 1, 0); // e.g. 31 Aug
  
  // 21:00 WIB is 14:00 UTC (WIB is UTC+7)
  const executionTarget = new Date(year, month, lastDayDate.getDate(), 21, 0, 0, 0);
  
  const isPassedThisMonth = now.getTime() >= executionTarget.getTime();
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const formattedSchedule = `${lastDayDate.getDate()} ${monthNames[month]} ${year}, 21:00 WIB`;
  
  return {
    targetDate: executionTarget,
    formattedSchedule,
    isPassedThisMonth,
  };
}

/**
 * Check execution eligibility and status for the current month
 */
export function getMonthlyExecutionStatus(): MonthlyExecutionStatus {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed (1-12)
  const currentMonthKey = `ostifak_pp_executed_${year}_${month.toString().padStart(2, '0')}`;
  
  const lastExecuted = typeof localStorage !== 'undefined' ? localStorage.getItem(currentMonthKey) : null;
  const schedule = getNextMonthlyPPSchedule();
  
  return {
    lastExecutedKey: lastExecuted ? currentMonthKey : null,
    lastExecutedDate: lastExecuted,
    nextScheduledDate: schedule.formattedSchedule,
    isEligibleNow: !lastExecuted && schedule.isPassedThisMonth,
  };
}

/**
 * Core Algorithm to calculate and distribute PP (Poin Prestasi) for monthly achievements:
 * 1. Santri Teladan (Top 5: 0 PK, highest Juz, most achievements) -> +25 PP (Juara 1), +20 PP (#2-5)
 * 2. Hafalan Terbanyak (Top 5 highest Juz) -> +20 PP
 * 3. Setoran Terbanyak Bulan Ini (Top 5 from hafalanHistory) -> +15 PP
 * 4. Murojaah Terbanyak Bulan Ini (Top 5 from hafalanHistory) -> +15 PP
 */
export function calculateMonthlyAwards(
  students: SantriRecord[],
  targetDateStr?: string
): PPAwardResult[] {
  if (!students || students.length === 0) return [];
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthLabel = `${monthNames[month]} ${year}`;
  const awards: PPAwardResult[] = [];

  // 1. Santri Teladan (0 Poin Pelanggaran / PK, Hafalan Tertinggi)
  const teladanList = [...students]
    .filter(s => (s.poinPelanggaran || 0) === 0)
    .sort((a, b) => {
      const hafalanDiff = parseHafalanNumber(b.hafalan) - parseHafalanNumber(a.hafalan);
      if (hafalanDiff !== 0) return hafalanDiff;
      return (b.achievementsHistory?.length || 0) - (a.achievementsHistory?.length || 0);
    })
    .slice(0, 5);

  teladanList.forEach((s, idx) => {
    const pts = idx === 0 ? 25 : 20;
    const rankLabel = idx === 0 ? 'Peringkat 1 Teladan' : `Top 5 Teladan (#${idx + 1})`;
    awards.push({
      studentId: s.id,
      studentName: s.studentName,
      nis: s.nis,
      category: 'Santri Teladan',
      rank: rankLabel,
      points: pts,
      achievementId: `ach-auto-${year}-${month + 1}-teladan-${s.id}`,
      title: `Predikat Santri Teladan (${monthLabel})`,
    });
  });

  // 2. Hafalan Terbanyak (Top 5 Juz, khusus santri proses tahfizh aktif yang belum tuntas 30 Juz / juz < 30)
  const topHafalanList = [...students]
    .filter(s => {
      const juz = parseHafalanNumber(s.hafalan);
      return juz > 0 && juz < 30; // Santri yang sudah tuntas 30 Juz (Huffazh) dikecualikan
    })
    .sort((a, b) => parseHafalanNumber(b.hafalan) - parseHafalanNumber(a.hafalan))
    .slice(0, 5);

  topHafalanList.forEach((s, idx) => {
    const rankLabel = `Peringkat #${idx + 1} Hafalan (<30 Juz)`;
    awards.push({
      studentId: s.id,
      studentName: s.studentName,
      nis: s.nis,
      category: 'Hafalan Terbanyak',
      rank: rankLabel,
      points: 20,
      achievementId: `ach-auto-${year}-${month + 1}-hafalan-${s.id}`,
      title: `Top Hafalan Terbanyak (${s.hafalan}) - ${monthLabel}`,
    });
  });

  // 3. Setoran Terbanyak Bulan Ini
  const setoranList = students.map(s => {
    const history = s.hafalanHistory || [];
    const entries = history.filter(h => {
      if (h.category === 'Murojaah') return false;
      if (!h.date) return false;
      const d = new Date(h.date);
      return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
    });
    return {
      student: s,
      count: entries.length,
      pages: entries.reduce((acc, h) => acc + (h.pageCount || 1), 0),
    };
  })
  .filter(item => item.count > 0)
  .sort((a, b) => b.count - a.count || b.pages - a.pages)
  .slice(0, 5);

  setoranList.forEach((item, idx) => {
    awards.push({
      studentId: item.student.id,
      studentName: item.student.studentName,
      nis: item.student.nis,
      category: 'Setoran Terbanyak Bulan Ini',
      rank: `Peringkat #${idx + 1} (${item.count} Sesi)`,
      points: 15,
      achievementId: `ach-auto-${year}-${month + 1}-setoran-${item.student.id}`,
      title: `Top Setoran Terbanyak ${monthLabel} (${item.count} Setoran / ${item.pages} Halaman)`,
    });
  });

  // 4. Murojaah Terbanyak Bulan Ini
  const murojaahList = students.map(s => {
    const history = s.hafalanHistory || [];
    const entries = history.filter(h => {
      if (h.category !== 'Murojaah') return false;
      if (!h.date) return false;
      const d = new Date(h.date);
      return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
    });
    return {
      student: s,
      count: entries.length,
      pages: entries.reduce((acc, h) => acc + (h.pageCount || 1), 0),
    };
  })
  .filter(item => item.count > 0)
  .sort((a, b) => b.count - a.count || b.pages - a.pages)
  .slice(0, 5);

  murojaahList.forEach((item, idx) => {
    awards.push({
      studentId: item.student.id,
      studentName: item.student.studentName,
      nis: item.student.nis,
      category: 'Murojaah Terbanyak Bulan Ini',
      rank: `Peringkat #${idx + 1} (${item.count} Sesi)`,
      points: 15,
      achievementId: `ach-auto-${year}-${month + 1}-murojaah-${item.student.id}`,
      title: `Top Murojaah Terbanyak ${monthLabel} (${item.count} Murojaah / ${item.pages} Halaman)`,
    });
  });

  return awards;
}

/**
 * Execute automated or simulated award distribution and persist to Firestore
 */
export async function executeMonthlyPPAward(
  students: SantriRecord[],
  isManualTrigger = false
): Promise<{ success: boolean; awardsCount: number; affectedStudentsCount: number; message: string }> {
  if (!students || students.length === 0) {
    return { success: false, awardsCount: 0, affectedStudentsCount: 0, message: 'Data santri kosong.' };
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const currentMonthKey = `ostifak_pp_executed_${year}_${month.toString().padStart(2, '0')}`;
  const executionDateStr = now.toISOString().split('T')[0];

  const calculatedAwards = calculateMonthlyAwards(students, executionDateStr);

  if (calculatedAwards.length === 0) {
    return {
      success: true,
      awardsCount: 0,
      affectedStudentsCount: 0,
      message: 'Tidak ada santri yang memenuhi kriteria predikat untuk bulan ini.'
    };
  }

  // Group awards per student
  const awardsByStudent = new Map<string, PPAwardResult[]>();
  calculatedAwards.forEach(award => {
    const list = awardsByStudent.get(award.studentId) || [];
    list.push(award);
    awardsByStudent.set(award.studentId, list);
  });

  let totalUpdated = 0;
  let totalNewAwards = 0;

  for (const [studentId, awards] of awardsByStudent.entries()) {
    const student = students.find(s => s.id === studentId);
    if (!student) continue;

    const existingAchievements = student.achievementsHistory || [];
    const existingIds = new Set(existingAchievements.map(a => a.id));

    const newEntries: StudentAchievementEntry[] = [];
    let additionalPP = 0;

    awards.forEach(a => {
      if (!existingIds.has(a.achievementId)) {
        newEntries.push({
          id: a.achievementId,
          title: a.title,
          category: a.category,
          date: executionDateStr,
          rank: a.rank,
          organizer: 'Otomasi Prestasi Bulanan OSTIFAK (21:00 WIB)',
          points: a.points,
          description: `Penghargaan otomatis predikat ${a.category} (${a.points} PP) yang dieksekusi pada akhir bulan.`,
        });
        additionalPP += a.points;
        totalNewAwards++;
      }
    });

    if (newEntries.length > 0) {
      const mergedAchievements = [...newEntries, ...existingAchievements];
      // Recalculate total poinPrestasi
      const currentPP = student.poinPrestasi || existingAchievements.reduce((acc, a) => acc + (a.points || 10), 0);
      const updatedTotalPP = currentPP + additionalPP;

      await updateSantriRecord(student.id, {
        achievementsHistory: mergedAchievements,
        poinPrestasi: updatedTotalPP,
      });
      totalUpdated++;
    }
  }

  // Mark as executed in localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(currentMonthKey, now.toISOString());
  }

  recordSessionAction(
    'Prestasi & Otomasi',
    'Eksekusi Otomatis PP',
    `Eksekusi ${totalNewAwards} penghargaan PP otomatis untuk ${totalUpdated} santri periode ${month}/${year}.`
  );

  gooeyToast.success('Kalkulasi Poin Prestasi (PP) Berhasil', {
    description: `Diberikan ${totalNewAwards} penghargaan predikat kepada ${totalUpdated} santri berprestasi.`,
  });

  return {
    success: true,
    awardsCount: totalNewAwards,
    affectedStudentsCount: totalUpdated,
    message: `Berhasil mengeksekusi ${totalNewAwards} predikat PP kepada ${totalUpdated} santri.`,
  };
}
