export type RoleLevel = 0 | 1 | 2 | 3 | 4;

export type UserRole = 'mudir' | 'pembina' | 'bph' | 'ketua_divisi' | 'santri';

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  roleLevel: RoleLevel;
  roleTitle: string;
  division?: string;
  avatar: string;
  nis?: string;
  kamar?: string;
}

export type DivisionId = 
  | 'keamanan'
  | 'ibadah'
  | 'tahfizh'
  | 'bahasa'
  | 'kebersihan'
  | 'kesehatan'
  | 'bph'
  | 'saran';

export interface DivisionInfo {
  id: DivisionId;
  name: string;
  shortName: string;
  iconName: string;
  description: string;
  color: string;
  badgeCount?: number;
}

export interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
  icon: string;
  colorTheme: 'emerald' | 'amber' | 'rose' | 'cyan';
}

export type SeverityLevel = 'ringan' | 'sedang' | 'berat' | 'sangat_berat';
export type PenaltyStatus = 'selesai' | 'dalam_proses' | 'belum_dihukum';

export interface ViolationRecord {
  id: string;
  studentName: string;
  nis: string;
  kamar: string;
  violation: string;
  category: string;
  points: number;
  severity: SeverityLevel;
  status: PenaltyStatus;
  date: string;
  penaltyDescription: string;
  reportedBy: string;
}

export type ProgramStatus = 'selesai' | 'dalam_proses' | 'menunggu_persetujuan' | 'direncanakan';

export interface WorkProgram {
  id: string;
  title: string;
  divisionId: DivisionId;
  divisionName: string;
  status: ProgramStatus;
  progress: number;
  targetDate: string;
  budget?: string;
  pic: string;
}

export interface RoomCleanliness {
  id: string;
  roomName: string;
  building: string;
  score: number;
  rank: number;
  inspector: string;
  status: 'sangat_bersih' | 'bersih' | 'perlu_perhatian';
}

export interface MudirDirective {
  id: string;
  title: string;
  targetDivision: string;
  issuedDate: string;
  priority: 'tinggi' | 'sedang' | 'normal';
  status: 'aktif' | 'selesai';
  content: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: 'violation' | 'proposal' | 'directive' | 'cleanliness';
  read: boolean;
}

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
  ayatFrom?: number;
  ayatTo?: number;
  ayatCount?: number;
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
  points?: number; // Poin Prestasi (PP)
  description?: string;
  level?: string;
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

export interface StudentMahkamahEntry {
  id: string;
  divisions: string[];
  violation: string;
  penalty: string;
  date: string;
  points?: number;
  sessionNotes?: string;
  createdAt?: string;
}

export interface SantriRecord {
  id: string;
  studentName: string;
  nis: string;
  kamar: string;
  kelas: string;
  hafalan: string;
  poinPelanggaran: number;
  poinPrestasi?: number; // Akumulasi Poin Prestasi (PP)
  statusIbadah: string;
  birthDate?: string;
  domicile?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  isTahsinPassed?: boolean;
  violationsHistory?: StudentViolationEntry[];
  mahkamahHistory?: StudentMahkamahEntry[];
  hafalanHistory?: StudentHafalanEntry[];
  achievementsHistory?: StudentAchievementEntry[];
  permissionsHistory?: StudentPermissionEntry[];
}


