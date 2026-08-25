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

interface ViolationsViewProps {
  violations: ViolationRecord[];
  students?: SantriRecord[];
  onOpenNewViolationModal: () => void;
}

type ViolationFilter = 'all' | 'berat' | 'sedang' | 'ringan' | 'belum_dihukum';

export const ViolationsView: React.FC<ViolationsViewProps> = ({
  violations,
  students = [],
  onOpenNewViolationModal,
}) => {
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

  // Dynamic Severity & Category Mapping (1-12 Ringan, 13-25 Sedang, 26-38 Berat, 39-50 Sangat Berat)
  const getSeverityInfo = (pts: number) => {
    if (pts <= 12) {
      return {
        label: 'Ringan',
        severity: 'ringan' as SeverityLevel,
        colorClass: 'text-emerald-700',
        accentColor: '#059669',
      };
    }
    if (pts <= 25) {
      return {
        label: 'Sedang',
        severity: 'sedang' as SeverityLevel,
        colorClass: 'text-amber-700',
        accentColor: '#D97706',
      };
    }
    if (pts <= 38) {
      return {
        label: 'Berat',
        severity: 'berat' as SeverityLevel,
        colorClass: 'text-rose-600',
        accentColor: '#E11D48',
      };
    }
    return {
      label: 'Sangat Berat',
      severity: 'sangat_berat' as SeverityLevel,
      colorClass: 'text-red-700',
      accentColor: '#DC2626',
    };
  };

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

  // Filter out permanently & optimistically deleted items
  const visibleViolations = violations.filter(
    (v) => !deletedIds.has(v.id) && !deletedIds.has(violationIdentity(v))
  );

  // Filter Tabs
  const filterTabs: TabOption<ViolationFilter>[] = [
    { id: 'all', label: 'Semua Kasus' },
    { id: 'berat', label: 'Sidang Mahkamah (Berat)', count: visibleViolations.filter(v => v.severity === 'berat' || v.severity === 'sangat_berat').length },
    { id: 'sedang', label: 'Pelanggaran Sedang' },
    { id: 'ringan', label: 'Pelanggaran Ringan' },
    { id: 'belum_dihukum', label: 'Belum Eksekusi', count: visibleViolations.filter(v => v.status === 'belum_dihukum').length },
  ];

  const filteredViolations = visibleViolations.filter((v) => {
    const matchesSearch = 
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.nis.includes(searchTerm) ||
      v.kamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violation.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'berat') return v.severity === 'berat' || v.severity === 'sangat_berat';
    if (filter === 'sedang') return v.severity === 'sedang';
    if (filter === 'ringan') return v.severity === 'ringan';
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

  return (
    <div className="space-y-6">
      {/* Header (Unboxed) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2.5 font-headline tracking-tight">
            <ShieldAlert className="w-7 h-7 text-[#0F172A]" />
            Kedisiplinan, Poin & Sidang Mahkamah
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">
            Pencatatan kasus kedisiplinan objektif dengan sistem bobot poin dan konsekuensi edukatif.
          </p>
        </div>

        <Button
          variant="destructive"
          size="md"
          onClick={onOpenNewViolationModal}
          icon={<Plus className="w-4 h-4 text-white" />}
        >
          Input Kasus Pelanggaran
        </Button>
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

      {/* Main Table (Unboxed & Unclipped) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] font-headline uppercase tracking-[0.5px]">
            <tr>
              <th className="p-3.5">Santri & Kamar</th>
              <th className="p-3.5">Kasus Pelanggaran</th>
              <th className="p-3.5">Kategori</th>
              <th className="p-3.5">Poin</th>
              <th className="p-3.5">Bentuk Takzir / Hukuman</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredViolations.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#64748B] font-body">
                  <ShieldAlert className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="font-semibold text-xs text-[#0F172A] font-headline">Belum Ada Catatan Pelanggaran</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5 font-body">Klik "Input Kasus Pelanggaran" untuk mencatat pelanggaran santri.</p>
                </td>
              </tr>
            ) : (
              filteredViolations.map((v) => (
                <tr 
                  key={v.id} 
                  onContextMenu={(e) => handleRowContextMenu(e, v)}
                  className={`h-12 transition-colors group select-none cursor-default ${
                    activeMenu?.violation.id === v.id ? 'bg-slate-100/80' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <td className="p-3.5">
                    <div className="font-bold text-[#0F172A] font-headline">{v.studentName}</div>
                    <div className="text-[11px] text-[#64748B]">NIS: {v.nis} • {v.kamar}</div>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <span className="font-semibold text-[#0F172A]">{v.violation}</span>
                    <div className="text-[10px] text-[#64748B]">{v.date}</div>
                  </td>
                  <td className="p-3.5 text-[#64748B] font-body">{v.category}</td>
                  <td className="p-3.5 font-bold text-[#EF4444]">+{v.points} Pts</td>
                  <td className="p-3.5 max-w-xs text-[#0F172A] font-body">
                    {v.penaltyDescription}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="inline-flex items-center justify-center">
                      {v.status === 'selesai' ? (
                        <CheckCircle2 
                          className="w-4 h-4 text-[#059669]" 
                          title="Selesai (Sudah Dieksekusi)" 
                        />
                      ) : (
                        <Clock 
                          className="w-4 h-4 text-amber-500" 
                          title="Pending (Belum Selesai / Dalam Proses)" 
                        />
                      )}
                    </div>
                  </td>

                  {/* Kolom Aksi dengan Icon Button Titik Tiga */}
                  <td className="p-3.5 text-right pr-4">
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
              ))
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
            
            {/* Header Modal */}
            <div className="bg-[#142A18] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center border border-white/10">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-headline tracking-tight text-white">Edit Berkas Pelanggaran</h3>
                  <p className="text-xs text-slate-300">
                    Santri: <span className="font-semibold text-emerald-300">{editingViolation.studentName}</span> (NIS: {editingViolation.nis} • {editingViolation.kamar})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingViolation(null)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Form Edit"
              >
                <X className="w-4 h-4" />
              </button>
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
                    className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#142A18] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                    Kategori Pelanggaran *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#142A18] focus:bg-white focus:outline-none cursor-pointer"
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
                  <label className="text-xs font-semibold text-[#0F172A] font-headline flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-500" />
                    Tingkat Keparahan Kasus & Bobot Poin
                  </label>

                  {/* Dynamic Jackpot Rolling Number & Plain Text Category */}
                  <div className="flex items-center gap-1.5 text-xs font-bold font-headline">
                    <span className="text-slate-900 flex items-center font-mono">
                      +<RollingNumber value={editPoints} className="text-sm font-bold text-slate-900 mx-0.5" /> Poin
                    </span>
                    <span className="text-slate-400 font-normal">—</span>
                    <span className={`${editSeverityInfo.colorClass} font-semibold transition-colors duration-150`}>
                      {editSeverityInfo.label}
                    </span>
                  </div>
                </div>

                {/* Range Slider HTML Input */}
                <div className="relative py-1">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#142A18] transition-all focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, ${editSeverityInfo.accentColor} 0%, ${editSeverityInfo.accentColor} ${((editPoints - 1) / 49) * 100}%, #E2E8F0 ${((editPoints - 1) / 49) * 100}%, #E2E8F0 100%)`
                    }}
                  />
                </div>

                {/* Threshold Milestones */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1 select-none">
                  <span className={editPoints <= 12 ? 'text-emerald-700 font-bold' : ''}>1-12 Ringan</span>
                  <span className={editPoints >= 13 && editPoints <= 25 ? 'text-amber-700 font-bold' : ''}>13-25 Sedang</span>
                  <span className={editPoints >= 26 && editPoints <= 38 ? 'text-rose-600 font-bold' : ''}>26-38 Berat</span>
                  <span className={editPoints >= 39 ? 'text-red-700 font-bold' : ''}>39-50 Sangat Berat</span>
                </div>
              </div>

              {/* Row 3: Status Eksekusi Hukuman */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Status Hukuman
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['belum_dihukum', 'dalam_proses', 'selesai'] as PenaltyStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        editStatus === st
                          ? 'border-[#142A18] bg-emerald-50/80 text-[#142A18] font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="capitalize">{st.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Bentuk Takzir / Hukuman */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Rekomendasi Bentuk Hukuman / Takzir
                </label>
                <textarea
                  rows={2}
                  value={editPenaltyDescription}
                  onChange={(e) => setEditPenaltyDescription(e.target.value)}
                  placeholder="Bentuk konsekuensi edukatif..."
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#142A18] focus:bg-white focus:outline-none resize-none"
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
            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 font-headline">Hapus Catatan Pelanggaran?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Apakah Anda yakin ingin menghapus catatan pelanggaran <strong>"{deletingViolation.violation}"</strong> atas nama <strong>{deletingViolation.studentName}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>Santri: <strong className="text-slate-800">{deletingViolation.studentName}</strong> ({deletingViolation.kamar})</p>
                <p>Bobot Poin: <strong className="text-rose-600">+{deletingViolation.points} Pts</strong></p>
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
