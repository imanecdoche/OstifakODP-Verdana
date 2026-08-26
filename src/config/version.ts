export interface AppVersionInfo {
  version: string;
  channel: 'BETA' | 'STABLE';
  buildDate: string;
  author: {
    name: string;
    role: string;
    background: string;
    generation: string;
  };
  techStack: {
    category: string;
    items: string[];
  }[];
  languageDistribution: {
    language: string;
    percentage: number;
    color: string;
  }[];
}

export const APP_VERSION_INFO: AppVersionInfo = {
  version: 'v1.1.0.59b',
  channel: 'BETA',
  buildDate: '27 Agustus 2026',
  author: {
    name: 'Fatih Farhat Asshidiq',
    role: 'Lead Developer & System Architect',
    background: 'Alumni Pondok Pesantren Tahfizh Fajrul Karim',
    generation: 'Angkatan ke-7 (INGENIOUS GENERATION)',
  },
  techStack: [
    {
      category: 'Core Framework & Engine',
      items: ['React 19', 'TypeScript', 'Vite 6', 'Tailwind CSS v4', 'ESBuild'],
    },
    {
      category: 'Cloud Database & Realtime Sync',
      items: ['Firebase Firestore Realtime', 'BroadcastChannel Multi-Device Sync', 'Optimistic UI Engine'],
    },
    {
      category: 'Interface, Motion & Audio-Visual',
      items: ['Framer Motion', 'Lenis Smooth Scroll', 'Goey Toast Notification', 'OGL WebGL Shaders'],
    },
  ],
  languageDistribution: [
    { language: 'TypeScript', percentage: 84.6, color: '#3178C6' },
    { language: 'CSS & Tailwind', percentage: 8.9, color: '#38BDF8' },
    { language: 'HTML', percentage: 4.2, color: '#E34F26' },
    { language: 'JavaScript', percentage: 2.3, color: '#F7DF1E' },
  ],
};
