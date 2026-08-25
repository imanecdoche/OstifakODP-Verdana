import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserPlus, 
  Pencil, 
  Trash2, 
  X, 
  Plus, 
  AlertCircle, 
  Loader2, 
  ShieldAlert, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Home, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Eye, 
  Trophy, 
  CalendarDays, 
  Phone, 
  User, 
  Check,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Activity,
  LineChart
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';
import { StudentDetailModal } from '../modals/StudentDetailModal';
import { QURAN_SURAHS, calculateQuranPages, QuranSurah } from '../../data/quranSurahs';
import { 
  subscribeToSantri, 
  addSantriRecord, 
  updateSantriRecord,
  deleteSantriRecord,
  SantriRecord, 
  StudentViolationEntry,
  StudentPermissionEntry,
  StudentHafalanEntry,
  StudentAchievementEntry,
  Dormitory,
  DormitoryRoom, 
  OFFICIAL_DORMITORIES,
  ALL_OFFICIAL_ROOMS,
  SchoolClass,
  OFFICIAL_CLASSES
} from '../../lib/firestoreService';
import { useLenisModalLock } from '../../lib/lenis';
import { gooeyToast } from 'goey-toast';

interface StudentsViewProps {
  dormitories?: Dormitory[];
  rooms?: DormitoryRoom[];
  classes?: SchoolClass[];
  students?: SantriRecord[];
}

type SortOption = 
  | 'name_asc' 
  | 'name_desc' 
  | 'class_asc' 
  | 'hafalan_desc' 
  | 'hafalan_asc' 
  | 'points_desc' 
  | 'points_asc';

