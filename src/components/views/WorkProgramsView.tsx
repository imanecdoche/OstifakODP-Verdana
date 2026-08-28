import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkProgram, DivisionId } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PillTabs, TabOption } from '../ui/PillTabs';
import { ActionSheet } from '../ui/ActionSheet';
import { gooeyToast } from '../../lib/toast';
import { mockDivisions } from '../../data/mockData';
import { updateProposalRecord, deleteProposalRecord } from '../../lib/firestoreService';
import { recordSessionAction } from '../../lib/sessionLogService';

interface WorkProgramsViewProps {
  workPrograms: WorkProgram[];
  onOpenNewProgramModal: () => void;
}

type ProgramFilter = 'all' | 'dalam_proses' | 'menunggu_persetujuan' | 'selesai' | 'ditolak';

interface ActiveMenuState {
  program: WorkProgram;
  x: number;
  y: number;
  type: 'dropdown' | 'contextmenu';
}

// Helper: Parse budget string to numeric total
const parseBudgetNumber = (rawBudget?: string | number): number => {
  if (!rawBudget) return 0;
  if (typeof rawBudget === 'number') return rawBudget;
  const digits = rawBudget.replace(/[^\d]/g, '');
  return parseInt(digits, 10) || 0;
};

// Helper: Format number with Indonesian locale separator
const formatNumberId = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(Math.round(num));
};

// Helper: Format replacement budget ratio [progress berjalan] / [total]
export const formatBudgetRatio = (budget?: string | number, progress: number = 0): string => {
  const total = parseBudgetNumber(budget);
  if (total <= 0) {
    return '0 / 0';
  }
  const current = (total * Math.min(100, Math.max(0, progress))) / 100;
  return `${formatNumberId(current)} / ${formatNumberId(total)}`;
};

// Helper: Calculate countdown H-N based on 26 Agustus 2026
export const calculateHMinus = (targetDateStr?: string): string => {
  if (!targetDateStr || targetDateStr === '-') return 'H-0';

  // Base date: 26 Agustus 2026
  const baseDate = new Date(2026, 7, 26, 0, 0, 0, 0);

  const monthMap: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4, may: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, agu: 7, agt: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    oktober: 9, okt: 9, oct: 9,
    november: 10, nov: 10,
    desember: 11, des: 11, dec: 11,
  };

  let targetDate: Date | null = null;

  // Handle numeric format DD/MM/YYYY or YYYY-MM-DD
  if (targetDateStr.includes('/') || (targetDateStr.includes('-') && !targetDateStr.startsWith('H-'))) {
    const parts = targetDateStr.split(/[/-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        targetDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
  }

  // Handle Indonesian string format e.g. "29 Agustus 2026"
  if (!targetDate || isNaN(targetDate.getTime())) {
    const cleaned = targetDateStr.trim().replace(/,/g, '');
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) {
      const day = parseInt(parts[0], 10);
      const monthKey = parts[1].toLowerCase();
      const year = parts.length >= 3 ? parseInt(parts[2], 10) : 2026;
      const monthIdx = monthMap[monthKey];
      if (!isNaN(day) && monthIdx !== undefined) {
        targetDate = new Date(year, monthIdx, day);
      }
    }
  }

  // Fallback to standard parse
  if (!targetDate || isNaN(targetDate.getTime())) {
    const parsed = Date.parse(targetDateStr);
    if (!isNaN(parsed)) {
      targetDate = new Date(parsed);
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    return 'H-0';
  }

  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const baseMidnight = baseDate.getTime();

  const diffMs = targetMidnight - baseMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `H-${diffDays}`;
  } else if (diffDays === 0) {
    return 'H-0';
  } else {
    return `H+${Math.abs(diffDays)}`;
  }
};

// Custom SVG Animated Clock Icon (Jarum Berputar Dinamis)
export const AnimatedProcessClockIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} text-amber-500 flex-shrink-0`}
    >
      <style>{`
        @keyframes clock-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Lingkaran Luar Jam */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Titik Poros Tengah */}
      <circle
        cx="12"
        cy="12"
        r="1.25"
        fill="currentColor"
      />
      {/* Jarum Jam Pendek (12s Putaran Lambat) */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 12px',
          animation: 'clock-spin 12s linear infinite',
        }}
      />
      {/* Jarum Menit Panjang (3s Putaran Cepat) */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 12px',
          animation: 'clock-spin 3s linear infinite',
        }}
      />
    </svg>
  );
};

// Helper: Single status icon (Ditolak: Red X, Selesai: Green Check, Proses: Animated Clock)
export const renderProgramStatusIcon = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'ditolak' || s === 'rejected') {
    return <X className="w-5 h-5 text-red-600 stroke-[2.5]" />;
  }
  if (s === 'selesai' || s === 'disetujui' || s === 'approved' || s === 'done') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
  }
  return <AnimatedProcessClockIcon className="w-5 h-5" />;
};

