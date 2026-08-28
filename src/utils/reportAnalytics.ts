import { Student, SantriRecord } from '../types';
import { 
  ReportDatePreset,
  ReportFilterOptions, 
  DateRangeFilter, 
  TahfizhAnalyticsSummary, 
  DisciplineAnalyticsSummary, 
  CombinedAnalyticsSummary, 
  DailyTrendPoint,
  FluencyDistribution,
  PeakProductivityInfo
} from '../types/report';
import { calculateDecay } from './disciplineCalculator';

/**
 * Helper to parse date strings into ISO YYYY-MM-DD
 */
function normalizeDateStr(dateInput?: string | null): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Get start and end date bounds based on DateRangeFilter preset
 */
export function getPresetDateBounds(dateRange: DateRangeFilter): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (dateRange.preset === 'weekly') {
    const past = new Date(now);
    past.setDate(past.getDate() - 6);
    return { startDate: past.toISOString().split('T')[0], endDate: todayStr };
  }

  if (dateRange.preset === 'monthly') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: firstDay.toISOString().split('T')[0], endDate: todayStr };
  }

  if (dateRange.preset === 'yearly') {
    const firstDayYear = new Date(now.getFullYear(), 0, 1);
    return { startDate: firstDayYear.toISOString().split('T')[0], endDate: todayStr };
  }

  // Custom preset
  return {
    startDate: dateRange.startDate || todayStr,
    endDate: dateRange.endDate || todayStr,
  };
}

/**
 * Filter students list by StudentId, Dormitory, Class, and Search Query
 */
export function filterStudentsByOptions(students: Student[], options: ReportFilterOptions): Student[] {
  if (!students || students.length === 0) return [];
  
  return students.filter((s) => {
    // Individual Student Filter
    if (options.studentId && options.studentId !== 'all') {
      if (s.id !== options.studentId) return false;
    }

    // Dormitory filter
    if (options.dormitoryId && options.dormitoryId !== 'all') {
      const dormMatch = s.dormitoryId === options.dormitoryId || s.kamar === options.dormitoryId;
      if (!dormMatch) return false;
    }

    // Class filter
    if (options.classId && options.classId !== 'all') {
      const classMatch = s.classId === options.classId || s.kelas === options.classId;
      if (!classMatch) return false;
    }

    // Search query filter
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.trim().toLowerCase();
      const nameMatch = (s.name || s.studentName || '').toLowerCase().includes(q);
      const nisMatch = (s.nis || '').toLowerCase().includes(q);
      if (!nameMatch && !nisMatch) return false;
    }

    return true;
  });
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Determine dynamic bucket category and label for peak performance calculation
 */
function getPeakBucketKeyAndLabel(
  dateStr: string,
  preset: ReportDatePreset,
  diffDays: number
): { bucketKey: string; bucketUnit: string; peakType: 'day' | 'week' | 'month' } {
  const d = new Date(dateStr);
  const dayOfWeek = DAY_NAMES[d.getDay()] || 'Senin';
  const dayOfMonth = d.getDate();
  const monthName = MONTH_NAMES[d.getMonth()] || 'Januari';

  if (preset === 'weekly' || (preset === 'custom' && diffDays <= 7)) {
    return { bucketKey: dayOfWeek, bucketUnit: dayOfWeek, peakType: 'day' };
  }

  if (preset === 'monthly' || (preset === 'custom' && diffDays > 7 && diffDays <= 45)) {
    let weekLabel = 'Pekan 1 (Tgl 1-7)';
    if (dayOfMonth > 7 && dayOfMonth <= 14) weekLabel = 'Pekan 2 (Tgl 8-14)';
    else if (dayOfMonth > 14 && dayOfMonth <= 21) weekLabel = 'Pekan 3 (Tgl 15-21)';
    else if (dayOfMonth > 21 && dayOfMonth <= 28) weekLabel = 'Pekan 4 (Tgl 22-28)';
    else if (dayOfMonth > 28) weekLabel = 'Pekan 5 (Tgl 29+)';
    return { bucketKey: weekLabel, bucketUnit: weekLabel, peakType: 'week' };
  }

  // Yearly or broad custom period
  return { bucketKey: monthName, bucketUnit: monthName, peakType: 'month' };
}

/**
 * Calculate Tahfizh Analytics Summary
 */
