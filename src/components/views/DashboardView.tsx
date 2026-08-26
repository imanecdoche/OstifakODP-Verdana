import React, { useState, useMemo } from 'react';
import { 
  KPIMetric, 
  ViolationRecord, 
  WorkProgram, 
  UserProfile 
} from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  SantriRecord, 
  Dormitory, 
  DormitoryRoom, 
  ALL_OFFICIAL_ROOMS 
} from '../../lib/firestoreService';
import { 
  formatBudgetRatio, 
  calculateHMinus, 
  renderProgramStatusIcon 
} from './WorkProgramsView';
import { getSeverityInfo } from '../../lib/severityUtils';
import { parseHafalanToPages } from '../../data/quranSurahs';
import { PPIcon, PKIcon } from '../ui/PointIcons';
import { Clock, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  kpiMetrics: KPIMetric[];
  violations: ViolationRecord[];
  workPrograms: WorkProgram[];
  students?: SantriRecord[];
  dormitories?: Dormitory[];
  rooms?: DormitoryRoom[];
  dormitoriesCount?: number;
  roomsCount?: number;
  onOpenNewViolationModal: () => void;
  onOpenNewProgramModal: () => void;
  onSelectView: (view: string) => void;
}

// Running Text / Marquee Looping Component for Anti-Wrapping Table Cells
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

