import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X
} from 'lucide-react';
import { WorkProgram } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PillTabs, TabOption } from '../ui/PillTabs';

interface WorkProgramsViewProps {
  workPrograms: WorkProgram[];
  onOpenNewProgramModal: () => void;
}

type ProgramFilter = 'all' | 'dalam_proses' | 'menunggu_persetujuan' | 'selesai' | 'ditolak';

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
      {/* Header (Unboxed) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2.5 font-headline tracking-tight">
            <CalendarCheck className="w-7 h-7 text-[#0F172A]" />
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
          icon={<Plus className="w-4 h-4 text-white" />}
        >
          Ajukan Proposal Baru
        </Button>
      </div>

      {/* Filter Tabs */}
      <PillTabs
        tabs={filterTabs}
        activeTab={filter}
        onChange={(tab) => setFilter(tab)}
      />

      {/* Cards Grid */}
      {filteredPrograms.length === 0 ? (
        <Card variant="default" className="p-8 text-center bg-white border border-[#E2E8F0] space-y-2">
          <CalendarCheck className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-bold text-[#0F172A] font-headline">Belum Ada Proposal Terdaftar</h3>
          <p className="text-xs text-[#64748B] font-body">
            Klik "Ajukan Proposal Baru" untuk mengajukan rencana program kegiatan.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((p) => (
            <Card 
              key={p.id} 
              variant="default" 
              className="p-5 space-y-4 hoverable bg-white border border-[#E2E8F0] rounded-xl relative transition-all duration-200"
            >
              {/* 1. Header Card: Nama Program di atas & Nama Divisi di bawah (Plain Text) + 2. Ikon Status Tunggal */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-[#0F172A] leading-snug font-headline line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-900 mt-1 font-body">
                    {p.divisionName}
                  </p>
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  {renderProgramStatusIcon(p.status)}
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
    </div>
  );
};