export const WorkProgramsView: React.FC<WorkProgramsViewProps> = ({
  workPrograms,
  onOpenNewProgramModal,
}) => {
  const [filter, setFilter] = useState<ProgramFilter>(() => {
    try {
      return (localStorage.getItem('ostifak_program_filter') as ProgramFilter) || 'all';
    } catch {
      return 'all';
    }
  });

  // Context Menu & Three-dot Popover State
  const [activeMenu, setActiveMenu] = useState<ActiveMenuState | null>(null);
  const [editingProgram, setEditingProgram] = useState<WorkProgram | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<WorkProgram | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Edit Form Fields
  const [editTitle, setEditTitle] = useState('');
  const [editDivisionId, setEditDivisionId] = useState<DivisionId>('keamanan');
  const [editStatus, setEditStatus] = useState<WorkProgram['status']>('dalam_proses');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editPic, setEditPic] = useState('');

  // Mobile viewport detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close context menu on scroll / resize / click outside
  useEffect(() => {
    if (!activeMenu) return;
    const handleDismiss = () => setActiveMenu(null);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [activeMenu]);

  // Handle Three-dot button click
  const handleDropdownClick = (e: React.MouseEvent, prog: WorkProgram) => {
    e.stopPropagation();
    e.preventDefault();

    if (activeMenu?.program.id === prog.id && activeMenu.type === 'dropdown') {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 110;

    let posX = rect.right - menuWidth;
    let posY = rect.bottom + 6;

    if (posX < 10) posX = 10;
    if (posX + menuWidth > window.innerWidth - 10) {
      posX = window.innerWidth - menuWidth - 10;
    }

    if (posY + menuHeight > window.innerHeight - 10) {
      posY = rect.top - menuHeight - 6;
    }

    setActiveMenu({
      program: prog,
      x: posX,
      y: posY,
      type: 'dropdown',
    });
  };

  // Handle Right-click Context Menu
  const handleCardContextMenu = (e: React.MouseEvent, prog: WorkProgram) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 190;
    const menuHeight = 110;

    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuWidth > window.innerWidth - 10) {
      posX = window.innerWidth - menuWidth - 10;
    }
    if (posY + menuHeight > window.innerHeight - 10) {
      posY = window.innerHeight - menuHeight - 10;
    }

    setActiveMenu({
      program: prog,
      x: posX,
      y: posY,
      type: 'contextmenu',
    });
  };

  // Open Edit Form
  const handleOpenEdit = (prog: WorkProgram) => {
    setActiveMenu(null);
    setEditingProgram(prog);
    setEditTitle(prog.title);
    setEditDivisionId((prog.divisionId as DivisionId) || 'keamanan');
    setEditStatus(prog.status);
    setEditProgress(prog.progress || 0);
    setEditTargetDate(prog.targetDate || '');
    setEditBudget(prog.budget || '');
    setEditPic(prog.pic || '');
  };

  // Open Delete Confirmation
  const handleOpenDelete = (prog: WorkProgram) => {
    setActiveMenu(null);
    setDeletingProgram(prog);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram || !editTitle) return;

    setIsSavingEdit(true);
    try {
      const div = mockDivisions.find((d) => d.id === editDivisionId);
      const updates: Partial<WorkProgram> = {
        title: editTitle,
        divisionId: editDivisionId,
        divisionName: div ? div.name : editingProgram.divisionName,
        status: editStatus,
        progress: Number(editProgress) || 0,
        targetDate: editTargetDate,
        budget: editBudget,
        pic: editPic,
      };

      await updateProposalRecord(editingProgram.id, updates);
      recordSessionAction(
        'Program Kerja & Proposal',
        'Edit Proposal',
        `Memperbarui program: ${editTitle}`
      );
      gooeyToast.success('Program Kerja Berhasil Diperbarui', {
        description: `${editTitle} telah disimpan.`,
      });
      setEditingProgram(null);
    } catch (err) {
      console.error('Error saving program edit:', err);
      gooeyToast.error('Gagal Menyimpan Perubahan', {
        description: 'Terjadi kesalahan saat memperbarui program kerja.',
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProgram) return;

    setIsDeleting(true);
    try {
      await deleteProposalRecord(deletingProgram.id);
      recordSessionAction(
        'Program Kerja & Proposal',
        'Hapus Proposal',
        `Menghapus program: ${deletingProgram.title}`
      );
      gooeyToast.info('Proposal Dihapus', {
        description: `${deletingProgram.title} berhasil dihapus.`,
      });
      setDeletingProgram(null);
    } catch (err) {
      console.error('Error deleting program:', err);
      gooeyToast.error('Gagal Menghapus Proposal', {
        description: 'Terjadi kesalahan saat menghapus data program kerja.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('ostifak_program_filter', filter);
    } catch (e) {
      console.error('Error saving program filter:', e);
    }
  }, [filter]);

  const filterTabs: TabOption<ProgramFilter>[] = [
    { id: 'all', label: 'Semua Proposal' },
    { id: 'dalam_proses', label: 'Dalam Pelaksanaan' },
    { id: 'menunggu_persetujuan', label: 'Menunggu Persetujuan Pembina', count: workPrograms.filter(p => p.status === 'menunggu_persetujuan').length },
    { id: 'selesai', label: 'Selesai LPJ' },
  ];

  const filteredPrograms = workPrograms.filter((p) => {
    if (filter === 'dalam_proses') return p.status === 'dalam_proses';
    if (filter === 'menunggu_persetujuan') return p.status === 'menunggu_persetujuan';
    if (filter === 'selesai') return p.status === 'selesai';
    if (filter === 'ditolak') return (p.status as string) === 'ditolak';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header (Unboxed, Zero Icon Policy) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
            Program Kerja & Proposal Kegiatan
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">
            Transparansi pelaksanaan program kerja 9 divisi, pencairan anggaran, dan laporan LPJ.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenNewProgramModal}
          className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
        >
          + Ajukan Proposal Baru
        </Button>
      </div>

      {/* 4 Summary Metrics (Unboxed 1-Row on Desktop, Symmetrical 2x2 Grid on Mobile with Dividers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#E2E8F0] overflow-hidden">
        {/* Metric 1 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Total Proposal
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {workPrograms.length}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 sm:px-5 sm:py-4 md:border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Dalam Pelaksanaan
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {workPrograms.filter(p => p.status === 'dalam_proses').length}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Menunggu Persetujuan
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight font-headline">
              {workPrograms.filter(p => p.status === 'menunggu_persetujuan').length}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Selesai LPJ
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight font-headline">
              {workPrograms.filter(p => p.status === 'selesai').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <PillTabs
        tabs={filterTabs}
        activeTab={filter}
        onChange={(tab) => setFilter(tab)}
      />

      {/* Cards Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="py-14 text-center space-y-1.5">
          <h3 className="text-sm font-bold text-[#0F172A] font-headline">Belum Ada Proposal Terdaftar</h3>
          <p className="text-xs text-[#64748B] font-body">
            Klik "Ajukan Proposal Baru" untuk mengajukan rencana program kegiatan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((p) => (
            <Card 
              key={p.id} 
              variant="default" 
              onContextMenu={(e) => handleCardContextMenu(e, p)}
              className={`p-5 space-y-4 hoverable bg-white border rounded-xl relative transition-all duration-200 cursor-context-menu ${
                activeMenu?.program.id === p.id ? 'border-[#0F172A] ring-1 ring-[#0F172A]/20' : 'border-[#E2E8F0]'
              }`}
            >
              {/* 1. Header Card: Nama Program, Nama Divisi + Ikon Status & Tombol Titik Tiga */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-[#0F172A] leading-snug font-headline line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-900 mt-1 font-body">
                    {p.divisionName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  {renderProgramStatusIcon(p.status)}
                  <button
                    type="button"
                    onClick={(e) => handleDropdownClick(e, p)}
                    aria-label="Menu Aksi"
                    className="p-1 rounded-md text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Progress Bar Tanpa Kontainer & Format Anggaran Pengganti */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#059669] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, p.progress || 0))}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-slate-800 font-body">
                  {formatBudgetRatio(p.budget, p.progress)}
                </div>
              </div>

              {/* 4. Target Waktu & Countdown H-N (Tanpa Divider) */}
              <div className="flex items-center justify-between text-xs pt-1 font-body">
                <span className="font-medium text-slate-600">{p.targetDate}</span>
                <span className="font-bold text-slate-900 font-headline">{calculateHMinus(p.targetDate)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 1. Mobile Bottom Action Sheet */}
      <ActionSheet
        isOpen={isMobile && !!activeMenu}
        onClose={() => setActiveMenu(null)}
        title={activeMenu?.program.title}
        subtitle={activeMenu ? `${activeMenu.program.divisionName} • ${activeMenu.program.targetDate}` : undefined}
        actions={activeMenu ? [
          {
            label: 'Edit Proposal / Program Kerja',
            icon: <Pencil className="w-5 h-5 text-black" />,
            onClick: () => handleOpenEdit(activeMenu.program),
          },
          {
            label: 'Hapus Data',
            icon: <Trash2 className="w-5 h-5 text-black" />,
            isDestructive: true,
            onClick: () => handleOpenDelete(activeMenu.program),
          },
        ] : []}
      />

      {/* 2. Desktop Floating Context & Dropdown Menu */}
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
            className="fixed z-50 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 text-xs text-left animate-in fade-in zoom-in-95 font-body pointer-events-auto select-none"
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <p className="font-bold text-[11px] text-slate-800 truncate font-headline">
                {activeMenu.program.title}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {activeMenu.program.divisionName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(activeMenu.program)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <Pencil className="w-3.5 h-3.5 text-black" />
              <span>Edit Proposal / Program Kerja</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenDelete(activeMenu.program)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Data</span>
            </button>
          </div>
        </>
      )}

      {/* MODAL: EDIT PROPOSAL / PROGRAM KERJA */}
      <AnimatePresence>
        {editingProgram && (
          <div data-lenis-prevent className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden pointer-events-auto font-body">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setEditingProgram(null)}
              className="fixed inset-0 z-40 bg-black/50 cursor-default"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 320,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white w-full max-w-xl max-h-[88dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-xl shadow-[0_-10px_40px_rgba(15,23,42,0.18)] sm:shadow-[0_20px_60px_rgba(15,23,42,0.25)] border-t sm:border border-[#E2E8F0] overflow-hidden flex flex-col z-10"
            >
              {/* Mobile Top Drag Handle */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#F8FAFC]">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Header Modal */}
              <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
                <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A]">
                  Edit Proposal / Program Kerja
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-body">
                  Perbarui rencana kerja, progress pelaksanaan, dan rincian anggaran.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0">
                <div className="p-6 sm:p-8 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-8">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                      Judul Proposal / Kegiatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                        Divisi Pengaju *
                      </label>
                      <select
                        value={editDivisionId}
                        onChange={(e) => setEditDivisionId(e.target.value as DivisionId)}
                        className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                      >
                        {mockDivisions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                        Status Pelaksanaan *
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as WorkProgram['status'])}
                        className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                      >
                        <option value="menunggu_persetujuan">Menunggu Persetujuan Pembina</option>
                        <option value="dalam_proses">Dalam Pelaksanaan</option>
                        <option value="selesai">Selesai LPJ</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                        Progress Pelaksanaan ({editProgress}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={editProgress}
                        onChange={(e) => setEditProgress(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#059669] mt-3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                        Target Tanggal Pelaksanaan
                      </label>
                      <input
                        type="text"
                        value={editTargetDate}
                        onChange={(e) => setEditTargetDate(e.target.value)}
                        placeholder="Contoh: 20 Agu 2026"
                        className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                        Rencana Anggaran (Budget)
                      </label>
                      <input
                        type="text"
                        value={editBudget}
                        onChange={(e) => setEditBudget(e.target.value)}
                        placeholder="Contoh: Rp 1.500.000"
                        className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                        Penanggung Jawab (PIC)
                      </label>
                      <input
                        type="text"
                        value={editPic}
                        onChange={(e) => setEditPic(e.target.value)}
                        placeholder="Nama penanggung jawab"
                        className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-end gap-2.5 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingProgram(null)}
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
                    {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: KONFIRMASI HAPUS PROPOSAL */}
      <AnimatePresence>
        {deletingProgram && (
          <div data-lenis-prevent className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden pointer-events-auto font-body">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setDeletingProgram(null)}
              className="fixed inset-0 z-40 bg-black/50 cursor-default"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 320,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white w-full max-w-md max-h-[88dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-xl shadow-[0_-10px_40px_rgba(15,23,42,0.18)] sm:shadow-[0_20px_60px_rgba(15,23,42,0.25)] border-t sm:border border-[#E2E8F0] overflow-hidden flex flex-col z-10"
            >
              {/* Mobile Top Drag Handle */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#F8FAFC]">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
                <h3 className="text-base font-bold text-[#0F172A] font-headline">Hapus Proposal Program Kerja?</h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-body">Konfirmasi pembatalan atau penghapusan proposal</p>
              </div>

              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-6">
                <p className="text-[#334155] leading-relaxed">
                  Apakah Anda yakin ingin menghapus proposal program <strong>"{deletingProgram.title}"</strong> dari divisi <strong>{deletingProgram.divisionName}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                  <p>Divisi: <strong className="text-[#0F172A]">{deletingProgram.divisionName}</strong></p>
                  <p>Target Waktu: <strong className="text-[#0F172A]">{deletingProgram.targetDate}</strong></p>
                  <p>Anggaran: <strong className="text-[#0F172A]">{deletingProgram.budget || '-'}</strong></p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 pb-8 sm:pb-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setDeletingProgram(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : 'Ya, Hapus Data'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