// Helper fleksibel untuk parsing tanggal catatan hafalan
const parseHafalanDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const monthMap: Record<string, number> = {
    januari: 0, jan: 0, februari: 1, feb: 1, maret: 2, mar: 2, april: 3, apr: 3,
    mei: 4, may: 4, juni: 5, jun: 5, juli: 6, jul: 6, agustus: 7, agu: 7, ags: 7,
    september: 8, sep: 8, oktober: 9, okt: 9, november: 10, nov: 10, desember: 11, des: 11,
  };
  const parts = dateStr.trim().toLowerCase().split(/[\s,.-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = monthMap[parts[1]];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

// Helper komponen untuk render format baku "N Juz, N Lbr, N Hal" dengan angka bold tebal
const RenderJuzLbrHal: React.FC<{ pages: number; className?: string }> = ({ 
  pages, 
  className = 'text-[11px] text-[#64748B] font-body' 
}) => {
  const safePages = Math.max(0, Math.round(pages));
  const juz = Math.floor(safePages / 20);
  const remPages = safePages % 20;
  const lembar = Math.floor(remPages / 2);
  const halaman = remPages % 2;

  return (
    <p className={className}>
      <strong className="font-bold text-[#0F172A] font-headline">{juz}</strong> Juz,{' '}
      <strong className="font-bold text-[#0F172A] font-headline">{lembar}</strong> Lbr,{' '}
      <strong className="font-bold text-[#0F172A] font-headline">{halaman}</strong> Hal
    </p>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  violations,
  workPrograms,
  students = [],
  rooms = ALL_OFFICIAL_ROOMS,
  dormitoriesCount = 0,
  roomsCount = 0,
  onSelectView,
}) => {
  // Helper konversi teks hafalan ke numerik juz
  const parseHafalanNumber = (hafalanStr: string): number => {
    if (!hafalanStr) return 0;
    const juzMatch = hafalanStr.match(/(\d+(\.\d+)?)\s*juz/i);
    const lbrMatch = hafalanStr.match(/(\d+)\s*(?:lbr|lembar)/i);
    const halMatch = hafalanStr.match(/(\d+)\s*(?:hal|halaman)/i);

    if (juzMatch || lbrMatch || halMatch) {
      const juz = juzMatch ? parseFloat(juzMatch[1]) : 0;
      const lbr = lbrMatch ? parseInt(lbrMatch[1], 10) : 0;
      const hal = halMatch ? parseInt(halMatch[1], 10) : 0;
      return Math.round((juz + (lbr * 2 + hal) / 20) * 100) / 100;
    }

    const match = hafalanStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // 1. Dynamic Average Hafalan from actual database records
  const averageHafalan = useMemo(() => {
    if (!students || students.length === 0) return '0 Juz';
    const numbers = students
      .map(s => parseHafalanNumber(s.hafalan))
      .filter(n => n > 0);
    if (numbers.length === 0) return '0 Juz';
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return `${avg.toFixed(1)} Juz`;
  }, [students]);

  // 2. Baris 1 - Top 5 Santri Teladan (Poin pelanggaran 0 / terendah & PP tertinggi)
  const topSantriTeladan = useMemo(() => {
    if (!students || students.length === 0) return [];
    return [...students]
      .sort((a, b) => {
        const pDiff = (a.poinPelanggaran || 0) - (b.poinPelanggaran || 0);
        if (pDiff !== 0) return pDiff;
        const ppDiff = (b.poinPrestasi || 0) - (a.poinPrestasi || 0);
        if (ppDiff !== 0) return ppDiff;
        const hafalanDiff = parseHafalanNumber(b.hafalan) - parseHafalanNumber(a.hafalan);
        if (hafalanDiff !== 0) return hafalanDiff;
        return (b.achievementsHistory?.length || 0) - (a.achievementsHistory?.length || 0);
      })
      .slice(0, 5);
  }, [students]);

  // 3. Baris 1 - Top 5 Kamar Terbaik (Total PP dari 3 Kategori: Indah + Rapi + Bersih)
  const topKamarTerbaik = useMemo(() => {
    const roomList = (rooms && rooms.length > 0) ? rooms : ALL_OFFICIAL_ROOMS;
    const list = roomList.map(r => {
      const indah = r.aestheticScore || 0;
      const rapi = r.neatnessScore || 0;
      const bersih = r.cleanlinessScore || 0;
      const totalPP = indah + rapi + bersih;

      const residentStudents = (students || []).filter(s => {
        if (!s.kamar) return false;
        const k = s.kamar.toLowerCase().trim();
        const rName = r.roomName.toLowerCase().trim();
        const rNum = r.roomNumber.toLowerCase().trim();
        return k === rName || k.includes(rName) || (k.includes(r.dormitoryName.toLowerCase()) && k.includes(rNum));
      });
      const studentCount = residentStudents.length || r.occupiedCount || 0;

      return {
        id: r.id,
        roomName: r.roomName,
        dormitoryName: r.dormitoryName,
        indah,
        rapi,
        bersih,
        totalPP,
        studentCount,
      };
    });

    return list
      .sort((a, b) => b.totalPP - a.totalPP)
      .slice(0, 5);
  }, [rooms, students]);

  // 4. Baris 2 - Para Huffazh (Santri tuntas 30 Juz)
  const paraHuffazh = useMemo(() => {
    if (!students || students.length === 0) return [];
    return students.filter(s => {
      const num = parseHafalanNumber(s.hafalan);
      return num >= 30 || (s.hafalan && s.hafalan.toLowerCase().includes('30 juz'));
    });
  }, [students]);

  // 5. Baris 2 - Top 5 Hafalan Terbanyak (Santri < 30 Juz)
  const topHafalanTerbanyak = useMemo(() => {
    if (!students || students.length === 0) return [];
    return [...students]
      .filter(s => {
        const num = parseHafalanNumber(s.hafalan);
        const is30 = num >= 30 || (s.hafalan && s.hafalan.toLowerCase().includes('30 juz'));
        return !is30 && num > 0;
      })
      .sort((a, b) => parseHafalanNumber(b.hafalan) - parseHafalanNumber(a.hafalan))
      .slice(0, 5);
  }, [students]);

  // 6. Baris 3 - Top 5 Setoran Terbanyak Bulan Ini (Ziyadah)
  const topSetoranBulanIni = useMemo(() => {
    if (!students || students.length === 0) return [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const list = students.map(s => {
      const history = s.hafalanHistory || [];
      const setoranEntries = history.filter(h => {
        if (h.category === 'Murojaah') return false;
        const d = h.timestamp ? new Date(h.timestamp) : parseHafalanDate(h.date || '');
        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalPages = setoranEntries.reduce((acc, h) => acc + (h.pageCount || 1), 0);
      const count = setoranEntries.length;

      return {
        student: s,
        count,
        totalPages,
      };
    });

    return list
      .filter(item => item.count > 0 || item.totalPages > 0)
      .sort((a, b) => b.totalPages - a.totalPages || b.count - a.count)
      .slice(0, 5);
  }, [students]);

  // 7. Baris 3 - Top 5 Murojaah Terbanyak Bulan Ini (Murojaah)
  const topMurojaahBulanIni = useMemo(() => {
    if (!students || students.length === 0) return [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const list = students.map(s => {
      const history = s.hafalanHistory || [];
      const murojaahEntries = history.filter(h => {
        if (h.category !== 'Murojaah') return false;
        const d = h.timestamp ? new Date(h.timestamp) : parseHafalanDate(h.date || '');
        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalPages = murojaahEntries.reduce((acc, h) => acc + (h.pageCount || 1), 0);
      const count = murojaahEntries.length;

      return {
        student: s,
        count,
        totalPages,
      };
    });

    return list
      .filter(item => item.count > 0 || item.totalPages > 0)
      .sort((a, b) => b.totalPages - a.totalPages || b.count - a.count)
      .slice(0, 5);
  }, [students]);

  // 8. Baris 4 - Top 5 Ziyadah Terbanyak Bulan Kemarin
  const topZiyadahBulanKemarin = useMemo(() => {
    if (!students || students.length === 0) return [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const list = students.map(s => {
      const history = s.hafalanHistory || [];
      const entries = history.filter(h => {
        if (h.category === 'Murojaah') return false;
        const d = h.timestamp ? new Date(h.timestamp) : parseHafalanDate(h.date || '');
        return d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });

      const totalPages = entries.reduce((acc, h) => acc + (h.pageCount || 1), 0);
      const count = entries.length;

      return {
        student: s,
        count,
        totalPages,
      };
    });

    return list
      .filter(item => item.count > 0 || item.totalPages > 0)
      .sort((a, b) => b.totalPages - a.totalPages || b.count - a.count)
      .slice(0, 5);
  }, [students]);

  // 9. Baris 4 - Top 5 Muroja'ah Terbanyak Bulan Kemarin
  const topMurojaahBulanKemarin = useMemo(() => {
    if (!students || students.length === 0) return [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const list = students.map(s => {
      const history = s.hafalanHistory || [];
      const entries = history.filter(h => {
        if (h.category !== 'Murojaah') return false;
        const d = h.timestamp ? new Date(h.timestamp) : parseHafalanDate(h.date || '');
        return d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });

      const totalPages = entries.reduce((acc, h) => acc + (h.pageCount || 1), 0);
      const count = entries.length;

      return {
        student: s,
        count,
        totalPages,
      };
    });

    return list
      .filter(item => item.count > 0 || item.totalPages > 0)
      .sort((a, b) => b.totalPages - a.totalPages || b.count - a.count)
      .slice(0, 5);
  }, [students]);

  // 10. Top 5 Work Programs (Progress Terbanyak)
  const topWorkPrograms = useMemo(() => {
    if (!workPrograms || workPrograms.length === 0) return [];
    return [...workPrograms]
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 5);
  }, [workPrograms]);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Unboxed Welcome Header */}
      <div>
        <p className="text-sm font-medium text-[#64748B] font-body">
          Assalamu'alaikum,
        </p>
        <h1 className="animated-gradient-text text-4xl font-black font-headline tracking-tight mt-1">
          {currentUser.name}
        </h1>
        <p className="text-xs text-[#64748B] mt-2 max-w-2xl leading-relaxed font-body">
          Selamat datang di Dashboard OSTIFAK. Ringkasan seluruh data kedisiplinan santri, capaian tahfizh Al-Qur'an, dan analisis master per-asramaan.
        </p>
      </div>

      {/* 2. Executive KPI Stats (Unboxed 1-Row on Desktop, Clean Symmetrical Grid on Mobile with Dividers) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-y border-[#E2E8F0] overflow-hidden">
        {/* Metric 1 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Total Santri Aktif
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {students.length}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Santri</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 sm:px-5 sm:py-4 md:border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Master Asrama & Kamar
          </p>
          <div className="flex items-baseline gap-3 mt-0.5">
            <span className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">{dormitoriesCount}</span>
              <span className="text-xs text-[#64748B] font-medium font-body">Asrama</span>
            </span>
            <span className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">{roomsCount}</span>
              <span className="text-xs text-[#64748B] font-medium font-body">Kamar</span>
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t-0 border-r md:border-r-0 lg:border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Pelanggaran Pekan Ini
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {violations.length}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Kasus</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 sm:px-5 sm:py-4 border-t md:border-t lg:border-t-0 md:border-r border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Proposal & Program
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {workPrograms.length}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Program</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-3.5 sm:px-5 sm:py-4 col-span-2 md:col-span-1 border-t md:border-t lg:border-t-0 border-[#E2E8F0]">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Rata-rata Hafalan
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight font-headline">
              {averageHafalan}
            </span>
          </div>
        </div>
      </div>

      {/* 3. STRUKTUR TOP LIST & STATISTIK REAL DATABASE */}

      {/* BARIS 1: Top 5 Santri Teladan & Top 5 Kamar Terbaik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Kolom 1: Top 5 Santri Teladan */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Santri Teladan
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Akumulasi perolehan Poin Prestasi (PP) santri tertinggi dengan kedisiplinan terbaik
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topSantriTeladan.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data santri terdaftar.</p>
            ) : (
              topSantriTeladan.map((s, idx) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {s.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {s.nis} • {s.kelas} • {s.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body flex items-center justify-end gap-1">
                      <span>+{s.poinPrestasi || 0}</span>
                      <PPIcon className="w-3.5 h-3.5" />
                    </p>
                    <p className="text-[11px] text-[#64748B] font-body flex items-center justify-end gap-1">
                      <span className={`font-semibold inline-flex items-center gap-0.5 ${s.poinPelanggaran > 0 ? 'text-[#EF4444]' : 'text-[#16A34A]'}`}>
                        <span>{s.poinPelanggaran || 0}</span>
                        <PKIcon className="w-2.5 h-2.5" />
                      </span>
                      <span>• {s.hafalan || '0 Juz'}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Top 5 Kamar Terbaik */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Kamar Terbaik
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Akumulasi perolehan Poin Prestasi (PP) kamar tertinggi (Indah • Rapi • Bersih)
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topKamarTerbaik.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data kamar terdaftar.</p>
            ) : (
              topKamarTerbaik.map((r, idx) => (
                <div key={r.id || r.roomName} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {r.roomName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        {r.dormitoryName} • {r.studentCount} Santri Terdaftar
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body flex items-center justify-end gap-1">
                      <span>{r.totalPP}</span>
                      <PPIcon className="w-3.5 h-3.5" />
                    </p>
                    <p className="text-[11px] text-[#64748B] font-body">
                      {r.indah} • {r.rapi} • {r.bersih}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BARIS 2: Para Huffazh (30 Juz) & Top 5 Hafalan Terbanyak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-[#E2E8F0] pt-10">
        
        {/* Kolom 1: Para Huffazh (30 Juz) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Para Huffazh
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Daftar santri yang telah menyelesaikan setoran 30 Juz Al-Qur'an
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {paraHuffazh.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">
                Belum ada santri yang tuntas 30 Juz di database.
              </p>
            ) : (
              paraHuffazh.map((s, idx) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#059669] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {s.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {s.nis} • {s.kelas} • {s.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body">
                      Khatam 30 Juz
                    </p>
                    <p className="text-[11px] text-[#64748B] font-body">
                      Al-Hafizh
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Top 5 Hafalan Terbanyak */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Hafalan Terbanyak
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Santri aktif dengan akumulasi kuantitas capaian hafalan tertinggi
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topHafalanTerbanyak.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data santri terdaftar.</p>
            ) : (
              topHafalanTerbanyak.map((s, idx) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {s.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {s.nis} • {s.kelas} • {s.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#0F172A] font-headline">
                      {s.hafalan}
                    </p>
                    <RenderJuzLbrHal pages={parseHafalanToPages(s.hafalan)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BARIS 3: Top 5 Setoran Terbanyak & Top 5 Murojaah Terbanyak Bulan Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-[#E2E8F0] pt-10">
        
        {/* Kolom 1: Top 5 Setoran Terbanyak Bulan Ini */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Setoran Terbanyak Bulan Ini
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Aktivitas penambahan hafalan baru paling produktif bulan ini
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topSetoranBulanIni.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data setoran bulan ini.</p>
            ) : (
              topSetoranBulanIni.map((item, idx) => (
                <div key={item.student.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {item.student.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {item.student.nis} • {item.student.kelas} • {item.student.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body">
                      {item.count} Kali Setoran
                    </p>
                    <RenderJuzLbrHal pages={item.totalPages} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Top 5 Murojaah Terbanyak Bulan Ini */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Murojaah Terbanyak Bulan Ini
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Pengulangan hafalan mutqin tertinggi periode berjalan
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topMurojaahBulanIni.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data murojaah bulan ini.</p>
            ) : (
              topMurojaahBulanIni.map((item, idx) => (
                <div key={item.student.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {item.student.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {item.student.nis} • {item.student.kelas} • {item.student.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body">
                      {item.count} Sesi Murojaah
                    </p>
                    <RenderJuzLbrHal pages={item.totalPages} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BARIS 4: Top 5 Ziyadah Terbanyak Bulan Kemarin & Top 5 Muroja'ah Terbanyak Bulan Kemarin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-[#E2E8F0] pt-10">
        
        {/* Kolom 1: Top 5 Ziyadah Terbanyak Bulan Kemarin */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Ziyadah Terbanyak Bulan Kemarin
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Akumulasi penambahan hafalan baru santri periode bulan lalu
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topZiyadahBulanKemarin.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data ziyadah bulan kemarin.</p>
            ) : (
              topZiyadahBulanKemarin.map((item, idx) => (
                <div key={item.student.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {item.student.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {item.student.nis} • {item.student.kelas} • {item.student.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body">
                      {item.count} Kali Setoran
                    </p>
                    <RenderJuzLbrHal pages={item.totalPages} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Top 5 Muroja'ah Terbanyak Bulan Kemarin */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Muroja'ah Terbanyak Bulan Kemarin
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Pengulangan hafalan mutqin tertinggi santri periode bulan lalu
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topMurojaahBulanKemarin.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data murojaah bulan kemarin.</p>
            ) : (
              topMurojaahBulanKemarin.map((item, idx) => (
                <div key={item.student.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {item.student.studentName}
                      </p>
                      <p className="text-xs text-[#64748B] font-body truncate">
                        NIS: {item.student.nis} • {item.student.kelas} • {item.student.kamar}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body">
                      {item.count} Sesi Murojaah
                    </p>
                    <RenderJuzLbrHal pages={item.totalPages} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. REKAPITULASI PELANGGARAN SANTRI TERBARU (LANGSUNG TAMPIL TANPA SEGMENTED BUTTON) */}
      <div className="space-y-4 border-t border-[#E2E8F0] pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Rekapitulasi Pelanggaran Santri Terbaru
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Pencatatan kasus kedisiplinan berbobot poin oleh Divisi Keamanan
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectView('violations')}
          >
            Lihat Semua
          </Button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] font-headline uppercase tracking-[0.5px]">
              <tr>
                <th className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap">TANGGAL</th>
                <th className="p-3.5 w-44 min-w-[140px] max-w-[180px] whitespace-nowrap">SANTRI & KAMAR</th>
                <th className="p-3.5 min-w-[180px] max-w-[280px] sm:max-w-[340px] whitespace-nowrap">JENIS PELANGGARAN</th>
                <th className="p-3.5 w-20 min-w-[60px] max-w-[70px] whitespace-nowrap">POIN</th>
                <th className="p-3.5 w-24 min-w-[80px] max-w-[90px] whitespace-nowrap">TINGKAT</th>
                <th className="p-3.5 w-24 min-w-[70px] max-w-[90px] text-center whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B] font-body">
                    Belum ada data pelanggaran di sistem.
                  </td>
                </tr>
              ) : (
                violations.slice(0, 5).map((v) => {
                  const dateObj = formatSplitDate(v.date);
                  return (
                    <tr key={v.id} className="h-14 hover:bg-[#F8FAFC] transition-colors">
                      {/* 1. Tanggal 2 Baris */}
                      <td className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap align-middle">
                        <p className="font-bold text-xs text-[#0F172A] font-headline leading-tight whitespace-nowrap">
                          {dateObj.dayName}
                        </p>
                        <p className="text-[11px] text-[#64748B] font-body mt-0.5 leading-tight whitespace-nowrap">
                          {dateObj.formattedDate}
                        </p>
                      </td>

                      {/* 2. Santri & Kamar */}
                      <td className="p-3.5 w-44 min-w-[140px] max-w-[180px] align-middle overflow-hidden">
                        <RunningText text={v.studentName} className="font-bold text-[#0F172A] font-headline" />
                        <RunningText text={`NIS: ${v.nis} • ${v.kamar}`} className="text-[11px] text-[#64748B] mt-0.5" />
                      </td>

                      {/* 3. Kasus Pelanggaran */}
                      <td className="p-3.5 min-w-[180px] max-w-[280px] sm:max-w-[340px] align-middle overflow-hidden">
                        <RunningText text={v.violation} className="font-semibold text-[#0F172A]" />
                        <RunningText text={`Kategori: ${v.category}`} className="text-[10px] text-[#64748B] uppercase mt-0.5" />
                      </td>

                      {/* 4. Poin */}
                      <td className="p-3.5 w-20 min-w-[60px] max-w-[70px] font-bold text-[#EF4444] whitespace-nowrap align-middle font-mono">
                        <div className="flex items-center gap-1">
                          <span>+{v.points}</span>
                          <PKIcon className="w-3.5 h-3.5" />
                        </div>
                      </td>

                      {/* 5. Tingkat */}
                      <td className="p-3.5 w-24 min-w-[80px] max-w-[90px] whitespace-nowrap align-middle">
                        <span className={`font-bold text-xs ${getSeverityInfo(v.points).colorClass}`}>
                          {getSeverityInfo(v.points).label}
                        </span>
                      </td>

                      {/* 6. Status (Ikon Murni Tanpa Teks) */}
                      <td className="p-3.5 w-24 min-w-[70px] max-w-[90px] text-center whitespace-nowrap align-middle">
                        {v.status === 'selesai' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] mx-auto" title="Selesai" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 mx-auto" title="Dalam Proses" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. PROGRAM KERJA OSTIFAK (TOP 5 PROGRESS DENGAN ELEMEN KARTU PROGRAM KERJA) */}
      <div className="space-y-4 border-t border-[#E2E8F0] pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Program Kerja OSTIFAK
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectView('programs')}
          >
            Lihat Semua
          </Button>
        </div>

        {topWorkPrograms.length === 0 ? (
          <p className="text-xs text-[#64748B] py-4">Belum ada proposal program kerja terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topWorkPrograms.map((p) => (
              <Card 
                key={p.id} 
                variant="default" 
                className="p-5 space-y-4 hoverable bg-white border border-[#E2E8F0] rounded-xl relative transition-all duration-200"
              >
                {/* 1. Header Card: Nama Program di atas & Nama Divisi di bawah + Ikon Status Tunggal */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#0F172A] leading-snug font-headline line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-900 mt-1 font-body">
                      {p.divisionName || p.divisionId}
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-0.5">
                    {renderProgramStatusIcon(p.status)}
                  </div>
                </div>

                {/* 2. Progress Bar & Anggaran */}
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

                {/* 3. Target Waktu & Countdown H-N */}
                <div className="flex items-center justify-between text-xs pt-1 font-body">
                  <span className="font-medium text-slate-600">{p.targetDate}</span>
                  <span className="font-bold text-slate-900 font-headline">{calculateHMinus(p.targetDate)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