export function calculateTahfizhAnalytics(
  students: Student[],
  options: ReportFilterOptions
): TahfizhAnalyticsSummary {
  const filteredStudents = filterStudentsByOptions(students, options);
  const { startDate, endDate } = getPresetDateBounds(options.dateRange);

  let totalPagesZiyadah = 0;
  let totalPagesMurojaah = 0;
  let totalSetoranCount = 0;

  const fluency: FluencyDistribution = {
    lancar: 0,
    mutqin: 0,
    perbaikan: 0,
    total: 0,
  };

  const dayOfWeekVolume: Record<string, number> = {
    'Minggu': 0, 'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0
  };
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const dateVolumeMap = new Map<string, { ziyadah: number; murojaah: number }>();
  const studentTotalsMap = new Map<string, { ziyadah: number; murojaah: number; student: Student }>();

  filteredStudents.forEach((student) => {
    const hafalanEntries = student.hafalanHistory || [];
    let studentZiyadah = 0;
    let studentMurojaah = 0;

    hafalanEntries.forEach((entry) => {
      const entryDate = normalizeDateStr(entry.date);
      if (entryDate < startDate || entryDate > endDate) return;

      const pages = (entry as any).pagesCount || entry.pageCount || 1; // Default to 1 page if unspecified
      const cat = (entry.category || '').toLowerCase();
      const isZiyadah = cat.includes('ziyadah') || cat.includes('baru');

      if (isZiyadah) {
        totalPagesZiyadah += pages;
        studentZiyadah += pages;
      } else {
        totalPagesMurojaah += pages;
        studentMurojaah += pages;
      }

      totalSetoranCount++;

      // Fluency distribution
      const qual = ((entry as any).quality || entry.kelancaran || entry.predikat || '').toLowerCase();
      if (qual.includes('mutqin')) {
        fluency.mutqin++;
      } else if (qual.includes('lancar')) {
        fluency.lancar++;
      } else {
        fluency.perbaikan++;
      }
      fluency.total++;

      // Day of week volume
      const d = new Date(entryDate);
      const dayName = dayNames[d.getDay()];
      if (dayName) {
        dayOfWeekVolume[dayName] = (dayOfWeekVolume[dayName] || 0) + pages;
      }

      // Daily trend mapping
      const currentTrend = dateVolumeMap.get(entryDate) || { ziyadah: 0, murojaah: 0 };
      if (isZiyadah) {
        currentTrend.ziyadah += pages;
      } else {
        currentTrend.murojaah += pages;
      }
      dateVolumeMap.set(entryDate, currentTrend);
    });

    studentTotalsMap.set(student.id, {
      ziyadah: studentZiyadah,
      murojaah: studentMurojaah,
      student,
    });
  });

  const totalPagesSum = totalPagesZiyadah + totalPagesMurojaah;
  const ziyadahPercentage = totalPagesSum > 0 ? Math.round((totalPagesZiyadah / totalPagesSum) * 100) : 0;
  const murojaahPercentage = totalPagesSum > 0 ? 100 - ziyadahPercentage : 0;
  const avgPagesPerSetoran = totalSetoranCount > 0 ? parseFloat((totalPagesSum / totalSetoranCount).toFixed(1)) : 0;

  // Dynamic Peak Productivity Calculation
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));

  const peakBucketVolume: Record<string, number> = {};
  let peakTypeResult: 'day' | 'week' | 'month' = options.dateRange.preset === 'weekly' ? 'day' : options.dateRange.preset === 'monthly' ? 'week' : 'month';

  dateVolumeMap.forEach((vol, dateStr) => {
    const totalPages = vol.ziyadah + vol.murojaah;
    const { bucketUnit, peakType } = getPeakBucketKeyAndLabel(dateStr, options.dateRange.preset, diffDays);
    peakTypeResult = peakType;
    peakBucketVolume[bucketUnit] = (peakBucketVolume[bucketUnit] || 0) + totalPages;
  });

  let peakUnitName = options.dateRange.preset === 'weekly' ? 'Senin' : options.dateRange.preset === 'monthly' ? 'Pekan 1 (Tgl 1-7)' : 'Januari';
  let peakVolumePages = 0;

  Object.entries(peakBucketVolume).forEach(([unit, vol]) => {
    if (vol > peakVolumePages) {
      peakVolumePages = vol;
      peakUnitName = unit;
    }
  });

  const peakLabel = peakTypeResult === 'day' 
    ? 'Hari Puncak Produktivitas' 
    : peakTypeResult === 'week' 
    ? 'Pekan Puncak Produktivitas' 
    : 'Bulan Puncak Produktivitas';

  // Daily Trends array
  const dailyTrends: DailyTrendPoint[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const curDateStr = d.toISOString().split('T')[0];
    const trendData = dateVolumeMap.get(curDateStr) || { ziyadah: 0, murojaah: 0 };
    const dateParts = curDateStr.split('-');
    const displayLabel = `${dateParts[2]}/${dateParts[1]}`;

    dailyTrends.push({
      date: curDateStr,
      label: displayLabel,
      value1: trendData.ziyadah,
      value2: trendData.murojaah,
    });
  }

  // Top 10 Performers for Ziyadah & Muraja'ah
  const allTotals = Array.from(studentTotalsMap.values());
  
  const topZiyadahPerformers = allTotals
    .filter((item) => item.ziyadah > 0)
    .sort((a, b) => b.ziyadah - a.ziyadah)
    .slice(0, 10)
    .map((item) => ({
      studentId: item.student.id,
      name: item.student.name || item.student.studentName || 'Santri',
      kelas: item.student.classId || item.student.kelas || '-',
      pages: item.ziyadah,
    }));

  const topMurojaahPerformers = allTotals
    .filter((item) => item.murojaah > 0)
    .sort((a, b) => b.murojaah - a.murojaah)
    .slice(0, 10)
    .map((item) => ({
      studentId: item.student.id,
      name: item.student.name || item.student.studentName || 'Santri',
      kelas: item.student.classId || item.student.kelas || '-',
      pages: item.murojaah,
    }));

  // Top Performers (legacy fallback / combined)
  const topPerformers = allTotals
    .sort((a, b) => b.ziyadah - a.ziyadah)
    .slice(0, 5)
    .map((item) => ({
      studentId: item.student.id,
      name: item.student.name || item.student.studentName || 'Santri',
      kamar: item.student.dormitoryId || item.student.kamar || '-',
      kelas: item.student.classId || item.student.kelas || '-',
      totalZiyadahPages: item.ziyadah,
      totalMurojaahPages: item.murojaah,
    }));

  return {
    totalPagesZiyadah,
    totalPagesMurojaah,
    totalSetoranCount,
    ziyadahPercentage,
    murojaahPercentage,
    avgPagesPerSetoran,
    fluency,
    peakProductivity: {
      peakLabel,
      peakUnitName,
      peakDayName: peakUnitName,
      peakVolumePages,
      totalActiveDays: dateVolumeMap.size,
    },
    dailyTrends,
    topZiyadahPerformers,
    topMurojaahPerformers,
    topPerformers,
  };
}

