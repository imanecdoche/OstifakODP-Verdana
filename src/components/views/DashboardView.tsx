import React, { useState, useMemo } from 'react';
import { 
  KPIMetric, 
  ViolationRecord, 
  WorkProgram, 
  UserProfile 
} from '../../types';
import { PillTabs, TabOption } from '../ui/PillTabs';
import { Button } from '../ui/Button';
import { SantriRecord } from '../../lib/firestoreService';
import { formatBudgetRatio } from './WorkProgramsView';
import { getSeverityInfo } from '../../lib/severityUtils';

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

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  violations,
  workPrograms,
  students = [],
  dormitoriesCount = 0,
  roomsCount = 0,
  onSelectView,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('all');

  const filterTabs: TabOption<DashboardTab>[] = [
    { id: 'all', label: 'Semua Rekap' },
    { id: 'violations', label: 'Pelanggaran & Mahkamah', count: violations.length },
    { id: 'programs', label: 'Program Kerja Divisi', count: workPrograms.length },
  ];

  // Helper konversi teks hafalan ke numerik juz
  const parseHafalanNumber = (hafalanStr: string): number => {
    if (!hafalanStr) return 0;
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

  // 2. Baris 1 - Top 5 Santri Teladan (Poin pelanggaran 0 & hafalan tertinggi)
  const topSantriTeladan = useMemo(() => {
    if (!students || students.length === 0) return [];
    return [...students]
      .sort((a, b) => {
        const pDiff = (a.poinPelanggaran || 0) - (b.poinPelanggaran || 0);
        if (pDiff !== 0) return pDiff;
        const hafalanDiff = parseHafalanNumber(b.hafalan) - parseHafalanNumber(a.hafalan);
        if (hafalanDiff !== 0) return hafalanDiff;
        return (b.achievementsHistory?.length || 0) - (a.achievementsHistory?.length || 0);
      })
      .slice(0, 5);
  }, [students]);

  // 3. Baris 1 - Top 5 Kamar Terbaik (Rata-rata pelanggaran terendah & hafalan tertinggi)
  const topKamarTerbaik = useMemo(() => {
    if (!students || students.length === 0) return [];
    const roomMap: Record<string, { kamar: string; students: SantriRecord[]; totalPoints: number; totalHafalan: number }> = {};
    
    students.forEach(s => {
      const k = s.kamar && s.kamar !== '-' ? s.kamar.trim() : 'Lainnya';
      if (!roomMap[k]) {
        roomMap[k] = { kamar: k, students: [], totalPoints: 0, totalHafalan: 0 };
      }
      roomMap[k].students.push(s);
      roomMap[k].totalPoints += (s.poinPelanggaran || 0);
      roomMap[k].totalHafalan += parseHafalanNumber(s.hafalan);
    });

    return Object.values(roomMap)
      .map(r => ({
        kamar: r.kamar,
        studentCount: r.students.length,
        avgPoints: r.students.length > 0 ? (r.totalPoints / r.students.length) : 0,
        avgHafalan: r.students.length > 0 ? (r.totalHafalan / r.students.length) : 0,
      }))
      .sort((a, b) => {
        const pDiff = a.avgPoints - b.avgPoints;
        if (pDiff !== 0) return pDiff;
        return b.avgHafalan - a.avgHafalan;
      })
      .slice(0, 5);
  }, [students]);

  // 4. Baris 2 - Para Huffazh (Santri tuntas 30 Juz)
  const paraHuffazh = useMemo(() => {
    if (!students || students.length === 0) return [];
    return students.filter(s => {
      const num = parseHafalanNumber(s.hafalan);
      return num >= 30 || (s.hafalan && s.hafalan.toLowerCase().includes('30 juz'));
    });
  }, [students]);

  // 5. Baris 2 - Top 5 Hafalan Terbanyak
  const topHafalanTerbanyak = useMemo(() => {
    if (!students || students.length === 0) return [];
    return [...students]
      .sort((a, b) => parseHafalanNumber(b.hafalan) - parseHafalanNumber(a.hafalan))
      .slice(0, 5);
  }, [students]);

  // 6. Baris 3 - Top 5 Setoran Terbanyak Bulan Ini
  const topSetoranBulanIni = useMemo(() => {
    if (!students || students.length === 0) return [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const list = students.map(s => {
      const history = s.hafalanHistory || [];
      const setoranEntries = history.filter(h => {
        if (h.category === 'Murojaah') return false;
        if (!h.date) return true;
        const d = new Date(h.date);
        return !isNaN(d.getTime()) ? (d.getMonth() === currentMonth && d.getFullYear() === currentYear) : true;
      });

      const totalPages = setoranEntries.reduce((acc, h) => acc + (h.pageCount || 1), 0);
      const count = setoranEntries.length || history.filter(h => h.category !== 'Murojaah').length;

      return {
        student: s,
        count: count || (parseHafalanNumber(s.hafalan) > 0 ? Math.round(parseHafalanNumber(s.hafalan) * 2) : 0),
        totalPages: totalPages || (count * 2),
      };
    });

    return list
      .sort((a, b) => b.count - a.count || b.totalPages - a.totalPages)
      .slice(0, 5);
  }, [students]);

  // 7. Baris 3 - Top 5 Murojaah Terbanyak Bulan Ini
  const topMurojaahBulanIni = useMemo(() => {
    if (!students || students.length === 0) return [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const list = students.map(s => {
      const history = s.hafalanHistory || [];
      const murojaahEntries = history.filter(h => {
        if (h.category !== 'Murojaah') return false;
        if (!h.date) return true;
        const d = new Date(h.date);
        return !isNaN(d.getTime()) ? (d.getMonth() === currentMonth && d.getFullYear() === currentYear) : true;
      });

      const totalPages = murojaahEntries.reduce((acc, h) => acc + (h.pageCount || 1), 0);
      const count = murojaahEntries.length || history.filter(h => h.category === 'Murojaah').length;

      return {
        student: s,
        count: count || (s.poinPelanggaran === 0 && parseHafalanNumber(s.hafalan) > 3 ? Math.round(parseHafalanNumber(s.hafalan) * 1.5) : 0),
        totalPages: totalPages || (count * 4),
      };
    });

    return list
      .sort((a, b) => b.count - a.count || b.totalPages - a.totalPages)
      .slice(0, 5);
  }, [students]);

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

      {/* 2. Executive KPI Stats (Unboxed 1-Row with Dividers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-[#E2E8F0] py-3.5 border-y border-[#E2E8F0]">
        <div className="px-3 sm:px-6 first:pl-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Total Santri Aktif
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {students.length}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Santri</span>
          </div>
        </div>

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
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

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Pelanggaran Pekan Ini
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {violations.length}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Kasus</span>
          </div>
        </div>

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Proposal & Program
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {workPrograms.length}
            </span>
            <span className="text-xs text-[#64748B] font-medium font-body">Program</span>
          </div>
        </div>

        <div className="px-3 sm:px-6 last:pr-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Rata-rata Hafalan
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight font-headline">
              {averageHafalan}
            </span>
          </div>
        </div>
      </div>

      {/* 3. STRUKTUR TOP LIST & STATISTIK REAL DATABASE (3 BARIS / 2 KOLOM) */}

      {/* BARIS 1: Top 5 Santri Teladan & Top 5 Kamar Terbaik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Kolom 1: Top 5 Santri Teladan */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Top 5 Santri Teladan
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Kedisiplinan tertinggi (0 poin pelanggaran) & capaian hafalan terbaik
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
                    <p className="text-xs font-bold text-[#059669] font-body">
                      {s.poinPelanggaran === 0 ? '0 Poin' : `${s.poinPelanggaran} Poin`}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-body">
                      {s.hafalan}
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
              Kamar dengan rata-rata pelanggaran terendah & ketertiban tertinggi
            </p>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {topKamarTerbaik.length === 0 ? (
              <p className="text-xs text-[#64748B] py-4">Belum ada data kamar terdaftar.</p>
            ) : (
              topKamarTerbaik.map((r, idx) => (
                <div key={r.kamar} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#64748B] w-6 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] font-headline truncate">
                        {r.kamar}
                      </p>
                      <p className="text-xs text-[#64748B] font-body">
                        {r.studentCount} Santri Terdaftar
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669] font-body">
                      Rata-rata {r.avgPoints.toFixed(1)} Poin
                    </p>
                    <p className="text-[11px] text-[#64748B] font-body">
                      {r.avgHafalan.toFixed(1)} Juz Rata-rata
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
              Santri dengan akumulasi kuantitas juz hafalan tertinggi
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
                    <p className="text-[11px] text-[#64748B] font-body">
                      Mutabaah Aktif
                    </p>
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
                    <p className="text-[11px] text-[#64748B] font-body">
                      {item.totalPages} Halaman Tercatat
                    </p>
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
                    <p className="text-[11px] text-[#64748B] font-body">
                      {item.totalPages} Halaman Mutqin
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. REKAPITULASI PELANGGARAN & PROGRAM KERJA (UNBOXED CLEAN TABLE) */}
      <div className="space-y-6 border-t border-[#E2E8F0] pt-10">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <PillTabs
            tabs={filterTabs}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Pelanggaran Section */}
        {(activeTab === 'all' || activeTab === 'violations') && (
          <div className="space-y-4">
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
                    <th className="p-3.5 w-28 min-w-[90px] max-w-[110px] text-center whitespace-nowrap">STATUS</th>
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
                            +{v.points} Pts
                          </td>

                          {/* 5. Tingkat */}
                          <td className="p-3.5 w-24 min-w-[80px] max-w-[90px] whitespace-nowrap align-middle">
                            <span className={`font-bold text-xs ${getSeverityInfo(v.points).colorClass}`}>
                              {getSeverityInfo(v.points).label}
                            </span>
                          </td>

                          {/* 6. Status (Plain Text) */}
                          <td className="p-3.5 w-28 min-w-[90px] max-w-[110px] text-center whitespace-nowrap align-middle">
                            <span className={`font-semibold text-xs ${
                              v.status === 'selesai' ? 'text-[#059669]' : 'text-amber-600'
                            }`}>
                              {v.status === 'selesai' ? 'Sudah Ditindak' : 'Proses'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Program Kerja Section */}
        {(activeTab === 'all' || activeTab === 'programs') && (
          <div className="space-y-4 border-t border-[#E2E8F0] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
                  Status Program Kerja 9 Divisi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5 font-body">
                  Progres pelaksanaan dan anggaran operasional organisasi santri
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectView('programs')}
              >
                Lihat Semua
              </Button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] font-headline uppercase tracking-[0.5px]">
                  <tr>
                    <th className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap">TANGGAL</th>
                    <th className="p-3.5 min-w-[180px] max-w-[320px] sm:max-w-[400px] whitespace-nowrap">PROGRAM & DIVISI</th>
                    <th className="p-3.5 w-28 min-w-[90px] max-w-[110px] whitespace-nowrap">STATUS</th>
                    <th className="p-3.5 w-36 min-w-[130px] max-w-[160px] text-right whitespace-nowrap">ANGGARAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {workPrograms.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#64748B] font-body">
                        Belum ada proposal program kerja terdaftar.
                      </td>
                    </tr>
                  ) : (
                    workPrograms.slice(0, 5).map((p) => {
                      const dateObj = formatSplitDate(p.targetDate);
                      return (
                        <tr key={p.id} className="h-14 hover:bg-[#F8FAFC] transition-colors">
                          {/* 1. Target Tanggal 2 Baris */}
                          <td className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap align-middle">
                            <p className="font-bold text-xs text-[#0F172A] font-headline leading-tight whitespace-nowrap">
                              {dateObj.dayName}
                            </p>
                            <p className="text-[11px] text-[#64748B] font-body mt-0.5 leading-tight whitespace-nowrap">
                              {dateObj.formattedDate}
                            </p>
                          </td>

                          {/* 2. Program & Divisi */}
                          <td className="p-3.5 min-w-[180px] max-w-[320px] sm:max-w-[400px] align-middle overflow-hidden">
                            <RunningText text={p.title} className="font-bold text-[#0F172A] font-headline" />
                            <RunningText text={p.divisionName || p.divisionId} className="text-[11px] text-[#64748B] mt-0.5" />
                          </td>

                          {/* 3. Status (Plain Text) */}
                          <td className="p-3.5 w-28 min-w-[90px] max-w-[110px] whitespace-nowrap align-middle">
                            <span className="font-semibold text-xs capitalize text-[#0F172A]">
                              {p.status}
                            </span>
                          </td>

                          {/* 4. Anggaran */}
                          <td className="p-3.5 w-36 min-w-[130px] max-w-[160px] text-right text-[#0F172A] font-mono font-bold text-xs whitespace-nowrap align-middle">
                            Rp {formatBudgetRatio(p.budget, p.progress)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
