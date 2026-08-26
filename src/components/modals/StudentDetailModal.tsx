import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  X,
  User,
  BookOpen,
  ShieldAlert,
  Trophy,
  CalendarDays,
  CheckCircle2,
  Home,
  Phone,
  TrendingUp,
  Sparkles,
  Activity,
  BarChart3,
  Plus,
  BedDouble,
  GraduationCap,
  LineChart,
  ChevronDown,
  Search,
  Check,
  AlertTriangle,
  ArrowUpRight,
  Pencil
} from 'lucide-react';
import {
  SantriRecord,
  StudentHafalanEntry,
  StudentViolationEntry,
  StudentAchievementEntry,
  StudentPermissionEntry,
  updateSantriRecord,
  Dormitory,
  DormitoryRoom,
  SchoolClass,
  OFFICIAL_DORMITORIES,
  ALL_OFFICIAL_ROOMS,
  OFFICIAL_CLASSES,
  subscribeToDormitories,
  subscribeToClasses
} from '../../lib/firestoreService';
import { QURAN_SURAHS, QuranSurah, calculateQuranPages } from '../../data/quranSurahs';
import { gooeyToast } from 'goey-toast';
import { ScrollArea } from '../ui/ScrollArea';
import { Button } from '../ui/Button';
import { useLenisModalLock } from '../../lib/lenis';

