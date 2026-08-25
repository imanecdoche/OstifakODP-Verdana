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
