import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MoreHorizontal,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Scale,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ViolationRecord, SeverityLevel, PenaltyStatus } from '../../types';
import { Button } from '../ui/Button';
import { PillTabs, TabOption } from '../ui/PillTabs';
import { 
  updateUnifiedViolation, 
  deleteUnifiedViolation,
  getDeletedViolationIds,
  violationIdentity,
  SantriRecord
} from '../../lib/firestoreService';
import { gooeyToast } from 'goey-toast';
import { useLenisModalLock } from '../../lib/lenis';
import { RollingNumber } from '../modals/NewViolationModal';
import { getSeverityInfo, sliderFillPercent } from '../../lib/severityUtils';
import { CollectiveMahkamahView } from './CollectiveMahkamahView';

interface ViolationsViewProps {
  violations: ViolationRecord[];
  students?: SantriRecord[];
  onOpenNewViolationModal: () => void;
}

type ViolationFilter = 'all' | 'berat' | 'sedang' | 'ringan' | 'belum_dihukum';

// Running Text / Marquee Looping Component for Anti-Wrapping Table Cells
const RunningText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
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
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap min-w-0 max-w-full ${className}`}
      title={text}
    >
      <span
        ref={contentRef}
        style={
          isOverflowing
            ? ({
                '--scroll-offset': `-${overflowDistance}px`,
                animation: `running-ticker ${duration}s ease-in-out infinite alternate`,
              } as React.CSSProperties)
            : undefined
        }
        className={`inline-block whitespace-nowrap ${isOverflowing ? 'will-change-transform' : ''}`}
      >
        {text}
      </span>
    </div>
  );
};

// Helper untuk memisahkan tanggal menjadi dua baris: Nama Hari dan Tanggal Lengkap
const formatSplitDate = (dateStr: string): { dayName: string; formattedDate: string } => {
  if (!dateStr) return { dayName: 'Rabu', formattedDate: '26 Agustus 2026' };

  const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthMap: Record<string, number> = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  };

  let d: Date | null = null;
  const clean = dateStr.trim();
  const parts = clean.split(/\s+/);
  
  if (parts.length === 3 && monthMap[parts[1].toLowerCase()] !== undefined) {
    const day = parseInt(parts[0], 10);
    const month = monthMap[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    d = new Date(year, month, day);
  } else if (!isNaN(Date.parse(clean))) {
    d = new Date(clean);
  }

  if (d && !isNaN(d.getTime())) {
    const dayName = dayNames[d.getDay()];
    const formattedDate = `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    return { dayName, formattedDate };
  }

  return { dayName: 'Rabu', formattedDate: dateStr };
};