export interface StudentDetailModalProps {
  student: SantriRecord | null;
  onClose: () => void;
  onStudentUpdated?: (updatedStudent: SantriRecord) => void;
  initialTab?: 'bio' | 'hafalan' | 'pelanggaran' | 'mahkamah' | 'prestasi' | 'izin';
  dormitories?: Dormitory[];
  rooms?: DormitoryRoom[];
  classes?: SchoolClass[];
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onStudentUpdated,
  initialTab = 'bio',
  dormitories: propDormitories,
  rooms: propRooms,
  classes: propClasses,
}) => {
  const [currentStudent, setCurrentStudent] = useState<SantriRecord | null>(student);
  const [detailActiveTab, setDetailActiveTab] = useState<'bio' | 'hafalan' | 'pelanggaran' | 'mahkamah' | 'prestasi' | 'izin'>(() => {
    try {
      const saved = localStorage.getItem('ostifak_student_modal_tab');
      if (saved && ['bio', 'hafalan', 'pelanggaran', 'mahkamah', 'prestasi', 'izin'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return initialTab;
  });

  const [mahkamahTimeFilter, setMahkamahTimeFilter] = useState<'1m' | '3m' | 'all'>('all');

  useEffect(() => {
    try {
      localStorage.setItem('ostifak_student_modal_tab', detailActiveTab);
    } catch {}
  }, [detailActiveTab]);

  // Tab horizontal scroll & shadow edge state
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const checkTabScroll = () => {
    if (tabContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabContainerRef.current;
      setShowLeftShadow(scrollLeft > 4);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkTabScroll();
    window.addEventListener('resize', checkTabScroll);
    return () => window.removeEventListener('resize', checkTabScroll);
  }, []);

  // Auto-scroll active tab into view whenever detailActiveTab changes
  useEffect(() => {
    const activeEl = tabRefs.current[detailActiveTab];
    if (activeEl && tabContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(checkTabScroll, 300);
    }
  }, [detailActiveTab]);

  // Sync state if student prop changes
  useEffect(() => {
    setCurrentStudent(student);
  }, [student]);

  const filteredMahkamahHistory = useMemo(() => {
    if (!currentStudent?.mahkamahHistory) return [];
    const list = currentStudent.mahkamahHistory;
    if (mahkamahTimeFilter === 'all') return list;

    const now = new Date().getTime();
    const daysLimit = mahkamahTimeFilter === '1m' ? 30 : 90;
    const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

    return list.filter((item) => {
      const itemTime = new Date(item.date).getTime();
      return !isNaN(itemTime) ? itemTime >= cutoff : true;
    });
  }, [currentStudent?.mahkamahHistory, mahkamahTimeFilter]);

  const mahkamahDivisionFrequency = useMemo(() => {
    const map: Record<string, number> = {};
    if (!currentStudent?.mahkamahHistory) return map;
    for (const item of currentStudent.mahkamahHistory) {
      if (item.divisions && Array.isArray(item.divisions)) {
        for (const div of item.divisions) {
          map[div] = (map[div] || 0) + 1;
        }
      }
    }
    return map;
  }, [currentStudent?.mahkamahHistory]);

  // Nested sub-modals state
  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [isMoveKamarModalOpen, setIsMoveKamarModalOpen] = useState(false);
  const [isMoveKelasModalOpen, setIsMoveKelasModalOpen] = useState(false);
  const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
  const [isHafalanChartModalOpen, setIsHafalanChartModalOpen] = useState(false);

  // Close on Escape shortcut
  useEffect(() => {
    if (!student) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (isIzinModalOpen) {
          setIsIzinModalOpen(false);
          return;
        }
        if (isMoveKamarModalOpen) {
          setIsMoveKamarModalOpen(false);
          return;
        }
        if (isMoveKelasModalOpen) {
          setIsMoveKelasModalOpen(false);
          return;
        }
        if (isSetoranModalOpen) {
          setIsSetoranModalOpen(false);
          return;
        }
        if (isHafalanChartModalOpen) {
          setIsHafalanChartModalOpen(false);
          return;
        }
        onClose();
      }
    };

    const handleCustomEscape = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ostifak-escape-pressed', handleCustomEscape);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [student, onClose, isIzinModalOpen, isMoveKamarModalOpen, isMoveKelasModalOpen, isSetoranModalOpen, isHafalanChartModalOpen]);

  // Hafalan Chart state
  const [chartTimeframe, setChartTimeframe] = useState<'pekan' | 'bulan' | 'tahun'>('pekan');
  const [chartCategoryFilter, setChartCategoryFilter] = useState<'all' | 'Hafalan Baru' | 'Murojaah'>('all');
  const [hoveredChartPointIndex, setHoveredChartPointIndex] = useState<number | null>(null);

  // Submit protection flags
  const [isSubmittingSetoran, setIsSubmittingSetoran] = useState(false);
  const [isSubmittingIzin, setIsSubmittingIzin] = useState(false);
  const [isSubmittingMoveKamar, setIsSubmittingMoveKamar] = useState(false);
  const [isSubmittingMoveKelas, setIsSubmittingMoveKelas] = useState(false);

  // Rekam Izin Form State
  const [izinType, setIzinType] = useState<string>('Pulang');
  const [izinReason, setIzinReason] = useState('');
  const [izinStartDate, setIzinStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [izinEndDate, setIzinEndDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);

  // Pindah Kamar / Pindah Kelas Form State
  const [targetKamar, setTargetKamar] = useState('');
  const [targetKelas, setTargetKelas] = useState('');

  // Catat Setoran Form State
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [surahQuery, setSurahQuery] = useState('');
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const surahComboRef = useRef<HTMLDivElement>(null);

  const [setoranCategory, setSetoranCategory] = useState<'Hafalan Baru' | 'Murojaah'>('Hafalan Baru');
  const [setoranAyatFrom, setSetoranAyatFrom] = useState<number | string>(1);
  const [setoranAyatTo, setSetoranAyatTo] = useState<number | string>(20);
  const [setoranJuz, setSetoranJuz] = useState('1');
  const [setoranPageFrom, setSetoranPageFrom] = useState<number | string>(2);
  const [setoranPageTo, setSetoranPageTo] = useState<number | string>(4);
  const [setoranKelancaranIndex, setSetoranKelancaranIndex] = useState<number>(2);
  const [setoranNotes, setSetoranNotes] = useState('');
  const [setoranUstadz, setSetoranUstadz] = useState('Ustadz Pembimbing');

  // Bio Tab Unified Inline Edit States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [editStudentName, setEditStudentName] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editKamar, setEditKamar] = useState('');
  const [editKelas, setEditKelas] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianPhoneDigits, setEditGuardianPhoneDigits] = useState('');
  const [editDomicile, setEditDomicile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatusIbadah, setEditStatusIbadah] = useState('');

  // Master Data State: Asrama & Kelas (Single Source of Truth)
  const [liveDormitories, setLiveDormitories] = useState<Dormitory[]>(
    propDormitories && propDormitories.length > 0 ? propDormitories : OFFICIAL_DORMITORIES
  );
  const [liveRooms, setLiveRooms] = useState<DormitoryRoom[]>(
    propRooms && propRooms.length > 0 ? propRooms : ALL_OFFICIAL_ROOMS
  );
  const [liveClasses, setLiveClasses] = useState<SchoolClass[]>(
    propClasses && propClasses.length > 0 ? propClasses : OFFICIAL_CLASSES
  );

  useEffect(() => {
    if (propRooms && propRooms.length > 0 && propDormitories && propDormitories.length > 0) {
      setLiveDormitories(propDormitories);
      setLiveRooms(propRooms);
      return;
    }
    const unsub = subscribeToDormitories((dorms, roomList) => {
      if (dorms && dorms.length > 0) setLiveDormitories(dorms);
      if (roomList && roomList.length > 0) setLiveRooms(roomList);
    });
    return () => unsub();
  }, [propDormitories, propRooms]);

  useEffect(() => {
    if (propClasses && propClasses.length > 0) {
      setLiveClasses(propClasses);
      return;
    }
    const unsub = subscribeToClasses((classList) => {
      if (classList && classList.length > 0) setLiveClasses(classList);
    });
    return () => unsub();
  }, [propClasses]);

  // Dynamic Unique Rooms from Master Data
  const availableKamarOptions = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    const add = (k: string) => {
      const trimmed = (k || '').trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        list.push(trimmed);
      }
    };
    if (currentStudent?.kamar) add(currentStudent.kamar);
    liveRooms.forEach((r) => {
      if (r.roomName) add(r.roomName);
    });
    return list;
  }, [currentStudent?.kamar, liveRooms]);

  // Dynamic Unique Classes from Master Data
  const availableKelasOptions = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    const add = (c: string) => {
      const trimmed = (c || '').trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        list.push(trimmed);
      }
    };
    if (currentStudent?.kelas) add(currentStudent.kelas);
    liveClasses.forEach((c) => {
      if (c.className) add(c.className);
    });
    return list;
  }, [currentStudent?.kelas, liveClasses]);

  // Date Formatting Helper (DD MMMM YY)
  const formatDateDDMMMMYY = (rawDate?: string, timestamp?: number): string => {
    const fullMonths = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (timestamp) {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const month = fullMonths[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day} ${month} ${year}`;
      }
    }
    if (!rawDate || !rawDate.trim()) return '-';
    
    // Check if ISO date string (YYYY-MM-DD)
    const isoMatch = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1].slice(-2);
      const monthIdx = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${fullMonths[monthIdx]} ${year}`;
      }
    }

    // Check if format "DD Month YYYY" or "DD Mmm YYYY"
    const indoMonthMap: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      agu: 7, agustus: 7, aug: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9, oct: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, dec: 11,
    };

    const tokens = rawDate.trim().split(/[\s,]+/);
    if (tokens.length >= 3) {
      const day = parseInt(tokens[0], 10);
      const monthKey = tokens[1].toLowerCase().replace('.', '');
      const yearRaw = tokens[2];
      const year = yearRaw.length === 4 ? yearRaw.slice(-2) : yearRaw;
      if (!isNaN(day) && indoMonthMap[monthKey] !== undefined) {
        return `${day} ${fullMonths[indoMonthMap[monthKey]]} ${year}`;
      }
    }

    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = fullMonths[d.getMonth()];
      const year = String(d.getFullYear()).slice(-2);
      return `${day} ${month} ${year}`;
    }

    return rawDate;
  };

  // Phone Validation & Formatting Helpers
  const formatIndonesianPhone = (rawPhone?: string): string => {
    if (!rawPhone || !rawPhone.trim()) return '-';
    let digits = rawPhone.replace(/[^\d]/g, '');
    if (digits.startsWith('62')) {
      digits = digits.slice(2);
    }
    while (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    if (!digits) return '-';
    const firstLen = digits.length >= 11 ? 3 : (digits.length >= 8 ? 3 : 4);
    const part1 = digits.slice(0, firstLen);
    const part2 = digits.slice(firstLen, firstLen + 4);
    const part3 = digits.slice(firstLen + 4, firstLen + 8);
    const part4 = digits.slice(firstLen + 8);
    const parts = [part1, part2, part3, part4].filter(Boolean);
    return `+62 ${parts.join('-')}`;
  };

  const cleanPhoneInputDigits = (raw: string): string => {
    let digits = raw.replace(/[^\d]/g, '');
    if (digits.startsWith('62')) {
      digits = digits.slice(2);
    }
    while (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits;
  };

  // Pre-fill fields with real student data without dummy hallucinations
  const handleStartEditBio = () => {
    if (!currentStudent) return;
    const activeKamar = currentStudent.kamar?.trim() || availableKamarOptions[0] || (liveRooms[0]?.roomName ?? 'Qatar 1');
    const activeKelas = currentStudent.kelas?.trim() || availableKelasOptions[0] || (liveClasses[0]?.className ?? 'Kelas 1');

    setEditStudentName(currentStudent.studentName || '');
    setEditNis(currentStudent.nis || '');
    setEditKamar(activeKamar);
    setEditKelas(activeKelas);
    setEditBirthDate(currentStudent.birthDate || '');
    setEditGuardianName(currentStudent.guardianName || '');
    setEditGuardianPhoneDigits(cleanPhoneInputDigits(currentStudent.guardianPhone || ''));
    setEditDomicile(currentStudent.domicile || '');
    setEditAddress(currentStudent.address || '');
    setEditStatusIbadah(currentStudent.statusIbadah || '100% Berjamaah');
    setIsEditingBio(true);
  };

  const handleSaveAllBio = async () => {
    if (!currentStudent) return;
    if (!editStudentName.trim()) {
      gooeyToast.error('Nama santri tidak boleh kosong.');
      return;
    }
    setIsSavingBio(true);
    const formattedPhone = editGuardianPhoneDigits ? formatIndonesianPhone(editGuardianPhoneDigits) : '';
    const updates: Partial<SantriRecord> = {
      studentName: editStudentName.trim(),
      nis: editNis.trim(),
      kamar: editKamar.trim(),
      kelas: editKelas.trim(),
      birthDate: editBirthDate.trim(),
      guardianName: editGuardianName.trim(),
      guardianPhone: formattedPhone === '-' ? '' : formattedPhone,
      domicile: editDomicile.trim(),
      address: editAddress.trim(),
      statusIbadah: editStatusIbadah.trim() || currentStudent.statusIbadah,
    };

    try {
      await updateSantriRecord(currentStudent.id, updates);
      const updated = { ...currentStudent, ...updates };
      setCurrentStudent(updated);
      onStudentUpdated?.(updated);
      setIsEditingBio(false);
      gooeyToast.success('Biodata santri berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating student bio:', err);
      gooeyToast.error('Gagal menyimpan perubahan.');
    } finally {
      setIsSavingBio(false);
    }
  };

  useLenisModalLock(
    !!student ||
    isIzinModalOpen ||
    isMoveKamarModalOpen ||
    isMoveKelasModalOpen ||
    isSetoranModalOpen ||
    isHafalanChartModalOpen
  );

  // Close surah dropdown on outside click
  useEffect(() => {
    if (!isSurahDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (surahComboRef && surahComboRef.current && !surahComboRef.current.contains(e.target as Node)) {
        setIsSurahDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSurahDropdownOpen]);

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim().toLowerCase();
    if (!q) return QURAN_SURAHS;
    return QURAN_SURAHS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        s.arabicName.includes(q)
    );
  }, [surahQuery]);

  const handleSelectSurah = (surah: QuranSurah) => {
    setSelectedSurah(surah);
    setSurahQuery('');
    setIsSurahDropdownOpen(false);
    setSetoranJuz(String(surah.juz));
    
    const fromA = 1;
    const toA = Math.min(20, surah.totalAyat);
    setSetoranAyatFrom(fromA);
    setSetoranAyatTo(toA);

    const { fromPage, toPage } = calculateQuranPages(surah.number, fromA, toA);
    setSetoranPageFrom(fromPage);
    setSetoranPageTo(toPage);
  };

  const handleAyatFromChange = (val: string) => {
    const num = parseInt(val, 10);
    setSetoranAyatFrom(val === '' ? '' : num);
    if (!isNaN(num) && selectedSurah) {
      const clampedFrom = Math.max(1, Math.min(num, selectedSurah.totalAyat));
      const currTo = parseInt(String(setoranAyatTo), 10) || clampedFrom;
      const clampedTo = Math.max(clampedFrom, Math.min(currTo, selectedSurah.totalAyat));
      const { fromPage, toPage } = calculateQuranPages(selectedSurah.number, clampedFrom, clampedTo);
      setSetoranPageFrom(fromPage);
      setSetoranPageTo(toPage);
    }
  };

  const handleAyatToChange = (val: string) => {
    const num = parseInt(val, 10);
    setSetoranAyatTo(val === '' ? '' : num);
    if (!isNaN(num) && selectedSurah) {
      const currFrom = parseInt(String(setoranAyatFrom), 10) || 1;
      const clampedTo = Math.max(currFrom, Math.min(num, selectedSurah.totalAyat));
      const { fromPage, toPage } = calculateQuranPages(selectedSurah.number, currFrom, clampedTo);
      setSetoranPageFrom(fromPage);
      setSetoranPageTo(toPage);
    }
  };

  // Monotone Cubic Spline Generator (Fritsch-Carlson algorithm) with Zero-Clamp Guard
  const getSmoothSvgPath = (points: { x: number; y: number; v?: number }[], baseY = 165): string => {
    const n = points.length;
    if (n === 0) return '';
    if (n === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    if (n === 2) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;

    const dx: number[] = [];
    const dy: number[] = [];
    const slopes: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      const dX = points[i + 1].x - points[i].x;
      const dY = points[i + 1].y - points[i].y;
      dx.push(dX);
      dy.push(dY);
      slopes.push(dX === 0 ? 0 : dY / dX);
    }

    const m: number[] = new Array(n).fill(0);
    m[0] = slopes[0];
    m[n - 1] = slopes[n - 2];

    for (let i = 1; i < n - 1; i++) {
      const sPrev = slopes[i - 1];
      const sNext = slopes[i];

      if (sPrev * sNext <= 0 || sPrev === 0 || sNext === 0) {
        m[i] = 0;
      } else {
        m[i] = (2 * sPrev * sNext) / (sPrev + sNext);
      }

      if (Math.abs(points[i].y - baseY) < 0.001 || (points[i].v !== undefined && points[i].v === 0)) {
        if (
          Math.abs(points[i - 1].y - baseY) < 0.001 ||
          Math.abs(points[i + 1].y - baseY) < 0.001 ||
          points[i - 1].v === 0 ||
          points[i + 1].v === 0
        ) {
          m[i] = 0;
        }
      }
    }

    if (Math.abs(points[0].y - baseY) < 0.001 || points[0].v === 0) {
      if (Math.abs(points[1].y - baseY) < 0.001 || points[1].v === 0) {
        m[0] = 0;
      }
    }
    if (Math.abs(points[n - 1].y - baseY) < 0.001 || points[n - 1].v === 0) {
      if (Math.abs(points[n - 2].y - baseY) < 0.001 || points[n - 2].v === 0) {
        m[n - 1] = 0;
      }
    }

    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      if (
        (Math.abs(p0.y - baseY) < 0.001 && Math.abs(p1.y - baseY) < 0.001) ||
        (p0.v === 0 && p1.v === 0)
      ) {
        path += ` L ${p1.x.toFixed(2)} ${baseY.toFixed(2)}`;
        continue;
      }

      const segmentDx = dx[i];
      const cp1x = p0.x + segmentDx / 3;
      let cp1y = p0.y + (m[i] * segmentDx) / 3;

      const cp2x = p1.x - segmentDx / 3;
      let cp2y = p1.y - (m[i + 1] * segmentDx) / 3;

      cp1y = Math.min(baseY, Math.max(15, cp1y));
      cp2y = Math.min(baseY, Math.max(15, cp2y));

      path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }

    return path;
  };

  const parseHafalanDate = (entry: StudentHafalanEntry): Date => {
    if (entry.timestamp && typeof entry.timestamp === 'number') {
      return new Date(entry.timestamp);
    }
    if (!entry.date) return new Date();

    if (entry.date.includes('-')) {
      const d = new Date(entry.date);
      if (!isNaN(d.getTime())) return d;
    }

    const indonesianMonths: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
      jul: 6, agu: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11
    };

    const parts = entry.date.trim().split(/[\s/.-]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      let month = -1;
      const mStr = parts[1].toLowerCase().slice(0, 3);
      if (indonesianMonths[mStr] !== undefined) {
        month = indonesianMonths[mStr];
      } else {
        month = parseInt(parts[1], 10) - 1;
      }
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month >= 0 && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    const fallback = new Date(entry.date);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  const hafalanStats = useMemo(() => {
    const history = currentStudent?.hafalanHistory || [];
    if (history.length === 0) {
      return {
        ziyadahWeekPages: 0,
        ziyadahWeekCount: 0,
        ziyadahMonthPages: 0,
        ziyadahMonthCount: 0,
        murojaahWeekPages: 0,
        murojaahWeekCount: 0,
        murojaahMonthPages: 0,
        murojaahMonthCount: 0,
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const dayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    let ziyadahWeekPages = 0;
    let ziyadahWeekCount = 0;
    let ziyadahMonthPages = 0;
    let ziyadahMonthCount = 0;

    let murojaahWeekPages = 0;
    let murojaahWeekCount = 0;
    let murojaahMonthPages = 0;
    let murojaahMonthCount = 0;

    history.forEach((h) => {
      const p = h.pageCount || (h.pageTo && h.pageFrom ? Math.max(1, h.pageTo - h.pageFrom + 1) : 1);
      const entryDate = parseHafalanDate(h);
      const isThisWeek = entryDate >= monday && entryDate <= sunday;
      const isThisMonth = entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;

      if (h.category === 'Murojaah') {
        if (isThisWeek) {
          murojaahWeekPages += p;
          murojaahWeekCount += 1;
        }
        if (isThisMonth) {
          murojaahMonthPages += p;
          murojaahMonthCount += 1;
        }
      } else {
        if (isThisWeek) {
          ziyadahWeekPages += p;
          ziyadahWeekCount += 1;
        }
        if (isThisMonth) {
          ziyadahMonthPages += p;
          ziyadahMonthCount += 1;
        }
      }
    });

    return {
      ziyadahWeekPages: Math.round(ziyadahWeekPages * 10) / 10,
      ziyadahWeekCount,
      ziyadahMonthPages: Math.round(ziyadahMonthPages * 10) / 10,
      ziyadahMonthCount,
      murojaahWeekPages: Math.round(murojaahWeekPages * 10) / 10,
      murojaahWeekCount,
      murojaahMonthPages: Math.round(murojaahMonthPages * 10) / 10,
      murojaahMonthCount,
    };
  }, [currentStudent?.hafalanHistory]);

  const hafalanChartData = useMemo(() => {
    const history = currentStudent?.hafalanHistory || [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (chartTimeframe === 'pekan') {
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);

      const labels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];
      const ziyadah = [0, 0, 0, 0, 0, 0, 0];
      const murojaah = [0, 0, 0, 0, 0, 0, 0];

      history.forEach((h) => {
        const d = parseHafalanDate(h);
        const diffDays = Math.floor((d.getTime() - monday.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays < 7) {
          const p = h.pageCount || (h.pageTo && h.pageFrom ? Math.max(1, h.pageTo - h.pageFrom + 1) : 1);
          if (h.category === 'Murojaah') {
            murojaah[diffDays] += p;
          } else {
            ziyadah[diffDays] += p;
          }
        }
      });

      const maxVal = Math.max(0, ...ziyadah, ...murojaah);
      const maxY = maxVal > 0 ? Math.max(2, Math.ceil(maxVal * 1.25)) : 4;
      const totalZiyadah = ziyadah.reduce((a, b) => a + b, 0);
      const totalMurojaah = murojaah.reduce((a, b) => a + b, 0);
      const activeDays = ziyadah.filter((v, i) => v > 0 || murojaah[i] > 0).length;

      return {
        labels,
        ziyadah,
        murojaah,
        maxY,
        totalZiyadah: Math.round(totalZiyadah * 10) / 10,
        totalMurojaah: Math.round(totalMurojaah * 10) / 10,
        avgPerSession: activeDays > 0 ? Math.round(((totalZiyadah + totalMurojaah) / activeDays) * 10) / 10 : 0,
        hasData: totalZiyadah > 0 || totalMurojaah > 0,
      };
    } else if (chartTimeframe === 'bulan') {
      const labels = ['Pekan 1 (1-7)', 'Pekan 2 (8-14)', 'Pekan 3 (15-21)', 'Pekan 4 (22+)'];
      const ziyadah = [0, 0, 0, 0];
      const murojaah = [0, 0, 0, 0];

      history.forEach((h) => {
        const d = parseHafalanDate(h);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          const dateNum = d.getDate();
          let weekIdx = 0;
          if (dateNum >= 1 && dateNum <= 7) weekIdx = 0;
          else if (dateNum >= 8 && dateNum <= 14) weekIdx = 1;
          else if (dateNum >= 15 && dateNum <= 21) weekIdx = 2;
          else weekIdx = 3;

          const p = h.pageCount || (h.pageTo && h.pageFrom ? Math.max(1, h.pageTo - h.pageFrom + 1) : 1);
          if (h.category === 'Murojaah') {
            murojaah[weekIdx] += p;
          } else {
            ziyadah[weekIdx] += p;
          }
        }
      });

      const maxVal = Math.max(0, ...ziyadah, ...murojaah);
      const maxY = maxVal > 0 ? Math.max(4, Math.ceil(maxVal * 1.25)) : 10;
      const totalZiyadah = ziyadah.reduce((a, b) => a + b, 0);
      const totalMurojaah = murojaah.reduce((a, b) => a + b, 0);
      const activeWeeks = ziyadah.filter((v, i) => v > 0 || murojaah[i] > 0).length;

      return {
        labels,
        ziyadah,
        murojaah,
        maxY,
        totalZiyadah: Math.round(totalZiyadah * 10) / 10,
        totalMurojaah: Math.round(totalMurojaah * 10) / 10,
        avgPerSession: activeWeeks > 0 ? Math.round(((totalZiyadah + totalMurojaah) / activeWeeks) * 10) / 10 : 0,
        hasData: totalZiyadah > 0 || totalMurojaah > 0,
      };
    } else {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const ziyadah = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const murojaah = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      history.forEach((h) => {
        const d = parseHafalanDate(h);
        if (d.getFullYear() === currentYear) {
          const mIdx = d.getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            const p = h.pageCount || (h.pageTo && h.pageFrom ? Math.max(1, h.pageTo - h.pageFrom + 1) : 1);
            if (h.category === 'Murojaah') {
              murojaah[mIdx] += p;
            } else {
              ziyadah[mIdx] += p;
            }
          }
        }
      });

      const maxVal = Math.max(0, ...ziyadah, ...murojaah);
      const maxY = maxVal > 0 ? Math.max(10, Math.ceil(maxVal * 1.25)) : 20;
      const totalZiyadah = ziyadah.reduce((a, b) => a + b, 0);
      const totalMurojaah = murojaah.reduce((a, b) => a + b, 0);
      const activeMonths = ziyadah.filter((v, i) => v > 0 || murojaah[i] > 0).length;

      return {
        labels,
        ziyadah,
        murojaah,
        maxY,
        totalZiyadah: Math.round(totalZiyadah * 10) / 10,
        totalMurojaah: Math.round(totalMurojaah * 10) / 10,
        avgPerSession: activeMonths > 0 ? Math.round(((totalZiyadah + totalMurojaah) / activeMonths) * 10) / 10 : 0,
        hasData: totalZiyadah > 0 || totalMurojaah > 0,
      };
    }
  }, [currentStudent?.hafalanHistory, chartTimeframe]);

  const handleOpenSetoranModal = () => {
    if (!currentStudent) return;
    const is30 = currentStudent.hafalan?.includes('30') || parseInt(currentStudent.hafalan || '0', 10) >= 30;
    if (is30) {
      setSetoranCategory('Murojaah');
    } else {
      setSetoranCategory('Hafalan Baru');
    }

    const initialSurah = QURAN_SURAHS[1];
    setSelectedSurah(initialSurah);
    setSurahQuery('');
    setIsSurahDropdownOpen(false);
    setSetoranJuz('1');
    setSetoranAyatFrom(1);
    setSetoranAyatTo(20);
    const { fromPage, toPage } = calculateQuranPages(initialSurah.number, 1, 20);
    setSetoranPageFrom(fromPage);
    setSetoranPageTo(toPage);
    setSetoranKelancaranIndex(2);
    setSetoranNotes('');
    setSetoranUstadz('Ustadz Pembimbing');
    setIsSetoranModalOpen(true);
  };

  const handleSaveSetoran = async () => {
    if (!currentStudent) return;
    if (isSubmittingSetoran) return;
    if (!selectedSurah) {
      gooeyToast.error('Harap pilih nama surah yang disetorkan!');
      return;
    }
    setIsSubmittingSetoran(true);

    const fromA = parseInt(String(setoranAyatFrom), 10) || 1;
    const toA = parseInt(String(setoranAyatTo), 10) || fromA;
    const fromP = parseInt(String(setoranPageFrom), 10) || selectedSurah.startPage;
    const toP = parseInt(String(setoranPageTo), 10) || fromP;
    const pageCount = Math.max(1, toP - fromP + 1);

    const kelancaranLabels = [
      'Perlu Diulang (D)',
      'Jayyid / Lumayan (C)',
      'Jayyid Jiddan / Lancar (B)',
      'Mumtaz / Sangat Lancar (A)'
    ];
    const kelancaranShort = ['Perlu diulang', 'Lumayan', 'Lancar', 'Sangat Lancar'][setoranKelancaranIndex] || 'Lancar';
    const predikat = kelancaranLabels[setoranKelancaranIndex] || 'Jayyid Jiddan (B)';

    const surahDisplay = `QS. ${selectedSurah.name} (Ayat ${fromA}-${toA})`;

    const newHafalanEntry: StudentHafalanEntry = {
      id: `haf_${Date.now()}`,
      surah: surahDisplay,
      juz: `Juz ${setoranJuz}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      predikat: predikat,
      category: setoranCategory,
      pageFrom: fromP,
      pageTo: toP,
      pageCount: pageCount,
      kelancaran: kelancaranShort,
      ustadz: setoranUstadz.trim() || 'Ustadz Pembimbing',
      notes: setoranNotes.trim(),
    };

    const updatedHafalanList = [newHafalanEntry, ...(currentStudent.hafalanHistory || [])];
    const updatedStudent: SantriRecord = {
      ...currentStudent,
      hafalanHistory: updatedHafalanList,
    };

    setCurrentStudent(updatedStudent);
    if (onStudentUpdated) onStudentUpdated(updatedStudent);
    setIsSetoranModalOpen(false);
    gooeyToast.success(`Berhasil! Setoran ${setoranCategory.toLowerCase()} ${currentStudent.studentName} berhasil dicatat!`);

    try {
      await updateSantriRecord(currentStudent.id, {
        hafalanHistory: updatedHafalanList,
      });
    } catch (err) {
      console.error('Failed to sync setoran to Firestore:', err);
    } finally {
      setIsSubmittingSetoran(false);
    }
  };

  const handleSaveIzin = async () => {
    if (!currentStudent) return;
    if (isSubmittingIzin) return;
    if (!izinReason.trim()) {
      gooeyToast.error('Harap masukkan alasan/keterangan izin!');
      return;
    }
    setIsSubmittingIzin(true);

    const newIzinEntry: StudentPermissionEntry = {
      id: `iz_${Date.now()}`,
      type: izinType,
      reason: izinReason.trim(),
      startDate: izinStartDate,
      endDate: izinEndDate,
      status: 'Aktif',
    };

    const updatedPermissionsHistory = [newIzinEntry, ...(currentStudent.permissionsHistory || [])];
    const updatedStudent: SantriRecord = {
      ...currentStudent,
      permissionsHistory: updatedPermissionsHistory,
    };

    setCurrentStudent(updatedStudent);
    if (onStudentUpdated) onStudentUpdated(updatedStudent);
    setIsIzinModalOpen(false);
    gooeyToast.success(`Surat izin santri ${currentStudent.studentName} berhasil direkam!`);

    try {
      await updateSantriRecord(currentStudent.id, {
        permissionsHistory: updatedPermissionsHistory,
      });
    } catch (err) {
      console.error('Failed to sync izin to Firestore:', err);
    } finally {
      setIsSubmittingIzin(false);
    }
  };

  const handleSaveMoveKamar = async () => {
    if (!currentStudent || !targetKamar) return;
    if (isSubmittingMoveKamar) return;
    setIsSubmittingMoveKamar(true);

    const updatedStudent: SantriRecord = {
      ...currentStudent,
      kamar: targetKamar,
    };

    setCurrentStudent(updatedStudent);
    if (onStudentUpdated) onStudentUpdated(updatedStudent);
    setIsMoveKamarModalOpen(false);
    gooeyToast.success(`Santri ${currentStudent.studentName} berhasil dipindahkan ke ${targetKamar}!`);

    try {
      await updateSantriRecord(currentStudent.id, {
        kamar: targetKamar,
      });
    } catch (err) {
      console.error('Failed to sync move kamar to Firestore:', err);
    } finally {
      setIsSubmittingMoveKamar(false);
    }
  };

  const handleSaveMoveKelas = async () => {
    if (!currentStudent || !targetKelas) return;
    if (isSubmittingMoveKelas) return;
    setIsSubmittingMoveKelas(true);

    const updatedStudent: SantriRecord = {
      ...currentStudent,
      kelas: targetKelas,
    };

    setCurrentStudent(updatedStudent);
    if (onStudentUpdated) onStudentUpdated(updatedStudent);
    setIsMoveKelasModalOpen(false);
    gooeyToast.success(`Santri ${currentStudent.studentName} berhasil dipindahkan ke kelas ${targetKelas}!`);

    try {
      await updateSantriRecord(currentStudent.id, {
        kelas: targetKelas,
      });
    } catch (err) {
      console.error('Failed to sync move kelas to Firestore:', err);
    } finally {
      setIsSubmittingMoveKelas(false);
    }
  };

  if (!student || !currentStudent) return null;

  return (
    <>
      {/* 1. MODAL UTAMA DETAIL SANTRI (MULTI-TAB VIEW) */}
      {!isIzinModalOpen && !isMoveKamarModalOpen && !isMoveKelasModalOpen && !isSetoranModalOpen && !isHafalanChartModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-4xl h-[92dvh] sm:h-[85vh] max-h-[95dvh] sm:max-h-[90vh] flex flex-col rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto animate-in fade-in zoom-in-95">
            
            {/* Header Modal (Clean, No Icon, Red Close Box) */}
            <div className="bg-[#142A18] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-white truncate">
                  {currentStudent.studentName}
                </h3>
                <p className="text-xs text-white/70 truncate mt-0.5">
                  NIS: {currentStudent.nis || '-'} | {currentStudent.kamar} | {currentStudent.kelas}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigasi Tab (Segmented Button 1 Row dengan Shadow Edge & Auto-Centering) */}
            <div className="relative border-b border-slate-200/80 bg-white shrink-0">
              {/* Left Shadow Indicator */}
              <div
                className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 transition-opacity duration-200 ${
                  showLeftShadow ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Scrollable Tab Track */}
              <div
                ref={tabContainerRef}
                onScroll={checkTabScroll}
                className="px-4 sm:px-6 pt-3 pb-2.5 flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
              >
                {[
                  { id: 'bio', label: 'Bio' },
                  { id: 'hafalan', label: 'Hafalan' },
                  { id: 'pelanggaran', label: 'Pelanggaran' },
                  { id: 'mahkamah', label: 'Rekam Mahkamah' },
                  { id: 'prestasi', label: 'Prestasi' },
                  { id: 'izin', label: 'Riwayat Izin' },
                ].map((t) => {
                  const isActive = detailActiveTab === t.id;
                  return (
                    <button
                      key={t.id}
                      ref={(el) => {
                        tabRefs.current[t.id] = el;
                      }}
                      type="button"
                      onClick={() => setDetailActiveTab(t.id as any)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-[#142A18] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span>{t.label}</span>
                      {t.id === 'pelanggaran' && currentStudent.poinPelanggaran > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold">
                          {currentStudent.poinPelanggaran} Pts
                        </span>
                      )}
                      {t.id === 'mahkamah' && currentStudent.mahkamahHistory && currentStudent.mahkamahHistory.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-white font-bold">
                          {currentStudent.mahkamahHistory.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Shadow Indicator */}
              <div
                className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 transition-opacity duration-200 ${
                  showRightShadow ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* Modal Body (Scrollable Multi-Tab Content) */}
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-6 space-y-6 text-xs"
              topOffset="top-3"
              bottomOffset="bottom-3"
            >
              {/* TAB 1: BIO (Unboxed 2-Column Layout with Top Unified Edit Button) */}
              {detailActiveTab === 'bio' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* 1. Top Action Bar: Unified Edit Button at the Top */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] font-headline">Biodata & Informasi Santri</h3>
                      <p className="text-[11px] text-slate-500 font-body">Data identitas santri, penempatan kamar/kelas, dan kontak wali.</p>
                    </div>

                    {!isEditingBio ? (
                      <button
                        type="button"
                        onClick={handleStartEditBio}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Edit Semua Informasi Biodata"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Biodata</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingBio(false)}
                          disabled={isSavingBio}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAllBio}
                          disabled={isSavingBio}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSavingBio ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Unboxed 2-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* SECTION 1: Data Pribadi & Santri (Unboxed) */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2 font-headline pb-2 border-b border-slate-100">
                        <User className="w-4 h-4 text-[#059669]" />
                        Informasi Pribadi & Santri
                      </h4>

                      {!isEditingBio ? (
                        <div className="space-y-3 text-xs divide-y divide-slate-100">
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Nama Lengkap</span>
                            <span className="font-semibold text-slate-900">{currentStudent.studentName || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Nomor Induk Santri (NIS)</span>
                            <span className="font-semibold text-slate-900">
                              {currentStudent.nis || '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Kamar Asrama</span>
                            <span className="font-semibold text-[#059669]">{currentStudent.kamar || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Kelas / Tingkat</span>
                            <span className="font-semibold text-slate-900">{currentStudent.kelas || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Tanggal Lahir</span>
                            <span className="font-semibold text-slate-900">{currentStudent.birthDate || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Status Keaktifan</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Santri Mukim Aktif
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                            <input
                              type="text"
                              value={editStudentName}
                              onChange={(e) => setEditStudentName(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Induk Santri (NIS)</label>
                            <input
                              type="text"
                              value={editNis}
                              onChange={(e) => setEditNis(e.target.value)}
                              placeholder="Contoh: NIS-2026-001"
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kamar Asrama</label>
                              <select
                                value={editKamar}
                                onChange={(e) => setEditKamar(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs cursor-pointer font-medium"
                              >
                                {availableKamarOptions.map((k) => (
                                  <option key={k} value={k}>
                                    {k}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kelas / Tingkat</label>
                              <select
                                value={editKelas}
                                onChange={(e) => setEditKelas(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs cursor-pointer font-medium"
                              >
                                {availableKelasOptions.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                            <input
                              type="text"
                              value={editBirthDate}
                              onChange={(e) => setEditBirthDate(e.target.value)}
                              placeholder="Contoh: 14 Mei 2008 atau 2008-05-14"
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: Wali Santri & Alamat Asal (Unboxed) */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2 font-headline pb-2 border-b border-slate-100">
                        <Home className="w-4 h-4 text-[#059669]" />
                        Wali Santri & Alamat Asal
                      </h4>

                      {!isEditingBio ? (
                        <div className="space-y-3 text-xs divide-y divide-slate-100">
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Nama Wali / Orang Tua</span>
                            <span className="font-semibold text-slate-900">
                              {currentStudent.guardianName || '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Nomor Telepon / WhatsApp</span>
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5 font-mono">
                              {currentStudent.guardianPhone ? (
                                <>
                                  <Phone className="w-3.5 h-3.5 text-[#059669]" />
                                  {formatIndonesianPhone(currentStudent.guardianPhone)}
                                </>
                              ) : (
                                '-'
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Kota Domisili</span>
                            <span className="font-semibold text-slate-900">{currentStudent.domicile || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start pt-2">
                            <span className="text-slate-500 font-medium">Alamat Rumah</span>
                            <span className="font-medium text-slate-800 text-right max-w-[220px] leading-relaxed">
                              {currentStudent.address || '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-500 font-medium">Status Presensi Ibadah</span>
                            <span className="font-semibold text-[#0F172A]">{currentStudent.statusIbadah || '100% Berjamaah'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Wali / Orang Tua</label>
                            <input
                              type="text"
                              value={editGuardianName}
                              onChange={(e) => setEditGuardianName(e.target.value)}
                              placeholder="Nama Ayah / Ibu / Wali"
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                            <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 overflow-hidden shadow-2xs">
                              <span className="bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border-r border-slate-300 select-none">
                                +62
                              </span>
                              <input
                                type="tel"
                                value={editGuardianPhoneDigits}
                                onChange={(e) => {
                                  const cleaned = cleanPhoneInputDigits(e.target.value);
                                  setEditGuardianPhoneDigits(cleaned);
                                }}
                                placeholder="821-1150-0190"
                                className="flex-1 px-3 py-1.5 text-xs text-slate-900 bg-transparent border-0 focus:outline-hidden font-mono"
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Awalan 0 otomatis diabaikan. Format: {formatIndonesianPhone(editGuardianPhoneDigits || '82111500190')}
                            </p>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kota Domisili</label>
                            <input
                              type="text"
                              value={editDomicile}
                              onChange={(e) => setEditDomicile(e.target.value)}
                              placeholder="Contoh: Bandung, Jawa Barat"
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alamat Rumah Lengkap</label>
                            <textarea
                              rows={2}
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              placeholder="Alamat lengkap domisili santri"
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status Presensi Ibadah</label>
                            <input
                              type="text"
                              value={editStatusIbadah}
                              onChange={(e) => setEditStatusIbadah(e.target.value)}
                              placeholder="Contoh: Disiplin 5 Waktu"
                              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: HAFALAN */}
              {detailActiveTab === 'hafalan' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Top Summary Cards (1 Row, 2 Cards) */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase">Capaian Hafalan</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{currentStudent.hafalan}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase">Status Uji Tahsin</p>
                      <p className={`text-base font-bold mt-1 ${currentStudent.isTahsinPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {currentStudent.isTahsinPassed ? 'Lulus' : 'Bimbingan'}
                      </p>
                    </div>
                  </div>

                  {/* Compact Stats Cards (4 Metrics with Clickable Chart Navigation, No Icons) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Card 1: Ziyadah Pekan Ini */}
                    <button
                      type="button"
                      onClick={() => {
                        setChartTimeframe('pekan');
                        setChartCategoryFilter('Hafalan Baru');
                        setIsHafalanChartModalOpen(true);
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-600 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ziyadah Pekan Ini</span>
                      </div>
                      <p className="text-base font-bold text-[#0F172A] mt-1 font-headline">
                        {hafalanStats.ziyadahWeekPages} <span className="text-xs font-semibold text-slate-500 font-body">Hal</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                        <span>{hafalanStats.ziyadahWeekCount}x Setoran</span>
                        <span className="text-slate-300">•</span>
                        <span className="underline group-hover:text-emerald-900 font-semibold">Grafik ↗</span>
                      </p>
                    </button>

                    {/* Card 2: Ziyadah Bulan Ini */}
                    <button
                      type="button"
                      onClick={() => {
                        setChartTimeframe('bulan');
                        setChartCategoryFilter('Hafalan Baru');
                        setIsHafalanChartModalOpen(true);
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-600 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ziyadah Bulan Ini</span>
                      </div>
                      <p className="text-base font-bold text-[#0F172A] mt-1 font-headline">
                        {hafalanStats.ziyadahMonthPages} <span className="text-xs font-semibold text-slate-500 font-body">Hal</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                        <span>{hafalanStats.ziyadahMonthCount}x Setoran</span>
                        <span className="text-slate-300">•</span>
                        <span className="underline group-hover:text-emerald-900 font-semibold">Grafik ↗</span>
                      </p>
                    </button>

                    {/* Card 3: Murojaah Pekan Ini */}
                    <button
                      type="button"
                      onClick={() => {
                        setChartTimeframe('pekan');
                        setChartCategoryFilter('Murojaah');
                        setIsHafalanChartModalOpen(true);
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-600 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Murojaah Pekan Ini</span>
                      </div>
                      <p className="text-base font-bold text-[#0F172A] mt-1 font-headline">
                        {hafalanStats.murojaahWeekPages} <span className="text-xs font-semibold text-slate-500 font-body">Hal</span>
                      </p>
                      <p className="text-[10px] text-blue-700 font-medium mt-0.5 flex items-center gap-1">
                        <span>{hafalanStats.murojaahWeekCount}x Setoran</span>
                        <span className="text-slate-300">•</span>
                        <span className="underline group-hover:text-blue-900 font-semibold">Grafik ↗</span>
                      </p>
                    </button>

                    {/* Card 4: Murojaah Bulan Ini */}
                    <button
                      type="button"
                      onClick={() => {
                        setChartTimeframe('bulan');
                        setChartCategoryFilter('Murojaah');
                        setIsHafalanChartModalOpen(true);
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-600 hover:shadow-xs transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Murojaah Bulan Ini</span>
                      </div>
                      <p className="text-base font-bold text-[#0F172A] mt-1 font-headline">
                        {hafalanStats.murojaahMonthPages} <span className="text-xs font-semibold text-slate-500 font-body">Hal</span>
                      </p>
                      <p className="text-[10px] text-blue-700 font-medium mt-0.5 flex items-center gap-1">
                        <span>{hafalanStats.murojaahMonthCount}x Setoran</span>
                        <span className="text-slate-300">•</span>
                        <span className="underline group-hover:text-blue-900 font-semibold">Grafik ↗</span>
                      </p>
                    </button>
                  </div>

                  {/* Section Riwayat Setoran */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">
                        RIWAYAT SETORAN & MUTABA'AH TAHFIZH
                      </h4>
                      <button
                        type="button"
                        onClick={handleOpenSetoranModal}
                        className="w-7 h-7 rounded-md bg-[#142A18] text-white hover:bg-[#2E5B37] transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                        title="Catat Setoran Baru"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {(currentStudent.hafalanHistory && currentStudent.hafalanHistory.length > 0) ? (
                      <div className="space-y-2.5">
                        {currentStudent.hafalanHistory.map((h) => (
                          <div key={h.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              {/* Baris 1: Nama Surah (Satu Row) */}
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate font-headline">
                                {h.surah}
                              </h5>

                              {/* Baris 2: Kapsul Jenis Setoran, Halaman, dan Kelancaran dalam 1 Row */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {h.category && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    h.category === 'Hafalan Baru' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {h.category}
                                  </span>
                                )}
                                {h.pageFrom && h.pageTo && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                    Hal. {h.pageFrom}-{h.pageTo} ({h.pageCount || (h.pageTo - h.pageFrom + 1)} Hal)
                                  </span>
                                )}
                                {(h.kelancaran || h.predikat) && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                                    {h.kelancaran || h.predikat}
                                  </span>
                                )}
                              </div>

                              {/* Baris 3: Cukup Juz N dan Langsung Nama Musyrif */}
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span>{h.juz?.toLowerCase().startsWith('juz') ? h.juz : `Juz ${h.juz || '1'}`}</span>
                                <span className="text-slate-300">|</span>
                                <strong className="text-slate-700 font-medium">{h.ustadz || 'Ustadz Pembimbing'}</strong>
                              </p>

                              {h.notes && (
                                <p className="text-[11px] text-slate-600 bg-[#F8FAFC] p-2 rounded-lg border border-slate-200/60 mt-1 italic">
                                  "{h.notes}"
                                </p>
                              )}
                            </div>

                            {/* Kanan Kontainer: Tanggal DD MMMM YY */}
                            <div className="text-right shrink-0">
                              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                                {formatDateDDMMMMYY(h.date, h.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-500 space-y-1.5">
                        <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="font-semibold text-slate-800">Belum Ada Riwayat Setoran</p>
                        <p className="text-[11px] text-slate-400">
                          Gunakan tombol <strong>+</strong> di atas untuk mencatat setoran harian santri.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PELANGGARAN */}
              {detailActiveTab === 'pelanggaran' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Unboxed Poin Pelanggaran & Plain Text Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Akumulasi Poin Pelanggaran
                      </p>
                      <p className="text-2xl font-bold text-red-600 mt-0.5 font-headline">
                        {currentStudent.poinPelanggaran} <span className="text-xs font-semibold text-slate-500 font-body">Pts</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status Disiplin</p>
                      <p className={`text-xs font-bold mt-0.5 ${
                        currentStudent.poinPelanggaran === 0
                          ? 'text-emerald-600'
                          : currentStudent.poinPelanggaran < 30
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}>
                        {currentStudent.poinPelanggaran === 0 ? 'Bersih / Taat' : currentStudent.poinPelanggaran < 30 ? 'Peringatan Ringan' : 'Pembinaan Khusus'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">
                      REKAM KASUS & TINDAKAN DISIPLIN
                    </h4>
                    {(currentStudent.violationHistory && currentStudent.violationHistory.length > 0) ? (
                      <div className="space-y-2">
                        {currentStudent.violationHistory.map((v) => (
                          <div key={v.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold text-xs text-slate-900">{v.title}</p>
                              <p className="text-[11px] text-slate-500">Sanksi: <span className="font-medium text-slate-700">{v.penalty}</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                +{v.points} Pts
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1">{formatDateDDMMMMYY(v.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-500 space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <p className="font-semibold text-slate-800">Catatan Pelanggaran Bersih</p>
                        <p className="text-[11px] text-slate-400">Santri ini belum memiliki catatan pelanggaran tata tertib.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: REKAM MAHKAMAH */}
              {detailActiveTab === 'mahkamah' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Top Bar: Frekuensi Rekapitulasi & Filter Rentang Waktu */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-headline">
                        Rekapitulasi Sidang Mahkamah
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#0F172A] font-medium font-body">
                        {Object.keys(mahkamahDivisionFrequency).length > 0 ? (
                          Object.entries(mahkamahDivisionFrequency).map(([divName, count], idx, arr) => (
                            <span key={divName} className="flex items-center gap-1.5">
                              <span>Mahkamah {divName}: <strong>{count} kali</strong></span>
                              {idx < arr.length - 1 && <span className="text-slate-300">·</span>}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">Belum ada riwayat sidang mahkamah</span>
                        )}
                      </div>
                    </div>

                    {/* Filter Rentang Waktu (1 Bulan, 3 Bulan, Semua Waktu) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 self-start sm:self-auto">
                      {[
                        { id: '1m', label: '1 Bulan Terakhir' },
                        { id: '3m', label: '3 Bulan' },
                        { id: 'all', label: 'Semua Waktu' },
                      ].map((f) => {
                        const isSelected = mahkamahTimeFilter === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setMahkamahTimeFilter(f.id as any)}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* List Riwayat Mahkamah (Clean Typography Rows) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">
                        DAFTAR CATATAN SIDANG ({filteredMahkamahHistory.length})
                      </h4>
                    </div>

                    {filteredMahkamahHistory.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {filteredMahkamahHistory.map((mhk) => (
                          <div
                            key={mhk.id}
                            className="py-4 first:pt-0 last:pb-0 space-y-2 hover:bg-slate-50/50 rounded-lg transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                              <p className="font-bold text-xs text-slate-900 font-headline tracking-tight">
                                {mhk.divisions && mhk.divisions.length > 0 ? mhk.divisions.join(' · ') : 'Sidang Mahkamah'}
                              </p>
                              <span className="text-xs text-slate-400 font-body shrink-0 font-medium">
                                {formatDateDDMMMMYY(mhk.date)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 font-medium block text-[11px]">Jenis Pelanggaran</span>
                                <span className="text-slate-800 font-medium leading-relaxed">{mhk.violation}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block text-[11px]">Vonis Takzir / Hukuman</span>
                                <span className="text-slate-800 font-semibold leading-relaxed">{mhk.penalty}</span>
                              </div>
                            </div>

                            {mhk.sessionNotes && (
                              <p className="text-[11px] text-slate-500 italic pt-1">
                                Catatan: {mhk.sessionNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <p className="font-semibold text-slate-800 text-xs font-headline">Tidak Ada Rekam Mahkamah</p>
                        <p className="text-[11px] text-slate-400 font-body">
                          {mahkamahTimeFilter !== 'all' 
                            ? 'Tidak ada sidang mahkamah pada rentang waktu yang dipilih.' 
                            : 'Santri ini belum pernah tercatat dalam sidang mahkamah kolektif.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PRESTASI */}
              {detailActiveTab === 'prestasi' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">
                      PENGHARGAAN & PRESTASI SANTRI
                    </h4>
                    {(currentStudent.achievementHistory && currentStudent.achievementHistory.length > 0) ? (
                      <div className="space-y-2">
                        {currentStudent.achievementHistory.map((a) => (
                          <div key={a.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-900">{a.title}</p>
                                <p className="text-[11px] text-slate-500">{a.category}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{a.date}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-500 space-y-1.5">
                        <Trophy className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-800">Belum Ada Rekam Prestasi</p>
                        <p className="text-[11px] text-slate-400">Prestasi akademik, tahfizh, atau kejuaraan akan dicatat di sini.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: RIWAYAT IZIN */}
              {detailActiveTab === 'izin' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">
                      SURAT & CATATAN PERIZINAN KELUAR/PULANG
                    </h4>
                    {(currentStudent.permissionsHistory && currentStudent.permissionsHistory.length > 0) ? (
                      <div className="space-y-2">
                        {currentStudent.permissionsHistory.map((iz) => (
                          <div key={iz.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{iz.type}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                                  iz.status === 'Aktif' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {iz.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">Alasan: "{iz.reason}"</p>
                              <p className="text-[10px] text-slate-400">Rentang: {iz.startDate} s.d. {iz.endDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-500 space-y-1.5">
                        <CalendarDays className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-800">Belum Ada Riwayat Perizinan</p>
                        <p className="text-[11px] text-slate-400">Santri tidak sedang dalam masa perizinan keluar pondok.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Footer Aksi Cepat (Pindah Kamar / Kelas / Rekam Izin) */}
            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIzinType('Pulang');
                    setIzinReason('');
                    setIzinStartDate(new Date().toISOString().split('T')[0]);
                    setIzinEndDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
                    setIsIzinModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                  Rekam Izin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetKamar(currentStudent.kamar || availableKamarOptions[0] || (liveRooms[0]?.roomName ?? 'Qatar 1'));
                    setIsMoveKamarModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <BedDouble className="w-3.5 h-3.5 text-[#059669]" />
                  Pindah Kamar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetKelas(currentStudent.kelas || availableKelasOptions[0] || (liveClasses[0]?.className ?? 'Kelas 1'));
                    setIsMoveKelasModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  Pindah Kelas
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#142A18] text-white rounded-full text-xs font-semibold hover:bg-[#2E5B37] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. NESTED MODAL: REKAM IZIN SANTRI */}
      {isIzinModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#142A18] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold font-headline tracking-tight text-white">
                Rekam Izin: {currentStudent.studentName}
              </h3>
              <button
                type="button"
                onClick={() => setIsIzinModalOpen(false)}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Form Izin"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-6">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Tipe Izin</label>
                <select
                  value={izinType}
                  onChange={(e) => setIzinType(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#142A18] focus:outline-none"
                >
                  <option value="Pulang (Sakit)">Pulang (Sakit)</option>
                  <option value="Pulang (Keluarga/Acara)">Pulang (Keluarga/Acara)</option>
                  <option value="Keluar Kampus (Medis)">Keluar Kampus (Medis)</option>
                  <option value="Keluar Kampus (Lomba/Tugas)">Keluar Kampus (Lomba/Tugas)</option>
                  <option value="Izin Khusus">Izin Khusus</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={izinStartDate}
                    onChange={(e) => setIzinStartDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:border-[#142A18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={izinEndDate}
                    onChange={(e) => setIzinEndDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:border-[#142A18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Alasan / Keterangan Izin</label>
                <textarea
                  rows={3}
                  value={izinReason}
                  onChange={(e) => setIzinReason(e.target.value)}
                  placeholder="Contoh: Berobat ke RS dan istirahat dokter selama 3 hari..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs focus:border-[#142A18] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsIzinModalOpen(false)}
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={handleSaveIzin}
                className="px-5 py-2 bg-[#142A18] text-white rounded-full text-xs font-semibold hover:bg-[#2E5B37] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Simpan Surat Izin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NESTED MODAL: PINDAH KAMAR ASRAMA */}
      {isMoveKamarModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#142A18] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold font-headline tracking-tight text-white">
                Pindah Kamar Asrama
              </h3>
              <button
                type="button"
                onClick={() => setIsMoveKamarModalOpen(false)}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Modal Pindah Kamar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-6">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                <p className="text-slate-500">Santri: <strong className="text-slate-900">{currentStudent.studentName}</strong></p>
                <p className="text-slate-500 mt-1">Kamar Saat Ini: <strong className="text-emerald-700">{currentStudent.kamar}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Pilih Kamar Tujuan</label>
                <select
                  value={targetKamar}
                  onChange={(e) => setTargetKamar(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#142A18] focus:outline-none"
                >
                  {liveRooms.map((r) => (
                    <option key={r.id || r.roomName} value={r.roomName}>
                      {r.dormitoryName} — Kamar {r.roomName} (Kapasitas: {r.occupiedCount ?? 0}/{r.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsMoveKamarModalOpen(false)}
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={handleSaveMoveKamar}
                className="px-5 py-2 bg-[#142A18] text-white rounded-full text-xs font-semibold hover:bg-[#2E5B37] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Konfirmasi Pindah Kamar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NESTED MODAL: PINDAH KELAS */}
      {isMoveKelasModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#142A18] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold font-headline tracking-tight text-white">
                Pindah Kelas / Tingkat
              </h3>
              <button
                type="button"
                onClick={() => setIsMoveKelasModalOpen(false)}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Modal Pindah Kelas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                <p className="text-slate-500">Santri: <strong className="text-slate-900">{currentStudent.studentName}</strong></p>
                <p className="text-slate-500 mt-1">Kelas Saat Ini: <strong className="text-indigo-700">{currentStudent.kelas}</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Pilih Kelas Baru</label>
                <select
                  value={targetKelas}
                  onChange={(e) => setTargetKelas(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#142A18] focus:outline-none"
                >
                  {liveClasses.map((c) => (
                    <option key={c.id || c.className} value={c.className}>
                      {c.className} {c.level ? `(${c.level})` : ''} {c.major && c.major !== 'Reguler' ? `— Jurusan ${c.major}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsMoveKelasModalOpen(false)}
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={handleSaveMoveKelas}
                className="px-5 py-2 bg-[#142A18] text-white rounded-full text-xs font-semibold hover:bg-[#2E5B37] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Konfirmasi Pindah Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. NESTED MODAL: CATAT SETORAN SANTRI (114 SURAHS & DYNAMIC PAGES) */}
      {isSetoranModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto animate-in fade-in zoom-in-95">
            
            <div className="bg-[#142A18] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold font-headline tracking-tight text-white flex items-center gap-2">
                  Catat Setoran Mutaba'ah Tahfizh
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Santri: {currentStudent.studentName} | {currentStudent.kamar} | {currentStudent.kelas}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSetoranModalOpen(false)}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Form Setoran"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-6 space-y-5 text-xs"
              topOffset="top-3"
              bottomOffset="bottom-3"
            >
              {/* 1. Kategori Setoran */}
              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A] font-headline">
                  Kategori Mutaba'ah
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={currentStudent.hafalan?.includes('30') || parseInt(currentStudent.hafalan || '0', 10) >= 30}
                    onClick={() => setSetoranCategory('Hafalan Baru')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      setoranCategory === 'Hafalan Baru'
                        ? 'bg-emerald-50/70 border-[#142A18] ring-1 ring-[#142A18]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    } ${(currentStudent.hafalan?.includes('30') || parseInt(currentStudent.hafalan || '0', 10) >= 30) ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0F172A]">Hafalan Baru (Ziyadah)</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        setoranCategory === 'Hafalan Baru' ? 'border-[#142A18] bg-[#142A18]' : 'border-slate-300'
                      }`}>
                        {setoranCategory === 'Hafalan Baru' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Menambah ayat atau surat baru dalam kurikulum.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSetoranCategory('Murojaah')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      setoranCategory === 'Murojaah'
                        ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0F172A]">Murojaah (Pengulangan)</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        setoranCategory === 'Murojaah' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {setoranCategory === 'Murojaah' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Mengulang hafalan yang telah disetorkan sebelumnya.</p>
                  </button>
                </div>
              </div>

              {/* 2. Searchable Combobox 114 Surah */}
              <div className="space-y-1.5 relative" ref={surahComboRef}>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#0F172A] font-headline">
                    Surah Al-Qur'an (114 Surah)
                  </label>
                  {selectedSurah && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Juz {selectedSurah.juz} • {selectedSurah.totalAyat} Ayat • {selectedSurah.arabicName}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div
                    onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-900 cursor-pointer hover:border-slate-300 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {selectedSurah ? selectedSurah.number : '-'}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {selectedSurah ? selectedSurah.name : 'Pilih Surah...'}
                      </span>
                      {selectedSurah && (
                        <span className="text-slate-400 text-[11px]">({selectedSurah.englishName})</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  {isSurahDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="p-2 border-b border-slate-100 bg-[#F8FAFC]">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            value={surahQuery}
                            onChange={(e) => setSurahQuery(e.target.value)}
                            placeholder="Cari nama atau nomor surah..."
                            className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#142A18]"
                          />
                        </div>
                      </div>

                      <ScrollArea className="max-h-56" viewportClassName="p-1 space-y-0.5 text-xs">
                        {filteredSurahs.map((surah) => {
                          const isSelected = selectedSurah?.number === surah.number;
                          return (
                            <button
                              key={surah.number}
                              type="button"
                              onClick={() => handleSelectSurah(surah)}
                              className={`w-full p-2 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                                isSelected ? 'bg-[#142A18] text-white' : 'hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {surah.number}
                                </span>
                                <div className="truncate">
                                  <p className="font-semibold text-xs truncate">{surah.name}</p>
                                  <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {surah.englishName} • {surah.totalAyat} Ayat
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 pl-2">
                                <span className={`font-arabic text-sm block ${isSelected ? 'text-emerald-300' : 'text-slate-600'}`}>
                                  {surah.arabicName}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Range Ayat Dinamis & Auto-Fill Halaman Standar Kemenag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/80">
                <div className="space-y-2">
                  <label className="block font-semibold text-[#0F172A] font-headline">
                    Rentang Ayat (Maks: {selectedSurah?.totalAyat || 1})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Dari Ayat</span>
                      <input
                        type="number"
                        min={1}
                        max={selectedSurah?.totalAyat || 286}
                        value={setoranAyatFrom}
                        onChange={(e) => handleAyatFromChange(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#142A18]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Sampai Ayat</span>
                      <input
                        type="number"
                        min={parseInt(String(setoranAyatFrom), 10) || 1}
                        max={selectedSurah?.totalAyat || 286}
                        value={setoranAyatTo}
                        onChange={(e) => handleAyatToChange(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#142A18]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-[#0F172A] font-headline">
                      Nomor Halaman (Mushaf Standar)
                    </label>
                    {setoranPageFrom && setoranPageTo && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                        Total: {Math.max(1, (parseInt(String(setoranPageTo), 10) || 1) - (parseInt(String(setoranPageFrom), 10) || 1) + 1)} Halaman
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Dari Halaman</span>
                      <input
                        type="number"
                        min={1}
                        max={604}
                        value={setoranPageFrom}
                        onChange={(e) => setSetoranPageFrom(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#142A18]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Sampai Halaman</span>
                      <input
                        type="number"
                        min={1}
                        max={604}
                        value={setoranPageTo}
                        onChange={(e) => setSetoranPageTo(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#142A18]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Slider Kelancaran */}
              <div className="space-y-2 p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#0F172A] font-headline">
                    Tingkat Kelancaran & Mutaba'ah
                  </label>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    setoranKelancaranIndex === 0
                      ? 'bg-rose-100 text-rose-700'
                      : setoranKelancaranIndex === 1
                      ? 'bg-amber-100 text-amber-700'
                      : setoranKelancaranIndex === 2
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-800 text-white'
                  }`}>
                    {['Perlu diulang', 'Lumayan', 'Lancar', 'Sangat Lancar (Mumtaz)'][setoranKelancaranIndex]}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={setoranKelancaranIndex}
                  onChange={(e) => setSetoranKelancaranIndex(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#142A18]"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
                  <span className={setoranKelancaranIndex === 0 ? 'font-bold text-rose-600' : ''}>Perlu diulang</span>
                  <span className={setoranKelancaranIndex === 1 ? 'font-bold text-amber-600' : ''}>Lumayan</span>
                  <span className={setoranKelancaranIndex === 2 ? 'font-bold text-emerald-600' : ''}>Lancar</span>
                  <span className={setoranKelancaranIndex === 3 ? 'font-bold text-[#142A18]' : ''}>Sangat Lancar</span>
                </div>
              </div>

              {/* 5. Ustadz & Catatan */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
                    Ustadz Penguji / Pembimbing
                  </label>
                  <input
                    type="text"
                    value={setoranUstadz}
                    onChange={(e) => setSetoranUstadz(e.target.value)}
                    placeholder="Nama Ustadz Pembimbing"
                    className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#142A18]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
                    Catatan Mutaba'ah (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={setoranNotes}
                    onChange={(e) => setSetoranNotes(e.target.value)}
                    placeholder="Catatan makharijul huruf, tajwid, atau waqaf-ibtidai..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#142A18] resize-none"
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsSetoranModalOpen(false)}
              >
                Batal
              </Button>
              <button
                type="button"
                onClick={handleSaveSetoran}
                className="px-5 py-2 bg-[#142A18] text-white rounded-full text-xs font-semibold hover:bg-[#2E5B37] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Simpan Setoran
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. NESTED MODAL: STATISTIK & TREN GRAFIK HAFALAN (SMOOTH MONOTONE SPLINE) */}
      {isHafalanChartModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto animate-in fade-in zoom-in-95">
            
            <div className="bg-[#142A18] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold font-headline tracking-tight text-white flex items-center gap-2">
                  Statistik & Tren Perkembangan Hafalan
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  {currentStudent.studentName} | {currentStudent.kamar} | Capaian: {currentStudent.hafalan}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHafalanChartModalOpen(false)}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Grafik"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-6 space-y-5 text-xs"
              topOffset="top-3"
              bottomOffset="bottom-3"
            >
              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                  {(['pekan', 'bulan', 'tahun'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        chartTimeframe === tf
                          ? 'bg-[#142A18] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tf === 'pekan' ? 'Pekan Ini' : tf === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Kategori:</span>
                  {(['all', 'Hafalan Baru', 'Murojaah'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setChartCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        chartCategoryFilter === cat
                          ? cat === 'Hafalan Baru'
                            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                            : cat === 'Murojaah'
                            ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                            : 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'all' ? 'Semua' : cat === 'Hafalan Baru' ? 'Ziyadah' : 'Murojaah'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Summary Insight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Ziyadah</span>
                  <p className="text-base font-bold text-emerald-700 mt-0.5 font-headline">
                    {hafalanChartData.totalZiyadah} <span className="text-xs font-normal text-slate-500 font-body">Hal</span>
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Murojaah</span>
                  <p className="text-base font-bold text-blue-700 mt-0.5 font-headline">
                    {hafalanChartData.totalMurojaah} <span className="text-xs font-normal text-slate-500 font-body">Hal</span>
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Rata-rata / Sesi</span>
                  <p className="text-base font-bold text-[#0F172A] mt-0.5 font-headline">
                    {hafalanChartData.avgPerSession > 0 ? (
                      <>{hafalanChartData.avgPerSession} <span className="text-xs font-normal text-slate-500 font-body">Hal</span></>
                    ) : (
                      <span className="text-xs font-normal text-slate-400 font-body">0 Hal</span>
                    )}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Status Periode</span>
                  <p className={`text-base font-bold mt-0.5 font-headline ${hafalanChartData.hasData ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {hafalanChartData.hasData ? 'Aktif' : 'Nihil'}
                  </p>
                </div>
              </div>

              {/* Visual Line Chart (Dynamic Smooth Monotone Spline & Interactive Graph) */}
              <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] font-headline uppercase tracking-wider flex items-center gap-2">
                      <span>Kurva Perkembangan Halaman</span>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full lowercase">
                        {chartTimeframe === 'pekan' ? 'harian' : chartTimeframe === 'bulan' ? 'mingguan' : 'bulanan'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {hafalanChartData.hasData
                        ? 'Akumulasi real-time halaman mutaba\'ah dengan kurva melengkung halus'
                        : 'Belum ada setoran pada rentang waktu ini'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[11px] font-medium">
                    {(chartCategoryFilter === 'all' || chartCategoryFilter === 'Hafalan Baru') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-2xs" />
                        <span className="text-slate-700 font-semibold">Ziyadah (Baru)</span>
                      </div>
                    )}
                    {(chartCategoryFilter === 'all' || chartCategoryFilter === 'Murojaah') && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs" />
                        <span className="text-slate-700 font-semibold">Murojaah</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full overflow-x-auto relative">
                  <div className="min-w-[500px] relative">
                    {hoveredChartPointIndex !== null && (
                      <div className="absolute top-2 right-3 z-20 bg-[#0F172A] text-white px-3.5 py-1.5 rounded-lg shadow-lg text-[11px] flex items-center gap-3 animate-in fade-in zoom-in-95 border border-slate-700 pointer-events-none">
                        <span className="font-bold text-slate-200 border-r border-slate-700 pr-2">
                          {hafalanChartData.labels[hoveredChartPointIndex]}
                        </span>
                        {(chartCategoryFilter === 'all' || chartCategoryFilter === 'Hafalan Baru') && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ziyadah: {hafalanChartData.ziyadah[hoveredChartPointIndex]} Hal
                          </span>
                        )}
                        {(chartCategoryFilter === 'all' || chartCategoryFilter === 'Murojaah') && (
                          <span className="flex items-center gap-1 font-semibold text-blue-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            Murojaah: {hafalanChartData.murojaah[hoveredChartPointIndex]} Hal
                          </span>
                        )}
                        <span className="text-slate-400 font-medium text-[10px]">
                          (Total: {Math.round((hafalanChartData.ziyadah[hoveredChartPointIndex] + hafalanChartData.murojaah[hoveredChartPointIndex]) * 10) / 10} Hal)
                        </span>
                      </div>
                    )}

                    {(() => {
                      const N = hafalanChartData.labels.length;
                      const padLeft = 45;
                      const plotWidth = 525;
                      const baseY = 165;
                      const plotHeight = 135;
                      const maxY = hafalanChartData.maxY;
                      const colWidth = plotWidth / Math.max(1, N - 1);

                      const ziyadahPoints = hafalanChartData.ziyadah.map((v, i) => ({
                        x: padLeft + (i * plotWidth) / Math.max(1, N - 1),
                        y: baseY - (v / maxY) * plotHeight,
                        v,
                        label: hafalanChartData.labels[i]
                      }));

                      const murojaahPoints = hafalanChartData.murojaah.map((v, i) => ({
                        x: padLeft + (i * plotWidth) / Math.max(1, N - 1),
                        y: baseY - (v / maxY) * plotHeight,
                        v,
                        label: hafalanChartData.labels[i]
                      }));

                      const ziyadahSmoothPath = getSmoothSvgPath(ziyadahPoints, baseY);
                      const ziyadahAreaPath = `${ziyadahSmoothPath} L ${ziyadahPoints[N - 1].x.toFixed(2)} ${baseY} L ${ziyadahPoints[0].x.toFixed(2)} ${baseY} Z`;

                      const murojaahSmoothPath = getSmoothSvgPath(murojaahPoints, baseY);
                      const murojaahAreaPath = `${murojaahSmoothPath} L ${murojaahPoints[N - 1].x.toFixed(2)} ${baseY} L ${murojaahPoints[0].x.toFixed(2)} ${baseY} Z`;

                      return (
                        <svg
                          viewBox="0 0 600 200"
                          className="w-full h-48 select-none"
                          onMouseLeave={() => setHoveredChartPointIndex(null)}
                        >
                          <defs>
                            <linearGradient id="ziyadahSmoothGradModal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#059669" stopOpacity="0.28" />
                              <stop offset="60%" stopColor="#059669" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="murojaahSmoothGradModal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.24" />
                              <stop offset="60%" stopColor="#2563EB" stopOpacity="0.06" />
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                            </linearGradient>

                            <filter id="glowZiyadahModal" x="-10%" y="-10%" width="120%" height="120%">
                              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#059669" floodOpacity="0.25" />
                            </filter>
                            <filter id="glowMurojaahModal" x="-10%" y="-10%" width="120%" height="120%">
                              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#2563EB" floodOpacity="0.25" />
                            </filter>
                          </defs>

                          {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                            const y = baseY - ratio * plotHeight;
                            const labelVal = Math.round(ratio * maxY * 10) / 10;
                            return (
                              <g key={ratio}>
                                <line x1={padLeft} y1={y} x2={padLeft + plotWidth} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                                <text x={padLeft - 10} y={y + 3} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">
                                  {labelVal}
                                </text>
                              </g>
                            );
                          })}

                          <line x1={padLeft} y1={baseY} x2={padLeft + plotWidth} y2={baseY} stroke="#E2E8F0" strokeWidth="1.5" />
                          <text x={padLeft - 10} y={baseY + 3} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">
                            0
                          </text>

                          {hoveredChartPointIndex !== null && (
                            <line
                              x1={ziyadahPoints[hoveredChartPointIndex].x}
                              y1={20}
                              x2={ziyadahPoints[hoveredChartPointIndex].x}
                              y2={baseY}
                              stroke="#94A3B8"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              opacity="0.75"
                            />
                          )}

                          {(chartCategoryFilter === 'all' || chartCategoryFilter === 'Hafalan Baru') && (
                            <>
                              {hafalanChartData.totalZiyadah > 0 && (
                                <path d={ziyadahAreaPath} fill="url(#ziyadahSmoothGradModal)" />
                              )}
                              <path
                                d={ziyadahSmoothPath}
                                fill="none"
                                stroke="#059669"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glowZiyadahModal)"
                              />
                              {ziyadahPoints.map((pt, i) => {
                                const isHovered = hoveredChartPointIndex === i;
                                return (
                                  <g key={`zd_${i}`}>
                                    {isHovered && (
                                      <circle cx={pt.x} cy={pt.y} r="8" fill="#059669" opacity="0.25" className="animate-ping" />
                                    )}
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r={isHovered ? 6 : pt.v > 0 ? 4.5 : 2.5}
                                      fill={isHovered ? '#059669' : pt.v > 0 ? '#059669' : '#CBD5E1'}
                                      stroke="#FFFFFF"
                                      strokeWidth={isHovered ? 2.5 : 2}
                                      className="transition-all duration-150"
                                    />
                                    {isHovered && (
                                      <circle cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" />
                                    )}
                                    {pt.v > 0 && !isHovered && (
                                      <text
                                        x={pt.x}
                                        y={pt.y - 7}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill="#059669"
                                        fontWeight="bold"
                                      >
                                        {pt.v}
                                      </text>
                                    )}
                                  </g>
                                );
                              })}
                            </>
                          )}

                          {(chartCategoryFilter === 'all' || chartCategoryFilter === 'Murojaah') && (
                            <>
                              {hafalanChartData.totalMurojaah > 0 && (
                                <path d={murojaahAreaPath} fill="url(#murojaahSmoothGradModal)" />
                              )}
                              <path
                                d={murojaahSmoothPath}
                                fill="none"
                                stroke="#2563EB"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glowMurojaahModal)"
                              />
                              {murojaahPoints.map((pt, i) => {
                                const isHovered = hoveredChartPointIndex === i;
                                return (
                                  <g key={`md_${i}`}>
                                    {isHovered && (
                                      <circle cx={pt.x} cy={pt.y} r="8" fill="#2563EB" opacity="0.25" className="animate-ping" />
                                    )}
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r={isHovered ? 6 : pt.v > 0 ? 4.5 : 2.5}
                                      fill={isHovered ? '#2563EB' : pt.v > 0 ? '#2563EB' : '#CBD5E1'}
                                      stroke="#FFFFFF"
                                      strokeWidth={isHovered ? 2.5 : 2}
                                      className="transition-all duration-150"
                                    />
                                    {isHovered && (
                                      <circle cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" />
                                    )}
                                    {pt.v > 0 && !isHovered && (
                                      <text
                                        x={pt.x}
                                        y={pt.y - 7}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill="#2563EB"
                                        fontWeight="bold"
                                      >
                                        {pt.v}
                                      </text>
                                    )}
                                  </g>
                                );
                              })}
                            </>
                          )}

                          {hafalanChartData.labels.map((lbl, idx) => {
                            const xCenter = padLeft + (idx * plotWidth) / Math.max(1, N - 1);
                            const halfWidth = colWidth / 2;
                            return (
                              <rect
                                key={`hitbox_${lbl}_${idx}`}
                                x={Math.max(padLeft, xCenter - halfWidth)}
                                y={15}
                                width={colWidth}
                                height={baseY - 10}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredChartPointIndex(idx)}
                              />
                            );
                          })}

                          {hafalanChartData.labels.map((lbl, idx) => {
                            const x = padLeft + (idx * plotWidth) / Math.max(1, N - 1);
                            const isHovered = hoveredChartPointIndex === idx;
                            return (
                              <text
                                key={lbl}
                                x={x}
                                y={baseY + 16}
                                textAnchor="middle"
                                fontSize={N > 7 ? '9' : '10'}
                                fill={isHovered ? '#0F172A' : '#64748B'}
                                fontWeight={isHovered ? 'bold' : '600'}
                                className="transition-colors duration-150"
                              >
                                {lbl}
                              </text>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    {!hafalanChartData.hasData && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-2xs rounded-lg p-4 text-center pointer-events-none">
                        <BookOpen className="w-7 h-7 text-slate-400 mb-1" />
                        <p className="font-bold text-xs text-slate-700">Belum Ada Setoran Pada Periode Ini</p>
                        <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                          Nilai grafik saat ini 0. Tambahkan catatan setoran baru untuk melihat grafik perkembangan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Setoran Activity Insights */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/80 space-y-2">
                <h5 className="font-bold text-xs text-[#0F172A] font-headline uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Rangkuman & Evaluasi Mutaba'ah Periode
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {hafalanChartData.hasData ? (
                    <>
                      Santri telah menyetorkan total <strong>{hafalanChartData.totalZiyadah + hafalanChartData.totalMurojaah} Halaman</strong> ({hafalanChartData.totalZiyadah} Hal Ziyadah & {hafalanChartData.totalMurojaah} Hal Murojaah) pada periode ini dengan rata-rata <strong>{hafalanChartData.avgPerSession} Hal</strong> per sesi aktif.
                    </>
                  ) : (
                    <>
                      Belum ada riwayat setoran tahfizh yang tercatat pada rentang waktu ini. Silakan catat mutaba'ah harian untuk memantau ritme hafalan santri.
                    </>
                  )}
                </p>
              </div>
            </ScrollArea>

            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsHafalanChartModalOpen(false)}
              >
                Kembali ke Detail Santri
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
