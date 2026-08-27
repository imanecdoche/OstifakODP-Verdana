import { Dormitory, DormitoryRoom, SchoolClass } from '../types';

// 8 ASRAMA RESMI - KAPASITAS 7 ORANG (KECUALI INDONESIA 12 ORANG)
export const OFFICIAL_DORMITORIES: Dormitory[] = [
  {
    id: 'asrama-qatar',
    name: 'Asrama Qatar',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'qatar-1', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '1', roomName: 'Qatar 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'qatar-2', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '2', roomName: 'Qatar 2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'qatar-3', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '3', roomName: 'Qatar 3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'qatar-4', dormitoryId: 'asrama-qatar', dormitoryName: 'Asrama Qatar', roomNumber: '4', roomName: 'Qatar 4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-turki',
    name: 'Asrama Turki',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'turki-1', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '1', roomName: 'Turki 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'turki-2', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '2', roomName: 'Turki 2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'turki-3', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '3', roomName: 'Turki 3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'turki-4', dormitoryId: 'asrama-turki', dormitoryName: 'Asrama Turki', roomNumber: '4', roomName: 'Turki 4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-indonesia',
    name: 'Asrama Indonesia',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 2,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'indonesia-a', dormitoryId: 'asrama-indonesia', dormitoryName: 'Asrama Indonesia', roomNumber: 'A', roomName: 'Indonesia A', ketuaKamar: '-', capacity: 12, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'indonesia-b', dormitoryId: 'asrama-indonesia', dormitoryName: 'Asrama Indonesia', roomNumber: 'B', roomName: 'Indonesia B', ketuaKamar: '-', capacity: 12, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-palestine-a',
    name: 'Asrama Palestine A',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'palestine-a1', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A1', roomName: 'Palestine A1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-a2', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A2', roomName: 'Palestine A2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-a3', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A3', roomName: 'Palestine A3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-a4', dormitoryId: 'asrama-palestine-a', dormitoryName: 'Asrama Palestine A', roomNumber: 'A4', roomName: 'Palestine A4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-palestine-b',
    name: 'Asrama Palestine B',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'palestine-b1', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B1', roomName: 'Palestine B1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-b2', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B2', roomName: 'Palestine B2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-b3', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B3', roomName: 'Palestine B3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'palestine-b4', dormitoryId: 'asrama-palestine-b', dormitoryName: 'Asrama Palestine B', roomNumber: 'B4', roomName: 'Palestine B4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-yaman',
    name: 'Asrama Yaman',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 1,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'yaman-1', dormitoryId: 'asrama-yaman', dormitoryName: 'Asrama Yaman', roomNumber: '1', roomName: 'Yaman 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-yordan',
    name: 'Asrama Yordan',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 4,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'yordan-1', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '1', roomName: 'Yordan 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'yordan-2', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '2', roomName: 'Yordan 2', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'yordan-3', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '3', roomName: 'Yordan 3', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
      { id: 'yordan-4', dormitoryId: 'asrama-yordan', dormitoryName: 'Asrama Yordan', roomNumber: '4', roomName: 'Yordan 4', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  },
  {
    id: 'asrama-emirate',
    name: 'Asrama Emirate',
    leaderName: '-',
    leaderClass: '-',
    roomCount: 1,
    achievements: [],
    violations: [],
    tags: [],
    rooms: [
      { id: 'emirate-1', dormitoryId: 'asrama-emirate', dormitoryName: 'Asrama Emirate', roomNumber: '1', roomName: 'Emirate 1', ketuaKamar: '-', capacity: 7, occupiedCount: 0, residents: [], cleanlinessScore: 0, neatnessScore: 0, aestheticScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
    ]
  }
];

// Flat array of all 24 official rooms
export const ALL_OFFICIAL_ROOMS: DormitoryRoom[] = OFFICIAL_DORMITORIES.flatMap(d => d.rooms);

export const OFFICIAL_CLASSES: SchoolClass[] = [
  { id: 'class-1', className: 'Kelas 1', level: 'Tingkat 1', generation: 'Angkatan 2026', major: 'Reguler', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-2', className: 'Kelas 2', level: 'Tingkat 2', generation: 'Angkatan 2025', major: 'Reguler', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-3', className: 'Kelas 3', level: 'Tingkat 3', generation: 'Angkatan 2024', major: 'Reguler', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-4-ipa', className: 'Kelas 4 IPA', level: 'Tingkat 4', generation: 'Angkatan 2023', major: 'IPA', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-4-ips', className: 'Kelas 4 IPS', level: 'Tingkat 4', generation: 'Angkatan 2023', major: 'IPS', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-5-ipa', className: 'Kelas 5 IPA', level: 'Tingkat 5', generation: 'Angkatan 2022', major: 'IPA', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-5-ips', className: 'Kelas 5 IPS', level: 'Tingkat 5', generation: 'Angkatan 2022', major: 'IPS', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-6-ipa', className: 'Kelas 6 IPA', level: 'Tingkat 6', generation: 'Angkatan 2021', major: 'IPA', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] },
  { id: 'class-6-ips', className: 'Kelas 6 IPS', level: 'Tingkat 6', generation: 'Angkatan 2021', major: 'IPS', waliKelas: '-', studentCount: 0, students: [], cleanlinessScore: 0, disciplineScore: 0, academicScore: 0, achievements: [], violations: [], specialNotes: '', tags: [] }
];