export const ViolationsView: React.FC<ViolationsViewProps> = ({
  violations,
  students = [],
  onOpenNewViolationModal,
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'collective-trial'>('list');
  const [filter, setFilter] = useState<ViolationFilter>(() => {
    try {
      return (localStorage.getItem('ostifak_violation_filter') as ViolationFilter) || 'all';
    } catch {
      return 'all';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ostifak_violation_filter', filter);
    } catch (e) {
      console.error('Error saving violation filter:', e);
    }
  }, [filter]);

  const [searchTerm, setSearchTerm] = useState('');

  // Local persistent state for deleted violations
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => getDeletedViolationIds());

  useEffect(() => {
    const handleStorageChange = () => {
      setDeletedIds(getDeletedViolationIds());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ostifak-violations-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ostifak-violations-changed', handleStorageChange);
    };
  }, []);

  // Fixed Floating Menu State (Unified for 3-dots button and right-click)
  const [activeMenu, setActiveMenu] = useState<{
    x: number;
    y: number;
    violation: ViolationRecord;
    type: 'dropdown' | 'contextmenu';
  } | null>(null);

  // Edit Modal & Delete Confirmation States
  const [editingViolation, setEditingViolation] = useState<ViolationRecord | null>(null);
  const [editViolationText, setEditViolationText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPoints, setEditPoints] = useState<number>(10);
  const [editPenaltyDescription, setEditPenaltyDescription] = useState('');
  const [editStatus, setEditStatus] = useState<PenaltyStatus>('belum_dihukum');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deletingViolation, setDeletingViolation] = useState<ViolationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useLenisModalLock(!!editingViolation || !!deletingViolation);


  const editSeverityInfo = getSeverityInfo(editPoints);

  // Close floating menu on window scroll or resize
  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => {
      setActiveMenu(null);
    };
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenu]);

  // Global Escape Key Listener for ViolationsView
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeMenu) {
          setActiveMenu(null);
          return;
        }
        if (editingViolation) {
          setEditingViolation(null);
          return;
        }
        if (deletingViolation) {
          setDeletingViolation(null);
          return;
        }
      }
    };

    const handleCustomEscape = () => {
      setActiveMenu(null);
      setEditingViolation(null);
      setDeletingViolation(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ostifak-escape-pressed', handleCustomEscape);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [activeMenu, editingViolation, deletingViolation]);

  // Filter out permanently & optimistically deleted items
  const visibleViolations = violations.filter(
    (v) => !deletedIds.has(v.id) && !deletedIds.has(violationIdentity(v))
  );

  // Filter Tabs
  const filterTabs: TabOption<ViolationFilter>[] = [
    { id: 'all', label: 'Semua Kasus' },
    { 
      id: 'berat', 
      label: 'Sidang Mahkamah (Berat)', 
      count: visibleViolations.filter(v => {
        const s = getSeverityInfo(v.points).severity;
        return s === 'berat' || s === 'sangat_berat';
      }).length 
    },
    { 
      id: 'sedang', 
      label: 'Pelanggaran Sedang',
      count: visibleViolations.filter(v => getSeverityInfo(v.points).severity === 'sedang').length 
    },
    { 
      id: 'ringan', 
      label: 'Pelanggaran Ringan',
      count: visibleViolations.filter(v => getSeverityInfo(v.points).severity === 'ringan').length 
    },
    { id: 'belum_dihukum', label: 'Belum Eksekusi', count: visibleViolations.filter(v => v.status === 'belum_dihukum').length },
  ];

  const filteredViolations = visibleViolations.filter((v) => {
    const matchesSearch = 
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.nis.includes(searchTerm) ||
      v.kamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violation.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const currentSev = getSeverityInfo(v.points).severity;

    if (filter === 'berat') return currentSev === 'berat' || currentSev === 'sangat_berat';
    if (filter === 'sedang') return currentSev === 'sedang';
    if (filter === 'ringan') return currentSev === 'ringan';
    if (filter === 'belum_dihukum') return v.status === 'belum_dihukum';

    return true;
  });

  // Action 1: Toggle Status (Tandai Selesai / Tandai Belum Selesai)
  const handleToggleStatus = async (record: ViolationRecord) => {
    setActiveMenu(null);

    const isCurrentlyDone = record.status === 'selesai';
    const newStatus: PenaltyStatus = isCurrentlyDone ? 'belum_dihukum' : 'selesai';

    if (isCurrentlyDone) {
      gooeyToast.info(`Status hukuman ${record.studentName} ditandai belum selesai.`);
    } else {
      gooeyToast.success(`Status hukuman ${record.studentName} berhasil ditandai selesai!`);
    }

    try {
      await updateUnifiedViolation(record, { status: newStatus }, students);
    } catch (err) {
      console.error('Failed to toggle violation status:', err);
    }
  };

  // Action 2: Open Edit Modal
  const handleOpenEdit = (record: ViolationRecord) => {
    setActiveMenu(null);
    setEditingViolation(record);
    setEditViolationText(record.violation);
    setEditCategory(record.category || 'Disiplin & Ibadah');
    setEditPoints(record.points || 10);
    setEditPenaltyDescription(record.penaltyDescription || '');
    setEditStatus(record.status || 'belum_dihukum');
  };

  // Action 3: Open Delete Confirmation
  const handleOpenDelete = (record: ViolationRecord) => {
    setActiveMenu(null);
    setDeletingViolation(record);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingViolation) return;
    if (isSavingEdit) return;

    setIsSavingEdit(true);
    const target = editingViolation;
    const updates: Partial<ViolationRecord> = {
      violation: editViolationText.trim() || target.violation,
      category: editCategory,
      points: Number(editPoints),
      severity: editSeverityInfo.severity,
      penaltyDescription: editPenaltyDescription.trim(),
      status: editStatus,
    };

    setEditingViolation(null);
    gooeyToast.success(`Perubahan berkas ${target.studentName} berhasil disimpan!`);

    try {
      await updateUnifiedViolation(target, updates, students);
    } catch (err) {
      console.error('Failed to sync edit violation:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Confirm Delete (Fixed, Optimistic & Persistent)
  const handleConfirmDelete = async () => {
    if (!deletingViolation) return;
    if (isDeleting) return;

    setIsDeleting(true);
    const target = deletingViolation;
    const targetIdentity = violationIdentity(target);

    // Immediate UI feedback
    setDeletedIds((prev) => new Set([...prev, target.id, targetIdentity]));
    setActiveMenu(null);
    setDeletingViolation(null);
    gooeyToast.success(`Catatan pelanggaran ${target.studentName} berhasil dihapus.`);

    try {
      await deleteUnifiedViolation(target, students);
    } catch (err) {
      console.error('Failed to delete violation record:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle 3-Dots Button Click with Precise Coordinate Computation
  const handleOpenDropdown = (e: React.MouseEvent<HTMLButtonElement>, record: ViolationRecord) => {
    e.stopPropagation();
    if (activeMenu?.violation.id === record.id && activeMenu.type === 'dropdown') {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 160;
    
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
      violation: record,
      type: 'dropdown',
    });
  };

  // Right-Click Context Menu Trigger with Viewport Boundary Guard
  const handleRowContextMenu = (e: React.MouseEvent, record: ViolationRecord) => {
    e.preventDefault();
    const menuWidth = 220;
    const menuHeight = 160;

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
      violation: record,
      type: 'contextmenu',
    });
  };

  if (currentView === 'collective-trial') {
    return (
      <CollectiveMahkamahView
        students={students}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header (Unboxed, Zero Icon Policy) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
            Kedisiplinan, Poin & Sidang Mahkamah
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">
            Pencatatan kasus kedisiplinan objektif dengan sistem bobot poin dan konsekuensi edukatif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentView('collective-trial')}
            className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Sidang Mahkamah Kolektif
          </Button>

          <Button
            variant="destructive"
            size="md"
            onClick={onOpenNewViolationModal}
            className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
          >
            + Input Kasus Pelanggaran
          </Button>
        </div>
      </div>

      {/* 4 Summary Metrics (Unboxed 1-Row on Desktop, Symmetrical 2x2 Grid on Mobile with Dividers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#E2E8F0] overflow-hidden">
        {/* Metric 1 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Total Kasus
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {visibleViolations.length}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 sm:px-5 sm:py-4 md:border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Sidang Mahkamah (Berat)
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#EF4444] tracking-tight font-headline">
              {visibleViolations.filter(v => {
                const s = getSeverityInfo(v.points).severity;
                return s === 'berat' || s === 'sangat_berat';
              }).length}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Pelanggaran Sedang
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight font-headline">
              {visibleViolations.filter(v => getSeverityInfo(v.points).severity === 'sedang').length}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Belum Eksekusi
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {visibleViolations.filter(v => v.status === 'belum_dihukum').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <PillTabs
          tabs={filterTabs}
          activeTab={filter}
          onChange={(tab) => setFilter(tab)}
        />

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter nama, NIS, atau kamar..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] font-body"
          />
        </div>
      </div>

      {/* Main Table (Unboxed Clean Flat Table) */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] font-headline uppercase tracking-[0.5px]">
            <tr>
              <th className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap">TANGGAL</th>
              <th className="p-3.5 w-44 min-w-[140px] max-w-[180px] whitespace-nowrap">SANTRI & KAMAR</th>
              <th className="p-3.5 min-w-[180px] max-w-[280px] sm:max-w-[340px] whitespace-nowrap">KASUS PELANGGARAN</th>
              <th className="p-3.5 w-36 min-w-[120px] max-w-[150px] whitespace-nowrap">KATEGORI</th>
              <th className="p-3.5 w-24 min-w-[70px] max-w-[80px] whitespace-nowrap">POIN</th>
              <th className="p-3.5 min-w-[160px] max-w-[240px] whitespace-nowrap">BENTUK TAKZIR / HUKUMAN</th>
              <th className="p-3.5 w-28 min-w-[90px] max-w-[110px] text-center whitespace-nowrap">STATUS</th>
              <th className="p-3.5 w-20 min-w-[65px] max-w-[80px] text-right pr-4 whitespace-nowrap">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredViolations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#64748B] font-body">
                  <p className="font-semibold text-xs text-[#0F172A] font-headline">Belum Ada Catatan Pelanggaran</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5 font-body">Klik "Input Kasus Pelanggaran" untuk mencatat pelanggaran santri.</p>
                </td>
              </tr>
            ) : (
              filteredViolations.map((v) => {
                const dateObj = formatSplitDate(v.date);
                const sevInfo = getSeverityInfo(v.points);
                return (
                  <tr 
                    key={v.id} 
                    onContextMenu={(e) => handleRowContextMenu(e, v)}
                    className={`h-14 transition-colors group select-none cursor-default ${
                      activeMenu?.violation.id === v.id ? 'bg-slate-100/80' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {/* 1. Kolom Tanggal Dua Baris (Nama Hari & Tanggal Lengkap) */}
                    <td className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap align-middle">
                      <p className="font-bold text-xs text-[#0F172A] font-headline leading-tight whitespace-nowrap">
                        {dateObj.dayName}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-body mt-0.5 leading-tight whitespace-nowrap">
                        {dateObj.formattedDate}
                      </p>
                    </td>

                    {/* 2. Kolom Santri & Kamar (Anti-wrapping) */}
                    <td className="p-3.5 w-44 min-w-[140px] max-w-[180px] align-middle overflow-hidden">
                      <RunningText text={v.studentName} className="font-bold text-[#0F172A] font-headline" />
                      <RunningText text={`NIS: ${v.nis} • ${v.kamar}`} className="text-[11px] text-[#64748B] mt-0.5" />
                    </td>

                    {/* 3. Kolom Kasus Pelanggaran (Anti-wrapping) */}
                    <td className="p-3.5 min-w-[180px] max-w-[280px] sm:max-w-[340px] align-middle overflow-hidden">
                      <RunningText text={v.violation} className="font-semibold text-[#0F172A]" />
                      <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${sevInfo.colorClass}`}>
                          Tingkat: {sevInfo.label}
                        </span>
                      </div>
                    </td>

                    {/* 4. Kolom Kategori */}
                    <td className="p-3.5 w-36 min-w-[120px] max-w-[150px] align-middle overflow-hidden">
                      <RunningText text={v.category} className="text-[#64748B] font-body" />
                    </td>

                    {/* 5. Kolom Poin */}
                    <td className="p-3.5 w-24 min-w-[70px] max-w-[80px] font-bold text-[#EF4444] whitespace-nowrap align-middle font-mono">
                      +{v.points} PK
                    </td>

                    {/* 6. Kolom Bentuk Takzir */}
                    <td className="p-3.5 min-w-[160px] max-w-[240px] align-middle overflow-hidden">
                      <RunningText text={v.penaltyDescription || '-'} className="text-[#0F172A] font-body" />
                    </td>

                    {/* 7. Kolom Status (Ikon Murni Tanpa Teks) */}
                    <td className="p-3.5 w-28 min-w-[90px] max-w-[110px] text-center whitespace-nowrap align-middle">
                      {v.status === 'selesai' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] mx-auto" title="Selesai" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 mx-auto" title="Dalam Proses" />
                      )}
                    </td>

                    {/* 8. Kolom Aksi */}
                    <td className="p-3.5 w-20 min-w-[65px] max-w-[80px] text-right pr-4 whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDropdown(e, v)}
                        className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors ml-auto cursor-pointer active:scale-95 ${
                          activeMenu?.violation.id === v.id && activeMenu.type === 'dropdown'
                            ? 'bg-slate-200 text-slate-900'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Menu Opsi Kasus"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Fixed Dropdown & Context Menu with Fullscreen Transparent Backdrop */}
      {activeMenu && (
        <>
          {/* Transparent Backdrop (Catch all clicks outside to close cleanly) */}
          <div
            className="fixed inset-0 z-40 bg-transparent pointer-events-auto cursor-default"
            onClick={() => setActiveMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setActiveMenu(null);
            }}
          />

          {/* Floating Context Menu Popover (Auto-Width & Whitespace Nowrap) */}
          <div
            style={{ top: `${activeMenu.y}px`, left: `${activeMenu.x}px` }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 min-w-max bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 space-y-0.5 text-xs text-left animate-in fade-in zoom-in-95 font-body pointer-events-auto select-none"
          >
            {/* Opsi 1: Dinamika Status (Tandai Selesai / Tandai Belum Selesai) */}
            {activeMenu.violation.status === 'selesai' ? (
              <button
                type="button"
                onClick={() => handleToggleStatus(activeMenu.violation)}
                className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Tandai Belum Selesai</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleStatus(activeMenu.violation)}
                className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">Tandai Selesai</span>
              </button>
            )}

            {/* Opsi 2: Edit Kasus */}
            <button
              type="button"
              onClick={() => handleOpenEdit(activeMenu.violation)}
              className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Pencil className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="whitespace-nowrap">Edit Kasus</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Opsi 3: Hapus Kasus */}
            <button
              type="button"
              onClick={() => handleOpenDelete(activeMenu.violation)}
              className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="whitespace-nowrap">Hapus Kasus</span>
            </button>
          </div>
        </>
      )}

      {/* MODAL: EDIT KASUS PELANGGARAN */}
      {editingViolation && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            {/* Header Modal (Clean Flat Header, Zero Icon Policy) */}
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A]">Edit Berkas Pelanggaran</h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                Santri: <span className="font-semibold text-[#0F172A]">{editingViolation.studentName}</span> (NIS: {editingViolation.nis} • {editingViolation.kamar})
              </p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="p-6 sm:p-8 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-8">
              
              {/* Row 1: Tindakan & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                    Tindakan Pelanggaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={editViolationText}
                    onChange={(e) => setEditViolationText(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                    Kategori Pelanggaran *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Disiplin & Ibadah">Disiplin & Ibadah</option>
                    <option value="Bahasa & Komunikasi">Bahasa & Komunikasi</option>
                    <option value="Kebersihan & Kerapihan">Kebersihan & Kerapihan</option>
                    <option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
                    <option value="Etika & Akhlaq">Etika & Akhlaq</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Range Slider Bobot Poin & Kategori Plain Text */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0F172A] font-headline">
                    Tingkat Keparahan Kasus & Bobot Poin
                  </label>

                  {/* Dynamic Jackpot Rolling Number & Plain Text Category */}
                  <div className="flex items-center gap-1.5 text-xs font-bold font-headline">
                    <span className="text-[#0F172A] flex items-center font-mono">
                      +<RollingNumber value={editPoints} className="text-sm font-bold text-[#0F172A] mx-0.5" /> PK
                    </span>
                    <span className="text-[#64748B]">•</span>
                    <span className={getSeverityInfo(editPoints).colorClass}>
                      {getSeverityInfo(editPoints).label}
                    </span>
                  </div>
                </div>

                {/* Interactive Smooth Slider */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#0F172A]"
                    style={{
                      background: `linear-gradient(to right, #0F172A 0%, #0F172A ${sliderFillPercent(editPoints)}%, #E2E8F0 ${sliderFillPercent(editPoints)}%, #E2E8F0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-[#64748B] font-body mt-1">
                    <span>1 (Ringan)</span>
                    <span>13 (Sedang)</span>
                    <span>26 (Berat)</span>
                    <span>39+ (Sangat Berat)</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Status Eksekusi Hukuman */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Status Eksekusi Hukuman
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['belum_dihukum', 'dalam_proses', 'selesai'] as PenaltyStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`h-9 px-3 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        editStatus === st
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                          : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      <span className="capitalize">{st.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Rekomendasi Hukuman / Takzir */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Rekomendasi Hukuman / Takzir
                </label>
                <textarea
                  rows={2}
                  value={editPenaltyDescription}
                  onChange={(e) => setEditPenaltyDescription(e.target.value)}
                  placeholder="Bentuk konsekuensi edukatif..."
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingViolation(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSavingEdit}>
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS PELANGGARAN */}
      {deletingViolation && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-white w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base font-bold text-[#0F172A] font-headline">Hapus Catatan Pelanggaran?</h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">Konfirmasi pembatalan atau penghapusan berkas kasus</p>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-6">
              <p className="text-[#334155] leading-relaxed">
                Apakah Anda yakin ingin menghapus catatan pelanggaran <strong>"{deletingViolation.violation}"</strong> atas nama <strong>{deletingViolation.studentName}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                <p>Santri: <strong className="text-[#0F172A]">{deletingViolation.studentName}</strong> ({deletingViolation.kamar})</p>
                <p>Bobot Poin: <strong className="text-rose-600">+{deletingViolation.points} PK</strong></p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeletingViolation(null)}
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
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : 'Ya, Hapus Catatan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
