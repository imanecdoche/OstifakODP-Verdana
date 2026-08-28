import { Student, SantriRecord } from '../types';

export type ReportDatePreset = 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateRangeFilter {
  preset: ReportDatePreset;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
}

export interface ReportFilterOptions {
  dateRange: DateRangeFilter;
  dormitoryId?: string; // 'all' or specific room ID
  classId?: string;     // 'all' or specific class ID
  studentId?: string;   // 'all' or specific student UID for individual report
  searchQuery?: string;
}

export interface DailyTrendPoint {
  date: string;       // YYYY-MM-DD
  label: string;      // Display label (e.g., '24 Aug')
  value1: number;     // Primary metric (e.g., Ziyadah / New PK / Active PP)
  value2: number;     // Secondary metric (e.g., Murojaah / Resolved PK / Active PK)
}

export interface FluencyDistribution {
  lancar: number;     // Count of 'Lancar'
  mutqin: number;     // Count of 'Mutqin'
  perbaikan: number;  // Count of 'Perbaikan'
  total: number;
}

export interface PeakProductivityInfo {
  peakLabel: string;        // e.g. "Hari Puncak Produktivitas" | "Pekan Puncak Produktivitas" | "Bulan Puncak Produktivitas"
  peakUnitName: string;     // e.g. "Senin" | "Pekan 2 (Tgl 8-14)" | "Agustus"
  peakDayName?: string;     // Legacy compatibility
  peakVolumePages: number;
  totalActiveDays: number;
}

export interface TahfizhAnalyticsSummary {
  totalPagesZiyadah: number;
  totalPagesMurojaah: number;
  totalSetoranCount: number;
  ziyadahPercentage: number;   // 0 - 100
  murojaahPercentage: number;  // 0 - 100
  avgPagesPerSetoran: number;
  fluency: FluencyDistribution;
  peakProductivity: PeakProductivityInfo;
  dailyTrends: DailyTrendPoint[];
  topZiyadahPerformers: Array<{
    studentId: string;
    name: string;
    kelas: string;
    pages: number;
  }>;
  topMurojaahPerformers: Array<{
    studentId: string;
    name: string;
    kelas: string;
    pages: number;
  }>;
  topPerformers: Array<{
    studentId: string;
    name: string;
    kamar: string;
    kelas: string;
    totalZiyadahPages: number;
    totalMurojaahPages: number;
  }>;
}

export interface DisciplineAnalyticsSummary {
  totalActivePK: number;
  totalLifetimePK: number;
  totalDecayedPK: number;
  totalViolationsCount: number;
  activeDecayLocksCount: number; // Count of students with locked peluruhan
  categoryBreakdown: {
    ringan: number;
    sedang: number;
    berat: number;
  };
  mahkamahCount: number;
  peakDiscipline: {
    peakLabel: string;
    peakUnitName: string;
    peakPK: number;
  };
  dailyTrends: DailyTrendPoint[];
  highRiskStudents: Array<{
    studentId: string;
    name: string;
    kamar: string;
    kelas: string;
    activePK: number;
    lifetimePK: number;
    hasDecayLock: boolean;
    statusLabel: string;
  }>;
}

export interface CombinedAnalyticsSummary {
  totalStudentsCount: number;
  totalActivePP: number;
  totalActivePK: number;
  totalLifetimePP: number;
  totalLifetimePK: number;
  ratioPPvsPK: number;            // Ratio PP : PK
  overallDisciplineIndex: number; // 0 - 100% score
  tahfizh: TahfizhAnalyticsSummary;
  discipline: DisciplineAnalyticsSummary;
}
