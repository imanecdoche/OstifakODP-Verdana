import React, { useState, useMemo, useEffect } from 'react';
import { 
  SantriRecord, 
  StudentAchievementEntry, 
  updateSantriRecord,
  OFFICIAL_CLASSES,
  ALL_OFFICIAL_ROOMS
} from '../../lib/firestoreService';
import { 
  getMonthlyExecutionStatus, 
  getNextMonthlyPPSchedule, 
  executeMonthlyPPAward,
  calculateMonthlyAwards
} from '../../lib/achievementAutomationService';
import { PillTabs } from '../ui/PillTabs';
import { Button } from '../ui/Button';
import { gooeyToast } from 'goey-toast';
import { recordSessionAction } from '../../lib/sessionLogService';
import { MoreHorizontal, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '../../lib/useIsMobile';
import { ActionSheet } from '../ui/ActionSheet';

const RunningText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        if (contentWidth > containerWidth + 2) {
          setIsOverflowing(true);
          setOverflowDistance(contentWidth - containerWidth + 16);
        } else {
          setIsOverflowing(false);
          setOverflowDistance(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const duration = Math.max(4, Math.min(14, overflowDistance / 14));

  return (
    <div ref={containerRef} className={`relative overflow-hidden whitespace-nowrap ${className}`}>
      <span
        ref={contentRef}
        className={`inline-block ${
          isOverflowing
            ? 'animate-ticker-marquee hover:[animation-play-state:paused] cursor-default'
            : ''
        }`}
        style={
          isOverflowing
            ? ({
                '--ticker-distance': `-${overflowDistance}px`,
                '--ticker-duration': `${duration}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
};

interface AchievementsViewProps {
  students: SantriRecord[];
  onSelectStudent?: (student: SantriRecord) => void;
}

interface FlattenedAchievement {
  id: string;
  achievementId: string;
  studentId: string;
  studentName: string;
  nis: string;
  kamar: string;
  kelas: string;
  title: string;
  category: string;
  rank: string;
  organizer: string;
  points: number; // PP
  date: string;
  description?: string;
}

interface ActiveMenuState {
  x: number;
  y: number;
  achievement: FlattenedAchievement;
  type: 'dropdown' | 'contextmenu';
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  students,
  onSelectStudent,
}) => {
  const isMobile = useIsMobile(768);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isExecutingAuto, setIsExecutingAuto] = useState<boolean>(false);
  const [isAutoPreviewOpen, setIsAutoPreviewOpen] = useState<boolean>(false);

  // Context Menu / 3-Dots Dropdown State
  const [activeMenu, setActiveMenu] = useState<ActiveMenuState | null>(null);

  // Form State for Manual New Entry
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Santri Teladan');
  const [newRank, setNewRank] = useState<string>('Juara 1');
  const [newPoints, setNewPoints] = useState<number>(20);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newOrganizer, setNewOrganizer] = useState<string>('Pesantren Fajrul Karim');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State for Edit Achievement Modal
  const [editingAchievement, setEditingAchievement] = useState<FlattenedAchievement | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editRank, setEditRank] = useState<string>('');
  const [editPoints, setEditPoints] = useState<number>(20);
  const [editDate, setEditDate] = useState<string>('');
  const [editOrganizer, setEditOrganizer] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // State for Delete Achievement Confirmation Modal
  const [deletingAchievement, setDeletingAchievement] = useState<FlattenedAchievement | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Monthly Automation Schedule Status
  const scheduleInfo = useMemo(() => getNextMonthlyPPSchedule(), []);
  const executionStatus = useMemo(() => getMonthlyExecutionStatus(), []);

  // Close context menu on window click or scroll
  useEffect(() => {
    const handleCloseMenu = () => {
      if (activeMenu) setActiveMenu(null);
    };
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('scroll', handleCloseMenu, true);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('scroll', handleCloseMenu, true);
    };
  }, [activeMenu]);

  // 1. Flatten all achievements across all students
  const allAchievements = useMemo<FlattenedAchievement[]>(() => {
    if (!students) return [];
    const list: FlattenedAchievement[] = [];

    students.forEach(s => {
      const achs = s.achievementsHistory || [];
      achs.forEach(a => {
        list.push({
          id: `${s.id}-${a.id}`,
          achievementId: a.id,
          studentId: s.id,
          studentName: s.studentName,
          nis: s.nis || '-',
          kamar: s.kamar || '-',
          kelas: s.kelas || '-',
          title: a.title,
          category: a.category || 'Penghargaan',
          rank: a.rank || '-',
          organizer: a.organizer || 'Pesantren',
          points: a.points !== undefined ? a.points : 10,
          date: a.date || '-',
          description: a.description,
        });
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [students]);

  // 2. Metrics calculation
  const totalAchievements = allAchievements.length;
  const totalPP = allAchievements.reduce((acc, a) => acc + (a.points || 0), 0);
  const distinctAchievingStudents = useMemo(() => {
    const set = new Set(allAchievements.map(a => a.studentId));
    return set.size;
  }, [allAchievements]);

  // 3. Top 5 Santri by Total PP
  const topPPSantri = useMemo(() => {
    if (!students) return [];
    const studentPPMap = students.map(s => {
      const achs = s.achievementsHistory || [];
      const calculatedPP = achs.reduce((acc, a) => acc + (a.points || 10), 0);
      return {
        student: s,
        totalPP: s.poinPrestasi !== undefined ? s.poinPrestasi : calculatedPP,
        achCount: achs.length,
      };
    });

    return studentPPMap
      .filter(item => item.totalPP > 0 || item.achCount > 0)
      .sort((a, b) => b.totalPP - a.totalPP || b.achCount - a.achCount)
      .slice(0, 5);
  }, [students]);

  // Filter Tabs
  const categoryTabs = [
    { id: 'all', label: 'Semua Prestasi' },
    { id: 'Santri Teladan', label: 'Santri Teladan' },
    { id: 'Hafalan Terbanyak', label: 'Tahfizh & Huffazh' },
    { id: 'Setoran Terbanyak Bulan Ini', label: 'Setoran Bulanan' },
    { id: 'Murojaah Terbanyak Bulan Ini', label: 'Murojaah Bulanan' },
    { id: 'Eksternal', label: 'Lomba & Eksternal' },
  ];

  // Filtered List
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(a => {
      // Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'Eksternal') {
          if (['Santri Teladan', 'Hafalan Terbanyak', 'Setoran Terbanyak Bulan Ini', 'Murojaah Terbanyak Bulan Ini'].includes(a.category)) {
            return false;
          }
        } else if (a.category !== selectedCategory) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.studentName.toLowerCase().includes(q);
        const matchNIS = a.nis.toLowerCase().includes(q);
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchKamar = a.kamar.toLowerCase().includes(q);
        const matchOrganizer = a.organizer.toLowerCase().includes(q);
        if (!matchName && !matchNIS && !matchTitle && !matchKamar && !matchOrganizer) {
          return false;
        }
      }

      return true;
    });
  }, [allAchievements, selectedCategory, searchQuery]);

  // Preview Monthly Awards
  const monthlyPreviewAwards = useMemo(() => {
    return calculateMonthlyAwards(students);
  }, [students]);

  // Execute Auto Award Handler
  const handleExecuteAutoAward = async () => {
    if (isExecutingAuto) return;
    setIsExecutingAuto(true);
    try {
      const res = await executeMonthlyPPAward(students, true);
      if (res.success) {
        setIsAutoPreviewOpen(false);
      }
    } catch (err: any) {
      gooeyToast.error('Gagal Eksekusi Otomatis PP', {
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsExecutingAuto(false);
    }
  };

  // Open 3-Dots Dropdown with boundary guards
  const handleOpenDropdown = (e: React.MouseEvent<HTMLButtonElement>, record: FlattenedAchievement) => {
    e.stopPropagation();
    if (activeMenu?.achievement.id === record.id && activeMenu.type === 'dropdown') {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 110;

    let x = rect.right - menuWidth;
    if (x < 16) x = 16;
    if (x + menuWidth > window.innerWidth - 16) {
      x = window.innerWidth - menuWidth - 16;
    }

    let y = rect.bottom + 6;
    if (y + menuHeight > window.innerHeight - 16) {
      y = rect.top - menuHeight - 6;
    }

    setActiveMenu({
      x,
      y,
      achievement: record,
      type: 'dropdown',
    });
  };

  // Open Right-Click Context Menu with boundary guards
  const handleRowContextMenu = (e: React.MouseEvent, record: FlattenedAchievement) => {
    e.preventDefault();
    const menuWidth = 180;
    const menuHeight = 110;

    let x = e.clientX;
    if (x + menuWidth > window.innerWidth - 16) {
      x = window.innerWidth - menuWidth - 16;
    }

    let y = e.clientY;
    if (y + menuHeight > window.innerHeight - 16) {
      y = e.clientY - menuHeight;
    }

    setActiveMenu({
      x,
      y,
      achievement: record,
      type: 'contextmenu',
    });
  };

  // Trigger Edit Modal
  const handleOpenEdit = (record: FlattenedAchievement) => {
    setActiveMenu(null);
    setEditingAchievement(record);
    setEditTitle(record.title);
    setEditCategory(record.category);
    setEditRank(record.rank);
    setEditPoints(record.points || 20);
    setEditDate(record.date || new Date().toISOString().split('T')[0]);
    setEditOrganizer(record.organizer || 'Pesantren');
    setEditDescription(record.description || '');
  };

  // Trigger Delete Confirmation Modal
  const handleOpenDelete = (record: FlattenedAchievement) => {
    setActiveMenu(null);
    setDeletingAchievement(record);
  };

  // Submit Save Edit Achievement
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAchievement || isSavingEdit) return;

    const targetStudent = students.find(s => s.id === editingAchievement.studentId);
    if (!targetStudent) {
      gooeyToast.error('Data santri tidak ditemukan.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const existingHistory = targetStudent.achievementsHistory || [];
      const updatedHistory = existingHistory.map(a => {
        if (a.id === editingAchievement.achievementId) {
          return {
            ...a,
            title: editTitle.trim(),
            category: editCategory.trim(),
            rank: editRank.trim(),
            points: Number(editPoints) || 0,
            date: editDate,
            organizer: editOrganizer.trim(),
            description: editDescription.trim() || undefined,
          };
        }
        return a;
      });

      // Recalculate total poinPrestasi (PP)
      const newTotalPP = updatedHistory.reduce((acc, a) => acc + (a.points || 10), 0);

      await updateSantriRecord(targetStudent.id, {
        achievementsHistory: updatedHistory,
        poinPrestasi: newTotalPP,
      });

      recordSessionAction(
        'Prestasi & Penghargaan',
        'Pembaruan Data Prestasi',
        `Memperbarui data prestasi santri ${targetStudent.studentName}: ${editTitle} (${editPoints} PP)`
      );

      gooeyToast.success('Perubahan Prestasi Berhasil Disimpan', {
        description: `${targetStudent.studentName} • ${editTitle} (${editPoints} PP)`,
      });

      setEditingAchievement(null);
    } catch (err: any) {
      gooeyToast.error('Gagal Menyimpan Perubahan', {
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Delete Achievement
  const handleConfirmDelete = async () => {
    if (!deletingAchievement || isDeleting) return;

    const targetStudent = students.find(s => s.id === deletingAchievement.studentId);
    if (!targetStudent) {
      gooeyToast.error('Data santri tidak ditemukan.');
      return;
    }

    setIsDeleting(true);
    try {
      const existingHistory = targetStudent.achievementsHistory || [];
      const filteredHistory = existingHistory.filter(a => a.id !== deletingAchievement.achievementId);
      
      // Recalculate total poinPrestasi (PP)
      const newTotalPP = filteredHistory.reduce((acc, a) => acc + (a.points || 10), 0);

      await updateSantriRecord(targetStudent.id, {
        achievementsHistory: filteredHistory,
        poinPrestasi: newTotalPP,
      });

      recordSessionAction(
        'Prestasi & Penghargaan',
        'Penghapusan Data Prestasi',
        `Menghapus rekam prestasi santri ${targetStudent.studentName}: ${deletingAchievement.title} (-${deletingAchievement.points} PP)`
      );

      gooeyToast.success('Catatan Prestasi Berhasil Dihapus', {
        description: `${targetStudent.studentName} • ${deletingAchievement.title}`,
      });

      setDeletingAchievement(null);
    } catch (err: any) {
      gooeyToast.error('Gagal Menghapus Prestasi', {
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Submit Manual New Achievement Form
  const handleSubmitNewAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !newTitle.trim()) {
      gooeyToast.warning('Mohon lengkapi santri dan judul prestasi.');
      return;
    }

    const targetStudent = students.find(s => s.id === selectedStudentId);
    if (!targetStudent) return;

    setIsSubmitting(true);
    try {
      const newEntry: StudentAchievementEntry = {
        id: `ach-man-${Date.now()}`,
        title: newTitle.trim(),
        category: newCategory,
        rank: newRank.trim(),
        organizer: newOrganizer.trim(),
        date: newDate,
        points: Number(newPoints) || 0,
        description: newDescription.trim() || undefined,
      };

      const existingAchievements = targetStudent.achievementsHistory || [];
      const updatedAchievements = [newEntry, ...existingAchievements];
      const updatedPP = (targetStudent.poinPrestasi || 0) + newEntry.points!;

      await updateSantriRecord(targetStudent.id, {
        achievementsHistory: updatedAchievements,
        poinPrestasi: updatedPP,
      });

      recordSessionAction(
        'Prestasi & Penghargaan',
        'Pencatatan Prestasi Baru',
        `Mencatat prestasi santri ${targetStudent.studentName} (+${newEntry.points} PP): ${newEntry.title}`
      );

      gooeyToast.success('Prestasi Berhasil Dicatat', {
        description: `${targetStudent.studentName} • ${newEntry.title} (+${newEntry.points} PP)`,
      });

      // Reset form
      setNewTitle('');
      setNewRank('Juara 1');
      setNewPoints(20);
      setNewDescription('');
      setIsNewModalOpen(false);
    } catch (err: any) {
      gooeyToast.error('Gagal Menyimpan Prestasi', {
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-body">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-headline tracking-tight">
            Rekam Jejak Prestasi & Poin Penghargaan (PP)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">
            Direktori rekam jejak prestasi, penghargaan berkala otomatis (21:00 WIB), dan akumulasi Poin Prestasi (PP) santri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAutoPreviewOpen(true)}
            className="border-[#E2E8F0] hover:bg-[#F8FAFC]"
          >
            ⚡ Otomasi PP Bulan Ini
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
          >
            + Catat Prestasi Baru
          </Button>
        </div>
      </div>

      {/* 2. Executive Metric Cards (Unboxed 1-Row on Desktop, Symmetrical 2x2 Grid on Mobile with Dividers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#E2E8F0] overflow-hidden">
        {/* Metric 1 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Total Prestasi Terbit
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {totalAchievements}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Rekam</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 sm:px-5 sm:py-4 md:border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Akumulasi Poin PP
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight font-headline">
              +{totalPP}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">PP</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Santri Berprestasi
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {distinctAchievingStudents}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Santri</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Jadwal Otomasi PP
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight font-headline whitespace-nowrap">
              {scheduleInfo.formattedSchedule.split(',')[0]}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium font-body">21:00 WIB</span>
          </div>
        </div>
      </div>

      {/* 3. Leaderboard Top 5 Akumulasi Poin Prestasi (PP) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] font-headline">
              Top 5 Santri Akumulasi Poin Prestasi (PP)
            </h2>
            <p className="text-[11px] text-[#64748B]">Santri peraih akumulasi poin penghargaan tertinggi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topPPSantri.length === 0 ? (
            <p className="text-xs text-[#64748B] py-3 col-span-full">Belum ada akumulasi poin prestasi tercatat.</p>
          ) : (
            topPPSantri.map((item, idx) => (
              <div 
                key={item.student.id} 
                onClick={() => onSelectStudent && onSelectStudent(item.student)}
                className="p-3.5 bg-white rounded-lg border border-[#E2E8F0] space-y-2 cursor-pointer hover:border-[#0F172A] transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#64748B]">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#059669]">
                    +{item.totalPP} PP
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#0F172A] font-headline truncate">
                    {item.student.studentName}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {item.student.kamar} • {item.student.kelas}
                  </p>
                </div>
                <p className="text-[10px] text-[#64748B] border-t border-slate-100 pt-1.5 font-medium">
                  {item.achCount} Penghargaan Terbit
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
        <PillTabs
          tabs={categoryTabs}
          activeTab={selectedCategory}
          onChange={(id) => setSelectedCategory(id)}
        />

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari santri, NIS, atau prestasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {/* 5. Tabel Rekam Jejak Prestasi (Clean Flat Table, Thin Dividers, AKSI Column) */}
      <div className="bg-white border-y border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-[0.5px] font-headline bg-[#F8FAFC]">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5 min-w-[180px]">Santri</th>
                <th className="p-3.5 min-w-[220px]">Prestasi / Capaian</th>
                <th className="p-3.5 w-36">Kategori</th>
                <th className="p-3.5 w-28 text-right">Poin PP</th>
                <th className="p-3.5 w-44">Penyelenggara / Sumber</th>
                <th className="p-3.5 w-28 text-right">Tanggal</th>
                <th className="p-3.5 w-16 text-right pr-4">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredAchievements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#64748B] font-body">
                    Tidak ada rekam jejak prestasi yang sesuai dengan filter atau kata kunci.
                  </td>
                </tr>
              ) : (
                filteredAchievements.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    onContextMenu={(e) => handleRowContextMenu(e, item)}
                    className={`transition-colors select-none ${
                      activeMenu?.achievement.id === item.id ? 'bg-slate-100/80' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* 1. No */}
                    <td className="p-3.5 text-center text-[#64748B] font-mono align-middle">
                      {idx + 1}
                    </td>

                    {/* 2. Santri */}
                    <td className="p-3.5 align-middle">
                      <p className="font-bold text-[#0F172A] font-headline">
                        {item.studentName}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-body mt-0.5">
                        NIS: {item.nis} • {item.kamar} • {item.kelas}
                      </p>
                    </td>

                    {/* 3. Judul Prestasi & Peringkat */}
                    <td className="p-3.5 align-middle">
                      <p className="font-semibold text-[#0F172A]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-body mt-0.5">
                        Peringkat: <strong className="text-[#0F172A]">{item.rank}</strong>
                        {item.description ? ` • ${item.description}` : ''}
                      </p>
                    </td>

                    {/* 4. Kategori */}
                    <td className="p-3.5 text-[#64748B] font-body align-middle">
                      {item.category}
                    </td>

                    {/* 5. Poin PP */}
                    <td className="p-3.5 text-right font-bold text-[#059669] font-mono whitespace-nowrap align-middle">
                      +{item.points} PP
                    </td>

                    {/* 6. Penyelenggara */}
                    <td className="p-3.5 text-[#64748B] font-body align-middle text-xs">
                      {item.organizer}
                    </td>

                    {/* 7. Tanggal */}
                    <td className="p-3.5 text-right text-[#64748B] font-mono text-[11px] whitespace-nowrap align-middle">
                      {item.date}
                    </td>

                    {/* 8. Kolom AKSI (Three Dots Button) */}
                    <td className="p-3.5 w-16 text-right pr-4 whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDropdown(e, item)}
                        className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors ml-auto cursor-pointer active:scale-95 ${
                          activeMenu?.achievement.id === item.id && activeMenu.type === 'dropdown'
                            ? 'bg-slate-200 text-slate-900'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Menu Opsi Prestasi"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Mobile Bottom Sheet (Action Sheet) */}
      {isMobile && activeMenu && (
        <ActionSheet
          isOpen={!!activeMenu}
          onClose={() => setActiveMenu(null)}
          title={activeMenu.achievement.studentName}
          subtitle={`${activeMenu.achievement.title} • +${activeMenu.achievement.points} PP • ${activeMenu.achievement.category}`}
          actions={[
            {
              label: 'Edit Prestasi',
              icon: <Pencil className="w-5 h-5 text-black" />,
              onClick: () => handleOpenEdit(activeMenu.achievement),
            },
            {
              label: 'Hapus Prestasi',
              icon: <Trash2 className="w-5 h-5 text-black" />,
              isDestructive: true,
              onClick: () => handleOpenDelete(activeMenu.achievement),
            },
          ]}
        />
      )}

      {/* 2. Desktop Floating Fixed Dropdown & Context Menu with Transparent Backdrop */}
      {!isMobile && activeMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent pointer-events-auto cursor-default"
            onClick={() => setActiveMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setActiveMenu(null);
            }}
          />

          <div
            style={{ top: `${activeMenu.y}px`, left: `${activeMenu.x}px` }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 min-w-[170px] bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 space-y-0.5 text-xs text-left animate-in fade-in zoom-in-95 font-body pointer-events-auto select-none"
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <p className="font-bold text-[11px] text-slate-800 truncate font-headline">
                {activeMenu.achievement.studentName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {activeMenu.achievement.title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(activeMenu.achievement)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-md transition-colors cursor-pointer font-medium"
            >
              <Pencil className="w-3.5 h-3.5 text-black" />
              <span>Edit Prestasi</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDelete(activeMenu.achievement)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 text-black" />
              <span>Hapus Prestasi</span>
            </button>
          </div>
        </>
      )}

      {/* MODAL 1: CATAT PRESTASI MANUAL */}
      {isNewModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base font-bold text-[#0F172A] font-headline">Catat Rekam Jejak Prestasi Baru</h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">Input penghargaan santri dan alokasi Poin Prestasi (PP)</p>
            </div>

            <form onSubmit={handleSubmitNewAchievement} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Pilih Santri Penerima Prestasi *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Pilih Santri --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.nis || '-'}) - Kamar {s.kamar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Nama Prestasi / Kejuaraan *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Juara 1 MHQ 30 Juz Tingkat Provinsi"
                  required
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Kategori Prestasi
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    <option value="Santri Teladan">Santri Teladan</option>
                    <option value="Tahfizh Al-Quran">Tahfizh Al-Quran</option>
                    <option value="Hafalan Terbanyak">Hafalan Terbanyak</option>
                    <option value="Akademik & Sekolah">Akademik & Sekolah</option>
                    <option value="Bahasa Arab & Inggris">Bahasa Arab & Inggris</option>
                    <option value="Kebersihan & Kerapian">Kebersihan & Kerapian</option>
                    <option value="Lomba Eksternal">Lomba Eksternal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Peringkat / Capaian
                  </label>
                  <input
                    type="text"
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                    placeholder="Juara 1 / Terbaik"
                    className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Alokasi Poin Prestasi (PP) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPoints}
                      onChange={(e) => setNewPoints(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#059669] focus:border-[#0F172A] focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#059669] font-mono shrink-0">PP</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Penyelenggara / Lembaga
                </label>
                <input
                  type="text"
                  value={newOrganizer}
                  onChange={(e) => setNewOrganizer(e.target.value)}
                  placeholder="Pesantren Fajrul Karim / Kemenag"
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Keterangan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Catatan prestasi, piagam, atau rincian pencapaian..."
                  className="w-full p-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsNewModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Prestasi (+PP)'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRESTASI */}
      {editingAchievement && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] font-headline">Edit Rekam Jejak Prestasi</h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-body">
                  Santri: <strong>{editingAchievement.studentName}</strong> ({editingAchievement.kamar})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAchievement(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Nama Prestasi / Kejuaraan *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Kategori Prestasi
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    <option value="Santri Teladan">Santri Teladan</option>
                    <option value="Tahfizh Al-Quran">Tahfizh Al-Quran</option>
                    <option value="Hafalan Terbanyak">Hafalan Terbanyak</option>
                    <option value="Setoran Terbanyak Bulan Ini">Setoran Terbanyak Bulan Ini</option>
                    <option value="Murojaah Terbanyak Bulan Ini">Murojaah Terbanyak Bulan Ini</option>
                    <option value="Akademik & Sekolah">Akademik & Sekolah</option>
                    <option value="Bahasa Arab & Inggris">Bahasa Arab & Inggris</option>
                    <option value="Kebersihan & Kerapian">Kebersihan & Kerapian</option>
                    <option value="Lomba Eksternal">Lomba Eksternal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Peringkat / Capaian
                  </label>
                  <input
                    type="text"
                    value={editRank}
                    onChange={(e) => setEditRank(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Alokasi Poin Prestasi (PP) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editPoints}
                      onChange={(e) => setEditPoints(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#059669] focus:border-[#0F172A] focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#059669] font-mono shrink-0">PP</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Penyelenggara / Lembaga
                </label>
                <input
                  type="text"
                  value={editOrganizer}
                  onChange={(e) => setEditOrganizer(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingAchievement(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingEdit}
                  className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: HAPUS PRESTASI CONFIRMATION */}
      {deletingAchievement && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-md rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0F172A] font-headline">Hapus Rekam Prestasi?</h3>
                  <p className="text-xs text-[#64748B] font-body leading-relaxed">
                    Rekam prestasi <strong>"{deletingAchievement.title}"</strong> milik santri <strong>{deletingAchievement.studentName}</strong> akan dihapus permanen.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Poin PP Terkait:</span>
                  <span className="font-bold text-[#EF4444] font-mono">-{deletingAchievement.points} PP</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Tanggal Terbit:</span>
                  <span className="font-medium text-[#0F172A]">{deletingAchievement.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeletingAchievement(null)}
                  disabled={isDeleting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus Prestasi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PREVIEW & EKSEKUSI OTOMASI PP BULANAN (21:00 WIB) */}
      {isAutoPreviewOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base font-bold text-[#0F172A] font-headline">Otomasi Poin Prestasi (PP) Akhir Bulan</h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                Jadwal Otomasi Resmi: <strong>{scheduleInfo.formattedSchedule}</strong> (Pukul 21:00 WIB)
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0">
              <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
                <p className="font-bold text-[#0F172A]">Ketentuan Sistem Poin PP Otomatis:</p>
                <ul className="list-disc list-inside text-[#64748B] space-y-1 text-[11px]">
                  <li><strong>Santri Teladan:</strong> Top 5 santri (0 PK + hafalan tertinggi) mendapat <strong>+25 PP</strong> (Juara 1) dan <strong>+20 PP</strong> (Juara 2-5).</li>
                  <li><strong>Hafalan Terbanyak:</strong> Top 5 hafalan juz tertinggi bagi santri proses aktif (&lt; 30 Juz, santri 30 Juz/Huffazh dikecualikan) mendapat <strong>+20 PP</strong>.</li>
                  <li><strong>Setoran Terbanyak Bulan Ini:</strong> Top 5 rekam setoran baru bulan ini mendapat <strong>+15 PP</strong>.</li>
                  <li><strong>Murojaah Terbanyak Bulan Ini:</strong> Top 5 rekam murojaah bulan ini mendapat <strong>+15 PP</strong>.</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-xs text-[#0F172A] mb-2 font-headline">
                  Daftar Santri Calon Penerima PP Bulan Ini ({monthlyPreviewAwards.length} Predikat):
                </p>

                <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase">
                      <tr>
                        <th className="p-2.5">Santri</th>
                        <th className="p-2.5">Kategori Predikat</th>
                        <th className="p-2.5">Peringkat</th>
                        <th className="p-2.5 text-right">Alokasi PP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {monthlyPreviewAwards.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-[#64748B]">
                            Belum ada santri yang memenuhi kriteria predikat bulan ini.
                          </td>
                        </tr>
                      ) : (
                        monthlyPreviewAwards.map((a, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-[#0F172A]">{a.studentName}</td>
                            <td className="p-2.5 text-[#64748B]">{a.category}</td>
                            <td className="p-2.5 text-[#64748B]">{a.rank}</td>
                            <td className="p-2.5 text-right font-bold text-[#059669] font-mono">+{a.points} PP</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#64748B]">
                  {executionStatus.lastExecutedDate ? `Terakhir dieksekusi: ${new Date(executionStatus.lastExecutedDate).toLocaleDateString('id-ID')}` : 'Belum dieksekusi untuk bulan ini.'}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAutoPreviewOpen(false)}
                  >
                    Tutup
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isExecutingAuto || monthlyPreviewAwards.length === 0}
                    onClick={handleExecuteAutoAward}
                    className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
                  >
                    {isExecutingAuto ? 'Mengeksekusi...' : '⚡ Jalankan Eksekusi PP Sekarang'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