/**
 * Calculate Discipline / Keamanan Analytics Summary
 */
export function calculateDisciplineAnalytics(
  students: Student[],
  options: ReportFilterOptions
): DisciplineAnalyticsSummary {
  const filteredStudents = filterStudentsByOptions(students, options);
  const { startDate, endDate } = getPresetDateBounds(options.dateRange);

  let totalActivePK = 0;
  let totalLifetimePK = 0;
  let totalDecayedPK = 0;
  let totalViolationsCount = 0;
  let activeDecayLocksCount = 0;
  let mahkamahCount = 0;

  const categoryBreakdown = {
    ringan: 0,
    sedang: 0,
    berat: 0,
  };

  const dateViolationMap = new Map<string, { newPK: number; count: number }>();
  const highRiskList: DisciplineAnalyticsSummary['highRiskStudents'] = [];

  filteredStudents.forEach((student) => {
    const decayInfo = calculateDecay(student);
    const activePK = decayInfo.activePK;
    const lifetimePK = student.lifetimePK || 0;

    const hasLock = decayInfo.isLocked || student.hasDecayLock || false;
    totalActivePK += activePK;
    totalLifetimePK += lifetimePK;
    if (hasLock) activeDecayLocksCount++;

    const rawHistory = student.violationHistory && student.violationHistory.length > 0
      ? student.violationHistory
      : (student.violationsHistory || []);

    let totalRawPK = 0;
    rawHistory.forEach((v: any) => {
      const vDate = normalizeDateStr(v.date);
      const points = Number(v.points) || 0;
      totalRawPK += points;

      if (vDate >= startDate && vDate <= endDate) {
        totalViolationsCount++;
        const cat = (v.category || 'ringan').toLowerCase();
        if (cat === 'berat' || points >= 50) {
          categoryBreakdown.berat++;
        } else if (cat === 'sedang' || points >= 20) {
          categoryBreakdown.sedang++;
        } else {
          categoryBreakdown.ringan++;
        }

        const currentTrend = dateViolationMap.get(vDate) || { newPK: 0, count: 0 };
        currentTrend.newPK += points;
        currentTrend.count += 1;
        dateViolationMap.set(vDate, currentTrend);
      }
    });

    // Mahkamah cases in date range
    const mahkamahHistory = student.mahkamahHistory || [];
    mahkamahHistory.forEach((m) => {
      const mDate = normalizeDateStr(m.date);
      if (mDate >= startDate && mDate <= endDate) {
        mahkamahCount++;
      }
    });

    // Decayed points calculation
    const totalRedeemed = (student.redemptionHistory || []).reduce((acc, r) => acc + (r.pkDeducted || 0), 0);
    const decayed = Math.max(0, totalRawPK - totalRedeemed - activePK);
    totalDecayedPK += decayed;

    if (activePK > 0 || hasLock) {
      highRiskList.push({
        studentId: student.id,
        name: student.name || student.studentName || 'Santri',
        kamar: student.dormitoryId || student.kamar || '-',
        kelas: student.classId || student.kelas || '-',
        activePK,
        lifetimePK,
        hasDecayLock: hasLock,
        statusLabel: decayInfo.statusLabel,
      });
    }
  });

  // Daily Trends array
  const dailyTrends: DailyTrendPoint[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const curDateStr = d.toISOString().split('T')[0];
    const trendData = dateViolationMap.get(curDateStr) || { newPK: 0, count: 0 };
    const dateParts = curDateStr.split('-');
    const displayLabel = `${dateParts[2]}/${dateParts[1]}`;

    dailyTrends.push({
      date: curDateStr,
      label: displayLabel,
      value1: trendData.newPK,
      value2: trendData.count,
    });
  }

  // Dynamic Peak Discipline Cases Calculation
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));

  const peakDisciplineBucket: Record<string, number> = {};
  let peakDisciplineType: 'day' | 'week' | 'month' = options.dateRange.preset === 'weekly' ? 'day' : options.dateRange.preset === 'monthly' ? 'week' : 'month';

  dateViolationMap.forEach((val, dateStr) => {
    const { bucketUnit, peakType } = getPeakBucketKeyAndLabel(dateStr, options.dateRange.preset, diffDays);
    peakDisciplineType = peakType;
    peakDisciplineBucket[bucketUnit] = (peakDisciplineBucket[bucketUnit] || 0) + val.newPK;
  });

  let peakDisciplineUnit = options.dateRange.preset === 'weekly' ? 'Jumat' : options.dateRange.preset === 'monthly' ? 'Pekan 1 (Tgl 1-7)' : 'Januari';
  let peakPKVolume = 0;

  Object.entries(peakDisciplineBucket).forEach(([unit, pk]) => {
    if (pk > peakPKVolume) {
      peakPKVolume = pk;
      peakDisciplineUnit = unit;
    }
  });

  const peakDisciplineLabel = peakDisciplineType === 'day' 
    ? 'Hari Puncak Kasus' 
    : peakDisciplineType === 'week' 
    ? 'Pekan Puncak Kasus' 
    : 'Bulan Puncak Kasus';

  // Sort high risk students by activePK descending
  const highRiskStudents = highRiskList
    .sort((a, b) => b.activePK - a.activePK)
    .slice(0, 10);

  return {
    totalActivePK,
    totalLifetimePK,
    totalDecayedPK,
    totalViolationsCount,
    activeDecayLocksCount,
    categoryBreakdown,
    mahkamahCount,
    peakDiscipline: {
      peakLabel: peakDisciplineLabel,
      peakUnitName: peakDisciplineUnit,
      peakPK: peakPKVolume,
    },
    dailyTrends,
    highRiskStudents,
  };
}

