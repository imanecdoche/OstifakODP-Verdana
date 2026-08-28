import { 
  UserProfile, 
  DivisionInfo, 
  KPIMetric, 
  ViolationRecord, 
  WorkProgram, 
  RoomCleanliness, 
  MudirDirective, 
  NotificationItem,
  DivisionId,
  RoleLevel,
  UserRole
} from '../types';

export interface OfficialAccountConfig {
  email: string;
  name: string;
  role: UserRole;
  roleLevel: RoleLevel;
  roleTitle: string;
  divisionId: DivisionId | null;
  avatar: string;
}

export const OFFICIAL_ACCOUNTS: OfficialAccountConfig[] = [
  {
    email: 'mulhatalinuh@ostifak.edu',
    name: 'K.H. Mulhat Ali Nuh, Lc., M.A.',
    role: 'mudir',
    roleLevel: 0,
    roleTitle: 'Mudir',
    divisionId: null,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'pembina@ostifak.edu',
    name: 'Ust. Fatih Farhat Asshidiq',
    role: 'pembina',
    roleLevel: 1,
    roleTitle: 'Super Admin / Pembina OSTIFAK',
    divisionId: null,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'secretary@ostifak.edu',
    name: 'Sekretaris BPH OSTIFAK',
    role: 'bph',
    roleLevel: 2,
    roleTitle: 'Sekretaris BPH OSTIFAK',
    divisionId: 'bph',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'keamanan@ostifak.edu',
    name: 'Ketua Divisi Keamanan',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Keamanan & Mahkamah',
    divisionId: 'keamanan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'ibadah@ostifak.edu',
    name: 'Ketua Divisi Ibadah & Masjid',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Ibadah & Masjid',
    divisionId: 'ibadah',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'tahfizh@ostifak.edu',
    name: 'Ketua Divisi Tahfizh & Diniyah',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Tahfizh & Diniyah',
    divisionId: 'tahfizh',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'bahasa@ostifak.edu',
    name: 'Ketua Divisi Bahasa (Lughah)',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Bahasa (Lughah)',
    divisionId: 'bahasa',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'kebersihan@ostifak.edu',
    name: 'Ketua Divisi Kebersihan & Asrama',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Kebersihan & Asrama',
    divisionId: 'kebersihan',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'kesehatan@ostifak.edu',
    name: 'Ketua Divisi Kesehatan & UKS',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Kesehatan & UKS',
    divisionId: 'kesehatan',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
  },
  {
    email: 'saran@ostifak.edu',
    name: 'Pengelola Kotak Saran Digital',
    role: 'ketua_divisi',
    roleLevel: 3,
    roleTitle: 'Ketua Divisi Kotak Saran Digital',
    divisionId: 'saran',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  }
];

export const mockUsers: UserProfile[] = OFFICIAL_ACCOUNTS.map((acc, index) => ({
  id: `user-${index + 1}`,
  name: acc.name,
  role: acc.role,
  roleLevel: acc.roleLevel,
  roleTitle: acc.roleTitle,
  division: acc.divisionId || undefined,
  avatar: acc.avatar,
}));

export const mockDivisions: DivisionInfo[] = [
  {
    id: 'keamanan',
    name: 'Div. Keamanan',
    shortName: 'Keamanan',
    iconName: 'ShieldAlert',
    description: 'Penegakan disiplin, mahkamah santri, & perizinan',
    color: '#EF4444',
    badgeCount: 0,
  },
  {
    id: 'ibadah',
    name: 'Div. Ibadah & Masjid',
    shortName: 'Ibadah',
    iconName: 'Building2',
    description: 'Presensi shalat jamaah, jadwal imam & piket masjid',
    color: '#10B981',
    badgeCount: 0,
  },
  {
    id: 'tahfizh',
    name: 'Div. Tahfizh & Diniyah',
    shortName: 'Tahfizh',
    iconName: 'BookOpen',
    description: 'Mutabaah halaqah, target hafalan, & KBM diniyah',
    color: '#3B82F6',
    badgeCount: 0,
  },
  {
    id: 'bahasa',
    name: 'Div. Bahasa (Lughah)',
    shortName: 'Bahasa',
    iconName: 'Languages',
    description: 'Jasus tracker & pengawasan bahasa resmi Arab/Inggris',
    color: '#8B5CF6',
    badgeCount: 0,
  },
  {
    id: 'kebersihan',
    name: 'Div. Kebersihan & Asrama',
    shortName: 'Kebersihan',
    iconName: 'Sparkles',
    description: 'Inspeksi roan mingguan & evaluasi kebersihan kamar',
    color: '#F59E0B',
    badgeCount: 0,
  },
  {
    id: 'kesehatan',
    name: 'Div. Kesehatan & UKS',
    shortName: 'Kesehatan',
    iconName: 'HeartPulse',
    description: 'Log santri sakit, obat-obatan, & rujukan',
    color: '#EC4899',
    badgeCount: 0,
  },
  {
    id: 'bph',
    name: 'BPH & Kas Organisasi',
    shortName: 'BPH',
    iconName: 'Wallet',
    description: 'Pengelolaan surat, proposal, & kas keuangan',
    color: '#1E3D23',
    badgeCount: 0,
  },
  {
    id: 'saran',
    name: 'Kotak Saran Digital',
    shortName: 'Saran',
    iconName: 'MessageSquarePlus',
    description: 'Aspirasi & masukan santri terfilter',
    color: '#06B6D4',
    badgeCount: 0,
  },
];

// Kosongkan semua data dummy awal sesuai permintaan user
export const mockKPIMetrics: KPIMetric[] = [];
export const mockViolations: ViolationRecord[] = [];
export const mockWorkPrograms: WorkProgram[] = [];
export const mockRoomCleanliness: RoomCleanliness[] = [];
export const mockMudirDirectives: MudirDirective[] = [];
export const mockNotifications: NotificationItem[] = [];