export const StudentsView: React.FC<StudentsViewProps> = ({ 
  dormitories = OFFICIAL_DORMITORIES,
  rooms = ALL_OFFICIAL_ROOMS,
  classes = OFFICIAL_CLASSES,
  students: propStudents
}) => {
  const [students, setStudents] = useState<SantriRecord[]>(propStudents || []);

  useEffect(() => {
    if (propStudents) {
      setStudents(propStudents);
    }
  }, [propStudents]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState<SantriRecord | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<SantriRecord | null>(null);
  
  // Modal Edit Tab State: 'general' | 'discipline'
  const [editActiveTab, setEditActiveTab] = useState<'general' | 'discipline'>('general');

  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  
  // Filtering State
  const [filterClass, setFilterClass] = useState<string>('all');
  const [minHafalan, setMinHafalan] = useState<string>('');
  const [maxHafalan, setMaxHafalan] = useState<string>('');
  const [minPoints, setMinPoints] = useState<string>('');
  const [maxPoints, setMaxPoints] = useState<string>('');

  // Form states for Add Modal
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [domicile, setDomicile] = useState('');
  const [kamar, setKamar] = useState(rooms[0]?.roomName || 'Qatar 1');
  const [kelas, setKelas] = useState('Kelas 1');
  const [hafalanCount, setHafalanCount] = useState<number | string>(0);
  const [isTahsinPassed, setIsTahsinPassed] = useState(true);
  const [addActiveTab, setAddActiveTab] = useState<'general' | 'discipline'>('general');
  const [addPoin, setAddPoin] = useState<number>(0);
  const [addViolationsHistory, setAddViolationsHistory] = useState<StudentViolationEntry[]>([]);
  const [newAddVioTitle, setNewAddVioTitle] = useState('');
  const [newAddVioPoints, setNewAddVioPoints] = useState<number>(5);
  const [newAddVioPenalty, setNewAddVioPenalty] = useState('');
  const [newAddVioDate, setNewAddVioDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editDomicile, setEditDomicile] = useState('');
  const [editKamar, setEditKamar] = useState('');
  const [editKelas, setEditKelas] = useState('');
  const [editHafalanCount, setEditHafalanCount] = useState<number | string>(0);
  const [editIsTahsinPassed, setEditIsTahsinPassed] = useState(true);
  
  // Edit Discipline states
  const [editPoin, setEditPoin] = useState<number>(0);
  const [editViolationsHistory, setEditViolationsHistory] = useState<StudentViolationEntry[]>([]);
  
  // Add Violation inside Edit Modal State
  const [newVioTitle, setNewVioTitle] = useState('');
  const [newVioPoints, setNewVioPoints] = useState<number>(5);
  const [newVioPenalty, setNewVioPenalty] = useState('');
  const [newVioDate, setNewVioDate] = useState(new Date().toISOString().split('T')[0]);

  // Detail Modal & Nested Actions State
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<SantriRecord | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'bio' | 'hafalan' | 'pelanggaran' | 'prestasi' | 'izin'>('bio');
  
  // Nested Modal States
  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [isMoveKamarModalOpen, setIsMoveKamarModalOpen] = useState(false);
  const [isMoveKelasModalOpen, setIsMoveKelasModalOpen] = useState(false);
  const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
  const [isHafalanChartModalOpen, setIsHafalanChartModalOpen] = useState(false);

  // Hafalan Chart Controls State
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

  // Catat Setoran Form State (114 Surahs & Dynamic Ayat Range)
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
  const [setoranKelancaranIndex, setSetoranKelancaranIndex] = useState<number>(2); // Default: 2 (Lancar)
  const [setoranNotes, setSetoranNotes] = useState('');
  const [setoranUstadz, setSetoranUstadz] = useState('Ustadz Pembimbing');

  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close surah combobox on outside click
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
    
    // Set default ayat range
    const fromA = 1;
    const toA = Math.min(20, surah.totalAyat);
    setSetoranAyatFrom(fromA);
    setSetoranAyatTo(toA);

    // Auto calculate pages according to Kemenag standard
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

    // 1. Calculate secants (slopes between consecutive points)
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

    // 2. Initialize tangents at each point (Fritsch-Carlson Monotonicity)
    const m: number[] = new Array(n).fill(0);
    m[0] = slopes[0];
    m[n - 1] = slopes[n - 2];

    for (let i = 1; i < n - 1; i++) {
      const sPrev = slopes[i - 1];
      const sNext = slopes[i];

      // If local extremum or adjacent to flat segment, tangent MUST be 0 (prevents undershoot below 0)
      if (sPrev * sNext <= 0 || sPrev === 0 || sNext === 0) {
        m[i] = 0;
      } else {
        // Harmonic mean of secants for smooth monotone transitions
        m[i] = (2 * sPrev * sNext) / (sPrev + sNext);
      }

      // If point is on the baseline (value = 0), tangent must be strictly 0
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

    // Guard endpoints if at baseline 0
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

    // 3. Build cubic Bézier SVG path segments
    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      // If both points are 0 (on baseline), draw a perfectly straight horizontal line
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

      // STRICT BASELINE ZERO-CLAMP: Control points must NEVER dip below baseY (value < 0)
      cp1y = Math.min(baseY, Math.max(15, cp1y));
      cp2y = Math.min(baseY, Math.max(15, cp2y));

      path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
    }

    return path;
  };

  // Helper to parse date from StudentHafalanEntry
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

  // Compact Stats Memo for Hafalan Tab (Real-Time Aggregation from History)
  const hafalanStats = useMemo(() => {
    const history = selectedDetailStudent?.hafalanHistory || [];
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

    // Monday - Sunday of current week
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
  }, [selectedDetailStudent?.hafalanHistory]);

  // Real-Time Chart Data Aggregation (Single Source of Truth)
  const hafalanChartData = useMemo(() => {
    const history = selectedDetailStudent?.hafalanHistory || [];
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
  }, [selectedDetailStudent?.hafalanHistory, chartTimeframe]);

  useLenisModalLock(
    isAdding || 
    !!editingStudent || 
    !!studentToDelete || 
    !!selectedDetailStudent || 
    isIzinModalOpen || 
    isMoveKamarModalOpen || 
    isMoveKelasModalOpen ||
    isSetoranModalOpen ||
    isHafalanChartModalOpen
  );

  const handleOpenSetoranModal = () => {
    if (!selectedDetailStudent) return;
    const is30 = selectedDetailStudent.hafalan?.includes('30') || parseInt(selectedDetailStudent.hafalan || '0', 10) >= 30;
    if (is30) {
      setSetoranCategory('Murojaah');
    } else {
      setSetoranCategory('Hafalan Baru');
    }

    // Default surah: Al-Baqarah (index 1)
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
    setSetoranKelancaranIndex(2); // Lancar
    setSetoranNotes('');
    setSetoranUstadz('Ustadz Pembimbing');
    setIsSetoranModalOpen(true);
  };

  const handleSaveSetoran = async () => {
    if (!selectedDetailStudent) return;
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

    const updatedHafalanList = [newHafalanEntry, ...(selectedDetailStudent.hafalanHistory || [])];
    const updatedStudent: SantriRecord = {
      ...selectedDetailStudent,
      hafalanHistory: updatedHafalanList,
    };

    // 1. Instantly update local state
    setSelectedDetailStudent(updatedStudent);
    
    // 2. Instantly close sub-modal (zero delay)
    setIsSetoranModalOpen(false);

    // 3. Instantly trigger Toast notification
    gooeyToast.success(`Berhasil! Setoran ${setoranCategory.toLowerCase()} ${selectedDetailStudent.studentName} berhasil dicatat!`);

    // 4. Background persistence
    try {
      await updateSantriRecord(selectedDetailStudent.id, {
        hafalanHistory: updatedHafalanList,
      });
    } catch (err) {
      console.error('Failed to sync setoran to Firestore:', err);
    } finally {
      setIsSubmittingSetoran(false);
    }
  };

  const handleSaveIzin = async () => {
    if (!selectedDetailStudent) return;
    if (isSubmittingIzin) return;
    if (!izinReason.trim()) {
      gooeyToast.error('Harap masukkan alasan izin santri!');
      return;
    }
    setIsSubmittingIzin(true);

    const newEntry: StudentPermissionEntry = {
      id: `iz_${Date.now()}`,
      type: izinType,
      reason: izinReason.trim(),
      startDate: izinStartDate,
      endDate: izinEndDate,
      status: 'Aktif',
    };
    const updatedPermissions = [newEntry, ...(selectedDetailStudent.permissionsHistory || [])];
    const updatedStudent: SantriRecord = {
      ...selectedDetailStudent,
      permissionsHistory: updatedPermissions,
    };

    // 1. Instantly update local state
    setSelectedDetailStudent(updatedStudent);

    // 2. Instantly close sub-modal
    setIsIzinModalOpen(false);
    setIzinReason('');

    // 3. Instantly trigger Toast
    gooeyToast.success(`Izin ${izinType} untuk ${selectedDetailStudent.studentName} berhasil dicatat!`);

    // 4. Background sync
    try {
      await updateSantriRecord(selectedDetailStudent.id, {
        permissionsHistory: updatedPermissions,
      });
    } catch (err) {
      console.error('Failed to sync izin to Firestore:', err);
    } finally {
      setIsSubmittingIzin(false);
    }
  };

  const handleSaveMoveKamar = async () => {
    if (!selectedDetailStudent || !targetKamar) return;
    if (isSubmittingMoveKamar) return;
    setIsSubmittingMoveKamar(true);

    const updatedStudent: SantriRecord = {
      ...selectedDetailStudent,
      kamar: targetKamar,
    };

    // 1. Instantly update local state
    setSelectedDetailStudent(updatedStudent);

    // 2. Instantly close sub-modal
    setIsMoveKamarModalOpen(false);

    // 3. Instantly trigger Toast
    gooeyToast.success(`${selectedDetailStudent.studentName} berhasil dipindahkan ke Kamar ${targetKamar}!`);

    // 4. Background sync
    try {
      await updateSantriRecord(selectedDetailStudent.id, { kamar: targetKamar });
    } catch (err) {
      console.error('Failed to sync pindah kamar:', err);
    } finally {
      setIsSubmittingMoveKamar(false);
    }
  };

  const handleSaveMoveKelas = async () => {
    if (!selectedDetailStudent || !targetKelas) return;
    if (isSubmittingMoveKelas) return;
    setIsSubmittingMoveKelas(true);

    const updatedStudent: SantriRecord = {
      ...selectedDetailStudent,
      kelas: targetKelas,
    };

    // 1. Instantly update local state
    setSelectedDetailStudent(updatedStudent);

    // 2. Instantly close sub-modal
    setIsMoveKelasModalOpen(false);

    // 3. Instantly trigger Toast
    gooeyToast.success(`${selectedDetailStudent.studentName} berhasil dipindahkan ke ${targetKelas}!`);

    // 4. Background sync
    try {
      await updateSantriRecord(selectedDetailStudent.id, { kelas: targetKelas });
    } catch (err) {
      console.error('Failed to sync pindah kelas:', err);
    } finally {
      setIsSubmittingMoveKelas(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeToSantri((list) => {
      setStudents(list);
    });
    return () => unsub();
  }, []);

  const handleAddSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const hafalanFormatted = `${Number(hafalanCount) || 0} Juz`;
      await addSantriRecord({
        studentName: name.trim(),
        nis: nis.trim() || '-',
        kamar,
        kelas,
        hafalan: hafalanFormatted,
        poinPelanggaran: Number(addPoin) || 0,
        statusIbadah: '100% Berjamaah',
        birthDate: birthDate.trim(),
        domicile: domicile.trim(),
        isTahsinPassed,
        violationsHistory: addViolationsHistory,
      });
      setName('');
      setNis('');
      setBirthDate('');
      setDomicile('');
      setKamar(rooms[0]?.roomName || 'Qatar 1');
      setKelas('Kelas 1');
      setHafalanCount(0);
      setIsTahsinPassed(true);
      setAddPoin(0);
      setAddViolationsHistory([]);
      setNewAddVioTitle('');
      setNewAddVioPenalty('');
      setAddActiveTab('general');
      setIsAdding(false);
      gooeyToast.success('Santri Baru Berhasil Ditambahkan', {
        description: `${name} (${kamar} - ${kelas}, ${hafalanFormatted})`,
      });
    } catch (err) {
      console.error('Gagal menambah santri:', err);
      gooeyToast.error('Gagal Menambah Santri', {
        description: 'Terjadi kendala saat menyimpan data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddViolation = () => {
    if (!newAddVioTitle.trim()) return;
    const entry: StudentViolationEntry = {
      id: `vio-${Date.now()}`,
      title: newAddVioTitle.trim(),
      date: newAddVioDate,
      points: Number(newAddVioPoints) || 0,
      penalty: newAddVioPenalty.trim() || 'Peringatan & Pembinaan',
    };
    setAddViolationsHistory((prev) => [entry, ...prev]);
    setAddPoin((prev) => prev + entry.points);
    setNewAddVioTitle('');
    setNewAddVioPenalty('');
  };

  const handleRemoveNewAddViolation = (id: string) => {
    const target = addViolationsHistory.find((v) => v.id === id);
    setAddViolationsHistory((prev) => prev.filter((v) => v.id !== id));
    if (target) {
      setAddPoin((prev) => Math.max(0, prev - target.points));
    }
  };

  const handleOpenEdit = (st: SantriRecord) => {
    setEditingStudent(st);
    setEditActiveTab('general');
    setEditName(st.studentName);
    setEditNis(st.nis || '');
    setEditBirthDate(st.birthDate || '');
    setEditDomicile(st.domicile || '');
    setEditKamar(st.kamar);
    setEditKelas(st.kelas);
    setEditHafalanCount(parseHafalan(st.hafalan));
    setEditIsTahsinPassed(st.isTahsinPassed ?? true);
    setEditPoin(st.poinPelanggaran || 0);
    setEditViolationsHistory(st.violationsHistory || []);
    
    // Reset new violation form
    setNewVioTitle('');
    setNewVioPoints(5);
    setNewVioPenalty('');
    setNewVioDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddNewViolationToHistory = () => {
    if (!newVioTitle.trim()) return;
    const newEntry: StudentViolationEntry = {
      id: `vio-${Date.now()}`,
      title: newVioTitle.trim(),
      date: newVioDate,
      points: Number(newVioPoints) || 0,
      penalty: newVioPenalty.trim() || 'Peringatan & Pembinaan',
    };
    const updated = [newEntry, ...editViolationsHistory];
    setEditViolationsHistory(updated);
    // Automatically recalculate points total
    setEditPoin((prev) => prev + Number(newVioPoints));
    setNewVioTitle('');
    setNewVioPenalty('');
    gooeyToast.info('Kasus Pelanggaran Ditambahkan', {
      description: `${newEntry.title} (+${newEntry.points} Pts)`,
    });
  };

  const handleRemoveViolationFromHistory = (id: string, points: number) => {
    const updated = editViolationsHistory.filter((v) => v.id !== id);
    setEditViolationsHistory(updated);
    setEditPoin((prev) => Math.max(0, prev - points));
    gooeyToast.warning('Riwayat Kasus Dihapus', {
      description: `Poin pelanggaran santri dikurangi ${points} Pts.`,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSavingEdit(true);
    try {
      const editHafalanFormatted = `${Number(editHafalanCount) || 0} Juz`;
      await updateSantriRecord(editingStudent.id, {
        studentName: editName.trim(),
        nis: editNis.trim() || '-',
        birthDate: editBirthDate,
        domicile: editDomicile.trim(),
        kamar: editKamar,
        kelas: editKelas,
        hafalan: editHafalanFormatted,
        isTahsinPassed: editIsTahsinPassed,
        poinPelanggaran: Number(editPoin) || 0,
        violationsHistory: editViolationsHistory,
      });
      setEditingStudent(null);
      gooeyToast.success('Data Santri Berhasil Diperbarui', {
        description: `Profil ${editName} (${editKamar} - ${editKelas}) telah disimpan.`,
      });
    } catch (err) {
      console.error('Gagal mengupdate data santri:', err);
      gooeyToast.error('Gagal Menyimpan Data Santri', {
        description: 'Terjadi kendala saat menyimpan perubahan.',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const targetId = studentToDelete.id;
    const targetName = studentToDelete.studentName;
    
    // 1. Immediately remove from local state
    setStudents((prev) => prev.filter((s) => s.id !== targetId));
    setStudentToDelete(null);
    if (editingStudent?.id === targetId) {
      setEditingStudent(null);
    }

    setIsDeleting(true);
    try {
      await deleteSantriRecord(targetId);
      gooeyToast.warning('Profil Santri Berhasil Dihapus', {
        description: `Data santri ${targetName} telah dihapus dari sistem.`,
      });
    } catch (err) {
      console.error('Gagal menghapus santri dari Firestore:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to parse numeric juz from string
  const parseHafalan = (h: string): number => {
    const match = h.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // 9 official classes + any extra from data
  const availableClasses = useMemo(() => {
    const defaults = OFFICIAL_CLASSES.map((c) => c.className);
    const fromData = students.map((s) => s.kelas).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromData]));
  }, [students]);

  // Check if any filter is active
  const isFilterActive = 
    filterClass !== 'all' || 
    minHafalan !== '' || 
    maxHafalan !== '' || 
    minPoints !== '' || 
    maxPoints !== '' || 
    sortBy !== 'name_asc' || 
    searchTerm !== '';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSortBy('name_asc');
    setFilterClass('all');
    setMinHafalan('');
    setMaxHafalan('');
    setMinPoints('');
    setMaxPoints('');
    gooeyToast.info('Filter & Urutan Direset', {
      description: 'Menampilkan seluruh direktori santri.',
    });
  };

  // Filter & Sort Pipeline
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // 1. Search Query
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesSearch =
            s.studentName.toLowerCase().includes(term) ||
            s.nis.toLowerCase().includes(term) ||
            s.kamar.toLowerCase().includes(term) ||
            s.kelas.toLowerCase().includes(term);
          if (!matchesSearch) return false;
        }

        // 2. Filter Kelas
        if (filterClass !== 'all' && s.kelas !== filterClass) {
          return false;
        }

        // 3. Filter Range Hafalan (Min & Max)
        const hVal = parseHafalan(s.hafalan);
        if (minHafalan !== '' && hVal < parseFloat(minHafalan)) return false;
        if (maxHafalan !== '' && hVal > parseFloat(maxHafalan)) return false;

        // 4. Filter Range Poin Pelanggaran (Min & Max)
        const pVal = s.poinPelanggaran || 0;
        if (minPoints !== '' && pVal < parseFloat(minPoints)) return false;
        if (maxPoints !== '' && pVal > parseFloat(maxPoints)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.studentName.localeCompare(b.studentName);
        if (sortBy === 'name_desc') return b.studentName.localeCompare(a.studentName);
        if (sortBy === 'class_asc') return a.kelas.localeCompare(b.kelas);
        if (sortBy === 'hafalan_desc') return parseHafalan(b.hafalan) - parseHafalan(a.hafalan);
        if (sortBy === 'hafalan_asc') return parseHafalan(a.hafalan) - parseHafalan(b.hafalan);
        if (sortBy === 'points_desc') return (b.poinPelanggaran || 0) - (a.poinPelanggaran || 0);
        if (sortBy === 'points_asc') return (a.poinPelanggaran || 0) - (b.poinPelanggaran || 0);
        return 0;
      });
  }, [students, searchTerm, filterClass, minHafalan, maxHafalan, minPoints, maxPoints, sortBy]);

  return (
    <div className="space-y-6 font-body">
      {/* Header (Unboxed, Enlarge Title, Icon-Only Buttons with Custom UI Tooltip) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2.5 font-headline tracking-tight">
            <Users className="w-7 h-7 text-[#0F172A]" />
            Direktori & Profil Santri
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">
            Sentralisasi data hafalan, presensi shalat berjamaah, kamar, dan riwayat disiplin santri.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama, NIS, atau Kamar..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 font-body shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* 1. Edit Mode Toggle Button with Custom Tooltip */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                aria-label="Toggle Mode Edit & Kelola"
                className={`w-10 h-10 rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isEditMode
                    ? 'bg-[#059669] text-white ring-2 ring-[#059669]/30'
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              {/* Tooltip on Hover */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center px-2.5 py-1.5 bg-[#0F172A] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap z-30 pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95">
                <span>{isEditMode ? 'Nonaktifkan Mode Edit' : 'Mode Edit Santri'}</span>
                <div className="absolute -top-1 right-3.5 w-2 h-2 bg-[#0F172A] rotate-45" />
              </div>
            </div>

            {/* 2. Tambah Santri Button with Custom Tooltip */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                aria-label="Tambah Santri"
                className="w-10 h-10 rounded-md bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#1E293B] active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              {/* Tooltip on Hover */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center px-2.5 py-1.5 bg-[#0F172A] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap z-30 pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95">
                <span>Tambah Santri</span>
                <div className="absolute -top-1 right-3.5 w-2 h-2 bg-[#0F172A] rotate-45" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unboxed Sorting and Filtering Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs py-1 border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 px-2.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="name_asc">Nama (A - Z)</option>
              <option value="name_desc">Nama (Z - A)</option>
              <option value="class_asc">Kelas</option>
              <option value="hafalan_desc">Hafalan (Terbanyak)</option>
              <option value="hafalan_asc">Hafalan (Tersedikit)</option>
              <option value="points_desc">Poin (Tertinggi)</option>
              <option value="points_asc">Poin (Zero / Terendah)</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] font-medium">Kelas:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Filter Range Hafalan (Min - Max Juz) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] font-medium">Hafalan (Juz):</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={30}
                placeholder="Min"
                value={minHafalan}
                onChange={(e) => setMinHafalan(e.target.value)}
                className="w-14 h-8 px-2 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] text-center focus:border-[#0F172A] focus:outline-none"
              />
              <span className="text-[#64748B]">-</span>
              <input
                type="number"
                min={0}
                max={30}
                placeholder="Maks"
                value={maxHafalan}
                onChange={(e) => setMaxHafalan(e.target.value)}
                className="w-14 h-8 px-2 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] text-center focus:border-[#0F172A] focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Range Poin Pelanggaran (Min - Max Poin) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] font-medium">Poin:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={500}
                placeholder="Min"
                value={minPoints}
                onChange={(e) => setMinPoints(e.target.value)}
                className="w-14 h-8 px-2 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] text-center focus:border-[#0F172A] focus:outline-none"
              />
              <span className="text-[#64748B]">-</span>
              <input
                type="number"
                min={0}
                max={500}
                placeholder="Maks"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="w-14 h-8 px-2 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] text-center focus:border-[#0F172A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reset Filters & Results Counter */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#64748B]">
            Menampilkan <strong className="text-[#0F172A]">{filteredStudents.length}</strong> dari {students.length} santri
          </span>
          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[#059669] hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      
      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <Card variant="default" className="p-8 text-center bg-white border border-[#E2E8F0] space-y-2">
          <Users className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-bold text-[#0F172A] font-headline">
            {students.length === 0 ? 'Belum Ada Santri Terdaftar' : 'Tidak Ada Santri yang Sesuai Filter'}
          </h3>
          <p className="text-xs text-[#64748B] font-body">
            {students.length === 0 
              ? 'Klik tombol Tambah Santri di kanan atas untuk mendaftarkan santri baru.'
              : 'Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data santri.'}
          </p>
          {isFilterActive && students.length > 0 && (
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Reset Semua Filter
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => (
            <Card key={st.id} variant="default" className={`p-6 space-y-4 transition-all relative overflow-hidden group ${isEditMode ? 'ring-2 ring-[#059669]/30 border-[#059669]' : 'hoverable'}`}>
              
              {/* Overlay Shutter Shortcut (Visible on hover when not in edit mode) */}
              {!isEditMode && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDetailStudent(st);
                  }}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto flex items-center justify-center z-10 cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailStudent(st);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#142A18] font-bold text-xs shadow-lg hover:bg-emerald-50 hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <span>Buka Detail Santri</span>
                    <ArrowUpRight className="w-4 h-4 text-[#059669]" />
                  </button>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] font-headline tracking-tight">
                    {st.studentName}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    <span className="font-semibold text-[#059669]">{st.kamar}</span> • {st.kelas}
                  </p>
                </div>

                {/* Action Buttons: Open Detail & Edit/Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailStudent(st);
                      setDetailActiveTab('bio');
                    }}
                    aria-label="Lihat Detail Santri"
                    className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#142A18] hover:text-white text-[#475569] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                    title="Buka Detail Lengkap Santri"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {/* Edit & Delete Action Buttons (Visible when isEditMode is true) */}
                  {isEditMode && (
                    <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(st);
                        }}
                        aria-label="Edit Data Santri"
                        className="w-8 h-8 rounded bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#0F172A] hover:text-white text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Santri"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentToDelete(st);
                        }}
                        aria-label="Hapus Santri"
                        className="w-8 h-8 rounded bg-[#FEF2F2] border border-[#FEE2E2] hover:bg-[#EF4444] hover:text-white text-[#EF4444] flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus Santri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0] text-xs">
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase font-semibold font-headline tracking-wide">Hafalan Al-Quran</p>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">{st.hafalan}</p>
                </div>

                <div>
                  <p className="text-[10px] text-[#64748B] uppercase font-semibold font-headline tracking-wide">Poin Pelanggaran</p>
                  <p className={`text-sm font-bold mt-0.5 ${st.poinPelanggaran > 0 ? 'text-[#EF4444]' : 'text-[#16A34A]'}`}>
                    {st.poinPelanggaran} Pts
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] pt-1 font-body">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Presensi: <strong className="text-[#0F172A]">{st.statusIbadah}</strong></span>
                </div>
                {st.isTahsinPassed !== undefined && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${st.isTahsinPassed ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#D97706] bg-[#FFFBEB]'}`}>
                    {st.isTahsinPassed ? 'Lulus Tahsin' : 'Bimbingan Tahsin'}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIXED-DIMENSION ADD STUDENT POPUP MODAL (Strict 800px x 620px, 2 Tabs)    */}
      {/* ========================================================================= */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="w-[800px] max-w-full h-[92dvh] sm:h-[620px] max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-lg shadow-[0_12px_40px_rgba(15,23,42,0.22)] border border-[#E2E8F0] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
            
            {/* 1. Modal Fixed Header (Height: 64px) - Clean, No Icon, No Tagline, Red Close Box */}
            <div className="h-16 shrink-0 bg-[#0F172A] text-white px-6 flex items-center justify-between border-b border-[#1E293B]">
              <h3 className="text-base font-bold font-headline tracking-tight leading-tight">
                Tambah Profil Santri Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-md bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Fixed Modal Tab Bar (Height: 48px) - Evenly Distributed & No Icons */}
            <div className="h-12 shrink-0 bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center">
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setAddActiveTab('general')}
                  className={`h-9 w-full rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center text-center ${
                    addActiveTab === 'general'
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50 bg-transparent'
                  }`}
                >
                  Data Pokok & Akademik
                </button>
                
                <button
                  type="button"
                  onClick={() => setAddActiveTab('discipline')}
                  className={`h-9 w-full rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center text-center gap-1.5 ${
                    addActiveTab === 'discipline'
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50 bg-transparent'
                  }`}
                >
                  <span>Disiplin & Pelanggaran</span>
                  {addPoin > 0 && (
                    <span className="text-[10px] bg-[#EF4444] text-white font-bold px-1.5 py-0.2 rounded-full">
                      {addPoin} Pts
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 3. Modal Scrollable Content Body (Fixed Area) */}
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-6 text-xs font-body"
              topOffset="top-4"
              bottomOffset="bottom-4"
            >
              <form id="add-student-form" onSubmit={handleAddSantri} className="space-y-6">
                
                {/* ------------------------------------------------------------- */}
                {/* TAB 1: DATA POKOK & AKADEMIK                                  */}
                {/* ------------------------------------------------------------- */}
                {addActiveTab === 'general' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                        Nama Lengkap Santri *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Abdullah Faiz"
                        className="w-full h-10 px-3.5 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                      />
                    </div>

                    {/* Tanggal Lahir & Domisili (Satu Row) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Tanggal Lahir
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Domisili / Asal Kota
                        </label>
                        <input
                          type="text"
                          value={domicile}
                          onChange={(e) => setDomicile(e.target.value)}
                          placeholder="Contoh: Surabaya, Jawa Timur"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Asrama/Kamar & Kelas (Satu Row) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Asrama & Kamar *
                        </label>
                        <select
                          value={kamar}
                          onChange={(e) => setKamar(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none cursor-pointer truncate"
                        >
                          {rooms.map((r) => (
                            <option key={r.id} value={r.roomName}>
                              {r.roomName} ({r.dormitoryName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Kelas Formal/Diniyah *
                        </label>
                        <select
                          value={kelas}
                          onChange={(e) => setKelas(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none cursor-pointer truncate"
                        >
                          {availableClasses.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Total Hafalan & Toggle Tahsin (Satu Row) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 items-end pt-1">
                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Total Hafalan Al-Quran
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={30}
                            step={1}
                            value={hafalanCount}
                            onChange={(e) => setHafalanCount(e.target.value === '' ? '' : Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                            placeholder="0"
                            className="w-full h-10 pl-3.5 pr-12 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-bold focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                          />
                          <span className="absolute right-3.5 text-xs font-bold text-[#64748B] pointer-events-none select-none">
                            Juz
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Status Kelayakan Tahsin
                        </label>
                        <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md h-10">
                          <span className="text-xs font-medium text-[#0F172A] truncate pr-1">
                            {isTahsinPassed ? 'Lulus Uji' : 'Bimbingan'}
                          </span>
                          
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => setIsTahsinPassed(!isTahsinPassed)}
                            className={`w-11 h-6 shrink-0 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                              isTahsinPassed ? 'bg-[#059669]' : 'bg-[#94A3B8]'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                isTahsinPassed ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* NIS Field (Optional Information) */}
                    <div className="pt-2 border-t border-[#E2E8F0]">
                      <label className="block font-semibold mb-1 text-[#64748B] font-headline">
                        Nomor Induk Santri (NIS) <span className="text-[#94A3B8] font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="Contoh: 2024.12.084 (Boleh dikosongkan)"
                        className="w-full h-10 px-3.5 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                      />
                    </div>

                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 2: DISIPLIN & PELANGGARAN                                 */}
                {/* ------------------------------------------------------------- */}
                {addActiveTab === 'discipline' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Poin Pelanggaran Total Control */}
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A] font-headline">Poin Pelanggaran Awal</h4>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Akumulasi poin awal santri saat pendaftaran baru (default 0 Pts)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            max={500}
                            value={addPoin}
                            onChange={(e) => setAddPoin(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 h-10 text-center text-sm font-bold bg-white border border-[#CBD5E1] rounded-md focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-[#EF4444]"
                          />
                          <button
                            type="button"
                            onClick={() => setAddPoin(0)}
                            className="h-9 px-3 text-[11px] font-semibold bg-white border border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A] rounded-md transition-colors cursor-pointer"
                          >
                            Reset 0 Pts
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mini Form: Tambah Riwayat Pelanggaran */}
                    <div className="p-4 border border-[#E2E8F0] rounded-lg bg-white space-y-4">
                      <div className="flex items-center gap-2 text-[#0F172A] font-bold font-headline text-xs">
                        <Plus className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Catat Pelanggaran / Sanksi Awal (Opsional)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Nama / Jenis Pelanggaran</label>
                          <input
                            type="text"
                            placeholder="Contoh: Terlambat Masuk Kelas Diniyah"
                            value={newAddVioTitle}
                            onChange={(e) => setNewAddVioTitle(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Bobot Poin (+Pts)</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={newAddVioPoints}
                            onChange={(e) => setNewAddVioPoints(parseInt(e.target.value) || 0)}
                            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded text-xs text-center font-bold text-[#EF4444] focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Hukuman / Sanksi Edukatif Diberikan</label>
                          <input
                            type="text"
                            placeholder="Contoh: Menulis mufrodat 1 lembar / piket masjid"
                            value={newAddVioPenalty}
                            onChange={(e) => setNewAddVioPenalty(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#64748B] mb-1">Tanggal Kejadian</label>
                          <input
                            type="date"
                            value={newAddVioDate}
                            onChange={(e) => setNewAddVioDate(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded text-xs focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddNewAddViolation}
                          className="h-8 px-4 bg-[#0F172A] hover:bg-[#020617] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Tambahkan ke Riwayat
                        </button>
                      </div>
                    </div>

                    {/* List Riwayat Pelanggaran Saat Ini */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] mb-2 font-headline flex items-center justify-between">
                        <span>Daftar Riwayat Kasus Pelanggaran Awal ({addViolationsHistory.length})</span>
                      </h4>

                      {addViolationsHistory.length === 0 ? (
                        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center text-xs text-[#64748B]">
                          Belum ada catatan pelanggaran awal untuk santri ini.
                        </div>
                      ) : (
                        <ScrollArea
                          className="max-h-40"
                          viewportClassName="space-y-2 pr-1"
                          topOffset="top-2"
                          bottomOffset="bottom-2"
                        >
                          {addViolationsHistory.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#0F172A]">{item.title}</span>
                                  <span className="text-[10px] font-bold text-[#EF4444] bg-[#FEF2F2] px-1.5 py-0.2 rounded border border-[#FEE2E2]">
                                    +{item.points} Pts
                                  </span>
                                </div>
                                {item.penalty && (
                                  <p className="text-[11px] text-[#64748B]">
                                    Sanksi: <span className="font-medium text-[#0F172A]">{item.penalty}</span>
                                  </p>
                                )}
                                {item.date && (
                                  <p className="text-[10px] text-[#94A3B8]">{item.date}</p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveNewAddViolation(item.id)}
                                className="w-7 h-7 rounded hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#94A3B8] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Hapus Riwayat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </ScrollArea>
                      )}
                    </div>

                  </div>
                )}

              </form>
            </ScrollArea>

            {/* 4. Modal Fixed Footer (Height: 64px) */}
            <div className="h-16 shrink-0 bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">
                {addActiveTab === 'general' ? 'Data Pokok & Akademik' : 'Disiplin & Pelanggaran'}
              </span>
              
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAdding(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  form="add-student-form"
                  variant="primary" 
                  size="sm" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    'Daftarkan Santri Baru'
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* FIXED-DIMENSION STUDENT EDIT MODAL (Strict Width & Height, 2 Tabs Layout) */}
      {/* ========================================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          {/* Strict Fixed Size Window: 800px x 620px (TIDAK BERUBAH SAMA SEKALI) */}
          <div className="w-[800px] max-w-full h-[92dvh] sm:h-[620px] max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-lg shadow-[0_12px_40px_rgba(15,23,42,0.22)] border border-[#E2E8F0] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
            
            {/* 1. Modal Fixed Header (Height: 64px) */}
            <div className="h-16 shrink-0 bg-[#0F172A] text-white px-6 flex items-center justify-between border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center text-white">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-headline tracking-tight leading-tight flex items-center gap-2">
                    Edit Data & Disiplin Santri
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-none mt-0.5">
                    {editingStudent.studentName} {editingStudent.kamar ? `• ${editingStudent.kamar}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Fixed Modal Tab Bar (Height: 48px) */}
            <div className="h-12 shrink-0 bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditActiveTab('general')}
                className={`h-9 px-4 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  editActiveTab === 'general'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Data Pokok & Akademik
              </button>
              
              <button
                type="button"
                onClick={() => setEditActiveTab('discipline')}
                className={`h-9 px-4 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  editActiveTab === 'discipline'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Disiplin & Pelanggaran
                {editPoin > 0 && (
                  <span className="ml-1 text-[10px] bg-[#EF4444] text-white font-bold px-1.5 py-0.2 rounded-full">
                    {editPoin} Pts
                  </span>
                )}
              </button>
            </div>

            {/* 3. Modal Scrollable Content Body (Fixed Area) */}
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-6 text-xs font-body"
              topOffset="top-4"
              bottomOffset="bottom-4"
            >
              <form id="edit-student-form" onSubmit={handleSaveEdit} className="space-y-6">
                
                {/* ------------------------------------------------------------- */}
                {/* TAB 1: DATA POKOK & AKADEMIK                                  */}
                {/* ------------------------------------------------------------- */}
                {editActiveTab === 'general' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    
                    {/* Row 1: Nama Lengkap */}
                    <div>
                      <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                        Nama Lengkap Santri *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Contoh: Abdullah Faiz"
                        className="w-full h-10 px-3.5 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                      />
                    </div>

                    {/* Row 2: Tanggal Lahir & Domisili */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Tanggal Lahir
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editBirthDate}
                            onChange={(e) => setEditBirthDate(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Domisili / Asal Kota
                        </label>
                        <input
                          type="text"
                          value={editDomicile}
                          onChange={(e) => setEditDomicile(e.target.value)}
                          placeholder="Contoh: Surabaya, Jawa Timur"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 3: Asrama/Kamar & Kelas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Asrama & Kamar *
                        </label>
                        <select
                          value={editKamar}
                          onChange={(e) => setEditKamar(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none cursor-pointer"
                        >
                          {rooms.map((r) => (
                            <option key={r.id} value={r.roomName}>
                              {r.roomName} ({r.dormitoryName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Kelas Formal/Diniyah *
                        </label>
                        <select
                          value={editKelas}
                          onChange={(e) => setEditKelas(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-medium focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none cursor-pointer"
                        >
                          {availableClasses.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Total Hafalan & Toggle Tahsin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Total Hafalan Al-Quran
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            max={30}
                            step={1}
                            value={editHafalanCount}
                            onChange={(e) => setEditHafalanCount(e.target.value === '' ? '' : Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                            placeholder="0"
                            className="w-full h-10 pl-3.5 pr-12 bg-white border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] font-bold focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] focus:outline-none"
                          />
                          <span className="absolute right-3.5 text-xs font-bold text-[#64748B] pointer-events-none select-none">
                            Juz
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#0F172A] font-headline">
                          Status Kelayakan Tahsin
                        </label>
                        <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md h-10">
                          <span className="text-xs font-medium text-[#0F172A]">
                            {editIsTahsinPassed ? 'Lulus Uji Tahsin' : 'Dalam Bimbingan Tahsin'}
                          </span>
                          
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => setEditIsTahsinPassed(!editIsTahsinPassed)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                              editIsTahsinPassed ? 'bg-[#059669]' : 'bg-[#94A3B8]'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                editIsTahsinPassed ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* NIS Field (Optional Information) */}
                    <div className="pt-2 border-t border-[#E2E8F0]">
                      <label className="block font-semibold mb-1 text-[#64748B] font-headline">
                        Nomor Induk Santri / NIS (Opsional)
                      </label>
                      <input
                        type="text"
                        value={editNis}
                        onChange={(e) => setEditNis(e.target.value)}
                        placeholder="Contoh: 2024.12.084 (Opsional)"
                        className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                      />
                    </div>

                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 2: DISIPLIN & PELANGGARAN                                 */}
                {/* ------------------------------------------------------------- */}
                {editActiveTab === 'discipline' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    
                    {/* 1. Total Points Editor Header */}
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase font-headline tracking-wide">
                          Total Akumulasi Poin Pelanggaran
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Nilai poin disinkronkan otomatis dari rekam kasus di bawah.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={editPoin}
                            onChange={(e) => setEditPoin(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 h-9 px-2.5 bg-white border border-[#CBD5E1] rounded text-center text-sm font-bold text-[#EF4444] focus:border-[#0F172A] focus:outline-none"
                          />
                          <span className="font-bold text-xs text-[#64748B]">Pts</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditPoin(0)}
                          className="h-9 px-2.5 bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded text-[11px] font-medium cursor-pointer"
                        >
                          Reset 0
                        </button>
                      </div>
                    </div>

                    {/* 2. Mini Form: Tambah Rekam Pelanggaran & Hukuman Baru */}
                    <div className="p-4 bg-white border border-[#E2E8F0] rounded-md space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase font-headline tracking-wide flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-[#059669]" />
                          Input Rekam Kasus Pelanggaran & Sanksi Baru
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-[#64748B] uppercase mb-1">
                            Judul / Deskripsi Pelanggaran
                          </label>
                          <input
                            type="text"
                            value={newVioTitle}
                            onChange={(e) => setNewVioTitle(e.target.value)}
                            placeholder="Contoh: Terlambat Shalat Shubuh Berjamaah"
                            className="w-full h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-[#64748B] uppercase mb-1">
                            Poin Pelanggaran
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={newVioPoints}
                            onChange={(e) => setNewVioPoints(parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-[#64748B] uppercase mb-1">
                            Hukuman / Sanksi / Tindakan Edukatif Diberikan
                          </label>
                          <input
                            type="text"
                            value={newVioPenalty}
                            onChange={(e) => setNewVioPenalty(e.target.value)}
                            placeholder="Contoh: Menghafal Surat As-Sajdah & Piket Masjid"
                            className="w-full h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-[#64748B] uppercase mb-1">
                            Tanggal Kejadian
                          </label>
                          <input
                            type="date"
                            value={newVioDate}
                            onChange={(e) => setNewVioDate(e.target.value)}
                            className="w-full h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddNewViolationToHistory}
                          disabled={!newVioTitle.trim()}
                          className="h-8 px-3.5 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Tambahkan ke Riwayat
                        </button>
                      </div>
                    </div>

                    {/* 3. Daftar Riwayat Pelanggaran & Hukuman */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#0F172A] uppercase font-headline tracking-wide flex items-center justify-between">
                        <span>Daftar Riwayat Pelanggaran ({editViolationsHistory.length} Kasus)</span>
                      </h4>

                      {editViolationsHistory.length === 0 ? (
                        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-center text-[#64748B]">
                          <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto mb-1 opacity-70" />
                          <p className="font-semibold text-xs text-[#0F172A]">Bersih dari Catatan Pelanggaran</p>
                          <p className="text-[11px]">Santri ini memiliki rekam jejak disiplin yang sangat baik.</p>
                        </div>
                      ) : (
                        <ScrollArea
                          className="max-h-[160px]"
                          viewportClassName="space-y-2 pr-1"
                          topOffset="top-2"
                          bottomOffset="bottom-2"
                        >
                          {editViolationsHistory.map((vio) => (
                            <div
                              key={vio.id}
                              className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md flex items-start justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#0F172A]">{vio.title}</span>
                                  <span className="text-[10px] font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.2 rounded border border-[#FEE2E2]">
                                    +{vio.points} Pts
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#64748B]">
                                  Hukuman: <strong className="text-[#0F172A]">{vio.penalty}</strong> • Tgl: {vio.date}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveViolationFromHistory(vio.id, vio.points)}
                                className="w-7 h-7 rounded hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#94A3B8] flex items-center justify-center transition-colors cursor-pointer"
                                title="Hapus Riwayat Kasus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </ScrollArea>
                      )}
                    </div>

                  </div>
                )}

              </form>
            </ScrollArea>

            {/* 4. Modal Fixed Footer (Height: 64px) */}
            <div className="h-16 shrink-0 bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStudentToDelete(editingStudent)}
                className="text-xs text-[#EF4444] hover:text-[#DC2626] font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Profil Santri
              </button>
              
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingStudent(null)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  form="edit-student-form"
                  variant="primary" 
                  size="sm" 
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    'Simpan Perubahan Data'
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Student Confirmation Dialog */}
      {studentToDelete && (
        <div data-lenis-prevent className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] my-auto overflow-y-auto rounded-lg shadow-[0_12px_40px_rgba(15,23,42,0.25)] border border-[#E2E8F0] p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#0F172A] font-headline">Konfirmasi Hapus Data Santri</h3>
              <p className="text-xs text-[#64748B]">
                Apakah Anda yakin ingin menghapus data <strong className="text-[#0F172A]">{studentToDelete.studentName}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStudentToDelete(null)}>
                Batal
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                size="sm" 
                onClick={handleConfirmDelete} 
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : 'Ya, Hapus Santri'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL UTAMA DETAIL SANTRI (STANDARDIZED SINGLE COMPONENT)              */}
      {/* ========================================================================= */}
      <StudentDetailModal
        student={selectedDetailStudent}
        dormitories={dormitories}
        rooms={rooms}
        classes={classes}
        onClose={() => setSelectedDetailStudent(null)}
        onStudentUpdated={(updatedStudent) => {
          setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
          setSelectedDetailStudent(updatedStudent);
        }}
      />

    </div>
  );
};