/**
 * Calculate Combined Executive Analytics Summary
 */
export function calculateCombinedAnalytics(
  students: Student[],
  options: ReportFilterOptions
): CombinedAnalyticsSummary {
  const filteredStudents = filterStudentsByOptions(students, options);
  const tahfizh = calculateTahfizhAnalytics(students, options);
  const discipline = calculateDisciplineAnalytics(students, options);

  let totalActivePP = 0;
  let totalLifetimePP = 0;

  filteredStudents.forEach((student) => {
    totalActivePP += student.activePP ?? student.poinPrestasi ?? 0;
    totalLifetimePP += student.lifetimePP || 0;
  });

  const totalActivePK = discipline.totalActivePK;
  const ratioPPvsPK = totalActivePK === 0 
    ? totalActivePP 
    : parseFloat((totalActivePP / Math.max(1, totalActivePK)).toFixed(2));

  // Discipline Index (0 - 100%)
  const avgPKPerStudent = filteredStudents.length > 0 ? totalActivePK / filteredStudents.length : 0;
  const overallDisciplineIndex = Math.max(0, Math.min(100, Math.round(100 - (avgPKPerStudent * 5))));

  return {
    totalStudentsCount: filteredStudents.length,
    totalActivePP,
    totalActivePK,
    totalLifetimePP,
    totalLifetimePK: discipline.totalLifetimePK,
    ratioPPvsPK,
    overallDisciplineIndex,
    tahfizh,
    discipline,
  };
}
