import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  KPIMetric, 
  ViolationRecord, 
  WorkProgram, 
  UserProfile 
} from '../../types';
import { Card } from '../ui/Card';
import { PillTabs, TabOption } from '../ui/PillTabs';
import { Button } from '../ui/Button';
import { 
  formatBudgetRatio, 
  calculateHMinus, 
  renderProgramStatusIcon 
} from './WorkProgramsView';
import { SantriRecord } from '../../lib/firestoreService';

interface DashboardViewProps {
  currentUser: UserProfile;
  kpiMetrics: KPIMetric[];
  violations: ViolationRecord[];
  workPrograms: WorkProgram[];
  students?: SantriRecord[];
  dormitoriesCount?: number;
  roomsCount?: number;
  onOpenNewViolationModal: () => void;
  onOpenNewProgramModal: () => void;
  onSelectView: (view: string) => void;
}

type DashboardTab = 'all' | 'violations' | 'programs';

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  kpiMetrics,
  violations,
  workPrograms,
  students = [],
  dormitoriesCount = 0,
  roomsCount = 0,
  onOpenNewViolationModal,
  onOpenNewProgramModal,
  onSelectView,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('all');

  const filterTabs: TabOption<DashboardTab>[] = [
    { id: 'all', label: 'Semua Rekap' },
    { id: 'violations', label: 'Pelanggaran & Mahkamah', count: violations.length },
    { id: 'programs', label: 'Program Kerja Divisi', count: workPrograms.length },
  ];

  // Dynamic Average Hafalan from actual santri records
  const getAverageHafalan = () => {
    if (!students || students.length === 0) return '0 Juz';
    const numbers = students.map(s => {
      const match = s.hafalan.match(/(\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    }).filter(n => n > 0);
    if (numbers.length === 0) return '0 Juz';
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return `${avg.toFixed(1)} Juz`;
  };

  const totalStudentsCount = students.length;

  interface KpiDisplay {
    id: string;
    title: string;
    value?: string | number;
    unit?: string;
    extra?: string;
    change?: string;
    isPositive?: boolean;
    subtitle?: string;
    stats?: { value: number | string; unit: string }[];
  }

  const defaultKPIs: KpiDisplay[] = [
    {
      id: 'kpi-1',
      title: 'Total Santri Aktif',
      value: totalStudentsCount,
      unit: 'Santri',
      extra: '98.4% Shalat',
      change: '',
      isPositive: true,
      subtitle: 'Data santri terverifikasi',
    },
    {
      id: 'kpi-kamar',
      title: 'Total Kamar',
      stats: [
        { value: dormitoriesCount, unit: 'Asrama' },
        { value: roomsCount, unit: 'Kamar' },
      ],
      change: '',
      isPositive: true,
      subtitle: 'Master per-asramaan resmi',
    },
    {
      id: 'kpi-2',
      title: 'Pelanggaran Pekan Ini',
      value: violations.length,
      unit: 'Kasus',
      change: '',
      isPositive: true,
      subtitle: 'Divisi Keamanan & Mahkamah',
    },
    {
      id: 'kpi-3',
      title: 'Proposal & Program',
      value: workPrograms.length,
      unit: 'Program',
      extra: `${workPrograms.filter(p => p.status === 'selesai').length} Selesai`,
      change: '',
      isPositive: true,
      subtitle: '9 Divisi Operasional',
    },
    {
      id: 'kpi-4',
      title: 'Hafalan Al-Quran',
      value: getAverageHafalan(),
      unit: 'Rata-rata',
      change: '',
      isPositive: true,
      subtitle: 'Mutabaah Tahfizh Diniyah',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Unboxed Welcome Header */}
      <div>
        <p className="text-sm font-medium text-[#64748B] font-body">
          Assalamu'alaikum,
        </p>
        <h1 className="animated-gradient-text text-4xl font-black font-headline tracking-tight mt-1">
          {currentUser.name}
        </h1>
        <p className="text-xs text-[#64748B] mt-2 max-w-2xl leading-relaxed font-body">
          Selamat datang di Dashboard OSTIFAK. Ringkasan seluruh data kedisiplinan santri, proposal 9 divisi, dan kebersihan asrama.
        </p>
      </div>

      {/* 5 Executive KPI Stats (Unboxed) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {defaultKPIs.map((kpi) => (
          <div key={kpi.id}>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] font-headline">
              {kpi.title}
            </p>
            {kpi.stats ? (
              <div className="flex items-baseline gap-4 mt-1">
                {kpi.stats.map((s) => (
                  <span key={s.unit} className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#0F172A] tracking-tight">
                      {s.value}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium font-body">{s.unit}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-bold text-[#0F172A] tracking-tight">
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-xs text-[#64748B] font-medium font-body">{kpi.unit}</span>
                )}
                {kpi.extra && (
                  <span className="text-xs text-[#059669] font-medium ml-1">
                    • {kpi.extra}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PillTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Violations Recap (Unboxed) */}
      {(activeTab === 'all' || activeTab === 'violations') && (
        <div className="space-y-4 border-t border-[#E2E8F0] pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 font-headline">
                <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                Rekapitulasi Pelanggaran Santri Terbaru
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                Pencatatan kasus kedisiplinan berbobot poin oleh Divisi Keamanan
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectView('violations')}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Lihat Semua
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] font-headline uppercase tracking-[0.5px]">
                <tr>
                  <th className="p-3.5">Santri & Kamar</th>
                  <th className="p-3.5">Jenis Pelanggaran</th>
                  <th className="p-3.5">Poin</th>
                  <th className="p-3.5">Tingkat</th>
                  <th className="p-3.5">Status Hukuman</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {violations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B] font-body">
                      Belum ada data pelanggaran di sistem. Klik "Catat Pelanggaran" untuk menambah kasus baru.
                    </td>
                  </tr>
                ) : (
                  violations.slice(0, 5).map((v) => (
                    <tr key={v.id} className="h-12 hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#0F172A] font-headline">{v.studentName}</div>
                        <div className="text-[11px] text-[#64748B] ">NIS: {v.nis} • {v.kamar}</div>
                      </td>
                      <td className="p-3.5 font-medium text-[#0F172A]">
                        <span>{v.violation}</span>
                        <div className="text-[10px] text-[#64748B] uppercase">{v.category}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[#EF4444]">+{v.points} Pts</td>
                      <td className="p-3.5">
                        <span className={`text-xs font-semibold ${
                          v.severity === 'berat' ? 'text-[#DC2626]' : v.severity === 'sedang' ? 'text-[#CA8A04]' : 'text-[#0284C7]'
                        }`}>
                          {v.severity}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-xs font-semibold ${
                          v.status === 'selesai' ? 'text-[#16A34A]' : v.status === 'dalam_proses' ? 'text-[#CA8A04]' : 'text-[#DC2626]'
                        }`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#64748B] whitespace-nowrap">{v.date}</td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => onSelectView('violations')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#059669] hover:bg-[#059669]/10 rounded-md transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Programs Recap (Unboxed, divider-separated) */}
      {(activeTab === 'all' || activeTab === 'programs') && (
        <div className="space-y-4 border-t border-[#E2E8F0] pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 font-headline">
                <FileText className="w-5 h-5 text-[#0F172A]" />
                Status Program Kerja 9 Divisi
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                Monitoring progres pelaksanaan kegiatan & pengajuan anggaran kas
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectView('programs')}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Lihat Semua Program
            </Button>
          </div>

          {workPrograms.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-md border border-[#E2E8F0] font-body">
              Belum ada proposal program kerja di sistem. Klik "Proposal Baru" untuk mengajukan rencana kegiatan divisi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workPrograms.slice(0, 6).map((prog) => (
                <Card
                  key={prog.id}
                  variant="default"
                  className="p-5 space-y-4 hoverable bg-white border border-[#E2E8F0] rounded-xl relative transition-all duration-200"
                >
                  {/* 1. Header Card: Nama Program di atas & Nama Divisi di bawah (Plain Text) + 2. Ikon Status Tunggal di Pojok Kanan Atas */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-[#0F172A] leading-snug font-headline line-clamp-2">
                        {prog.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-900 mt-1 font-body">
                        {prog.divisionName}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      {renderProgramStatusIcon(prog.status)}
                    </div>
                  </div>

                  {/* 3. Progress Bar Tanpa Kontainer & Format Anggaran Pengganti */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#059669] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, prog.progress || 0))}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 font-body">
                      {formatBudgetRatio(prog.budget, prog.progress)}
                    </div>
                  </div>

                  {/* 4. Target Waktu & Countdown H-N (Tanpa Divider) */}
                  <div className="flex items-center justify-between text-xs pt-1 font-body">
                    <span className="font-medium text-slate-600">{prog.targetDate}</span>
                    <span className="font-bold text-slate-900 font-headline">{calculateHMinus(prog.targetDate)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
