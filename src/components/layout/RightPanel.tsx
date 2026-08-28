import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenisModalLock } from '../../lib/lenis';
import { 
  Bot, 
  ScrollText, 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Activity,
  X,
  PanelRight,
  BookOpen
} from 'lucide-react';
import { IconBox } from '../ui/IconBox';
import { PPIcon, PKIcon } from '../ui/PointIcons';
import { 
  SantriRecord, 
  DormitoryRoom, 
  ALL_OFFICIAL_ROOMS, 
  subscribeToDirectives 
} from '../../lib/firestoreService';
import { 
  ViolationRecord, 
  WorkProgram, 
  MudirDirective 
} from '../../types';
import { ScrollArea } from '../ui/ScrollArea';

interface RightPanelProps {
  students?: SantriRecord[];
  violations?: ViolationRecord[];
  workPrograms?: WorkProgram[];
  rooms?: DormitoryRoom[];
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectivesView: () => void;
}

interface ActivityFeedItem {
  id: string;
  type: 'violation' | 'achievement' | 'hafalan' | 'directive' | 'program';
  title: string;
  subtitle: string;
  points?: number;
  isPK?: boolean;
  isPP?: boolean;
  time: string;
  sortTimestamp: number;
}

// Helper parsing tanggal fleksibel ke timestamp
const parseDateToTimestamp = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const monthMap: Record<string, number> = {
    januari: 0, jan: 0, februari: 1, feb: 1, maret: 2, mar: 2, april: 3, apr: 3,
    mei: 4, may: 4, juni: 5, jun: 5, juli: 6, jul: 6, agustus: 7, agu: 7, ags: 7,
    september: 8, sep: 8, oktober: 9, okt: 9, november: 10, nov: 10, desember: 11, des: 11,
  };
  const parts = dateStr.trim().toLowerCase().split(/[\s,.-/]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = monthMap[parts[1]] !== undefined ? monthMap[parts[1]] : parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day).getTime();
    }
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
};

export const RightPanel: React.FC<RightPanelProps> = ({ 
  students = [],
  violations = [],
  workPrograms = [],
  rooms = ALL_OFFICIAL_ROOMS,
  isOpen, 
  onClose, 
  onOpenDirectivesView 
}) => {
  useLenisModalLock(isOpen);

  // Live Mudir Directives subscription directly from Firestore database
  const [directives, setDirectives] = useState<MudirDirective[]>([]);

  useEffect(() => {
    const unsub = subscribeToDirectives((data) => {
      setDirectives(data);
    });
    return () => unsub();
  }, []);

  // Dynamic week info following current system date (e.g., Pkn 4, Agustus)
  const getCurrentWeekInfo = () => {
    const now = new Date();
    const date = now.getDate();
    const weekNum = Math.ceil(date / 7);
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = monthNames[now.getMonth()];
    return `Pkn ${weekNum}, ${monthName}`;
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Swipe right on drawer to close
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current.time || e.changedTouches.length !== 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current.time = 0;

    // Swipe right (deltaX > 40) closes right panel
    if (deltaX > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 500) {
      onClose();
    }
  };

  // 1. Live AI ODP Assistant Calculation from Real Database
  const aiSummary = useMemo(() => {
    const totalSantri = students.length;
    const activeViolations = violations.filter(
      v => v.status === 'proses' || v.status === 'pending'
    ).length;
    const cleanStudents = students.filter(
      s => (s.poinPelanggaran || 0) === 0
    ).length;
    const cleanPercentage = totalSantri > 0 
      ? ((cleanStudents / totalSantri) * 100).toFixed(1) 
      : '100';

    const totalSetoran = students.reduce(
      (acc, s) => acc + (s.hafalanHistory?.length || 0), 
      0
    );
    const totalPP = students.reduce(
      (acc, s) => acc + (s.poinPrestasi || 0), 
      0
    );

    let status = 'Kondusif';
    let statusColor = 'text-[#059669]';
    if (activeViolations > 5) {
      status = 'Perlu Evaluasi';
      statusColor = 'text-[#DC2626]';
    } else if (activeViolations > 2) {
      status = 'Perlu Perhatian';
      statusColor = 'text-[#CA8A04]';
    } else if (cleanStudents === totalSantri && totalSantri > 0) {
      status = 'Sangat Tertib';
      statusColor = 'text-[#059669]';
    }

    let text = '';
    if (totalSantri === 0) {
      text = 'Database santri siap disinkronkan. Belum ada catatan rekapitulasi aktif.';
    } else {
      text = `Kedisiplinan ${totalSantri} santri terpantau ${status.toLowerCase()}. ${
        activeViolations > 0
          ? `${activeViolations} kasus aktif membutuhkan tindak lanjut mahkamah.`
          : 'Seluruh rekam kasus terselesaikan dengan tertib.'
      } Tercatat ${totalSetoran} riwayat mutaba'ah tahfizh dan ${totalPP} akumulasi PP santri.`;
    }

    return {
      status,
      statusColor,
      text,
      cleanPercentage,
      activeViolations,
      totalSetoran,
      totalPP,
      totalSantri,
    };
  }, [students, violations]);

  // 2. Live Top 3 Kamar Terbaik from Real Database (Hanya yang memiliki PP > 0)
  const topRooms = useMemo(() => {
    const roomList = (rooms && rooms.length > 0) ? rooms : ALL_OFFICIAL_ROOMS;
    return roomList.map(r => {
      const indah = r.aestheticScore || 0;
      const rapi = r.neatnessScore || 0;
      const bersih = r.cleanlinessScore || 0;
      const totalPP = indah + rapi + bersih;
      return {
        id: r.id,
        roomName: r.roomName,
        dormitoryName: r.dormitoryName,
        totalPP,
        indah,
        rapi,
        bersih,
      };
    })
    .filter(r => r.totalPP > 0)
    .sort((a, b) => b.totalPP - a.totalPP)
    .slice(0, 3);
  }, [rooms]);

  // 3. Live Active Directives from Real Database
  const activeDirectives = useMemo(() => {
    return directives
      .filter(d => d.status !== 'selesai' && d.status !== 'arsip')
      .slice(0, 2);
  }, [directives]);

  // 4. Live Activity Feed Aggregation from Real Database
  const activityFeed = useMemo(() => {
    const list: ActivityFeedItem[] = [];

    // Kasus Pelanggaran Riil
    violations.slice(0, 6).forEach(v => {
      list.push({
        id: `viol-${v.id}`,
        type: 'violation',
        title: `${v.santriName || 'Santri'} — ${v.violation}`,
        subtitle: `${v.category || 'Pelanggaran'} • +${v.points}`,
        points: v.points,
        isPK: true,
        time: v.date || 'Hari Ini',
        sortTimestamp: parseDateToTimestamp(v.date),
      });
    });

    // Prestasi Santri Riil (Hanya yang memiliki PP > 0)
    students.forEach(s => {
      const studentName = s.studentName || (s as any).nama || (s as any).name || 'Santri';
      if (s.achievementsHistory && s.achievementsHistory.length > 0) {
        s.achievementsHistory
          .filter(ach => (ach.points !== undefined ? ach.points : 10) > 0)
          .slice(0, 3)
          .forEach(ach => {
            list.push({
              id: `ach-${ach.id}`,
              type: 'achievement',
              title: `${studentName} meraih ${ach.title || 'Prestasi'}`,
              subtitle: `${ach.category || 'Prestasi'} • +${ach.points !== undefined ? ach.points : 10}`,
              points: ach.points !== undefined ? ach.points : 10,
              isPP: true,
              time: ach.date || 'Bulan Ini',
              sortTimestamp: parseDateToTimestamp(ach.date),
            });
          });
      }
    });

    // Setoran Mutaba'ah Riil
    students.forEach(s => {
      const studentName = s.studentName || (s as any).nama || (s as any).name || 'Santri';
      if (s.hafalanHistory && s.hafalanHistory.length > 0) {
        s.hafalanHistory.slice(0, 3).forEach(rec => {
          list.push({
            id: `haf-${rec.id}`,
            type: 'hafalan',
            title: `${studentName} setor ${rec.surahName || 'Al-Qur\'an'}`,
            subtitle: `${rec.type || 'Ziyadah'} (Juz ${rec.juz || 1}${rec.ayahStart && rec.ayahEnd ? `, Ayat ${rec.ayahStart}-${rec.ayahEnd}` : ''}) • ${rec.totalPages || 1} Hal.`,
            time: rec.date || 'Hari Ini',
            sortTimestamp: parseDateToTimestamp(rec.date),
          });
        });
      }
    });

    // Instruksi Mudir Riil
    directives.slice(0, 3).forEach(dir => {
      list.push({
        id: `dir-${dir.id}`,
        type: 'directive',
        title: `Instruksi: ${dir.title || 'Arahan Mudir'}`,
        subtitle: `Prioritas ${dir.priority || 'Umum'} • ${dir.targetDivision || 'Semua Divisi'}`,
        time: dir.issuedDate || 'Hari Ini',
        sortTimestamp: parseDateToTimestamp(dir.issuedDate),
      });
    });

    // Program Kerja Riil
    workPrograms.slice(0, 3).forEach(prog => {
      list.push({
        id: `prog-${prog.id}`,
        type: 'program',
        title: `Program: ${prog.title || 'Program Kerja'}`,
        subtitle: `${prog.division || 'Divisi'} • Progress ${prog.progress ?? 0}%`,
        time: prog.targetDate || 'Tahun Ini',
        sortTimestamp: parseDateToTimestamp(prog.targetDate),
      });
    });

    // Urutkan berdasarkan waktu kronologis terbaru
    return list
      .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
      .slice(0, 6);
  }, [violations, students, directives, workPrograms]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Layer with blur and darkness */}
          <motion.div
            key="right-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Overlay Slide-over Drawer Panel */}
          <motion.aside
            key="right-panel-drawer"
            data-rightpanel="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onTouchStart={handleDrawerTouchStart}
            onTouchEnd={handleDrawerTouchEnd}
            className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[380px] bg-[#FFFFFF] border-l border-[#E2E8F0] shadow-[0_8px_32px_rgba(15,23,42,0.18)] flex flex-col font-body"
          >
            {/* Header Drawer */}
            <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <PanelRight className="w-4 h-4 text-[#0F172A]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] font-headline tracking-tight">
                    Info Panel ODP
                  </h3>
                  <p className="text-[10px] text-[#64748B] font-medium">
                    Monitoring ringkas santri & divisi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors cursor-pointer active:scale-[0.97]"
                title="Tutup Info Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Panel Body with Single Clean Dividers between categories */}
            <ScrollArea
              className="flex-1"
              viewportClassName="p-6 space-y-6"
              topOffset="top-4"
              bottomOffset="bottom-4"
            >
              
              {/* Kategori 1: AI Assistant Summary Section (Unboxed, Data Riil) */}
              <div className="space-y-2 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#059669]/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#059669]" />
                    </div>
                    <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-headline">
                      AI ODP Assistant
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${aiSummary.statusColor}`}>
                    {aiSummary.status}
                  </span>
                </div>

                <p className="text-xs text-[#334155] leading-relaxed font-body">
                  {aiSummary.text}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                  <span className="flex items-center gap-1 text-[#059669] font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> {aiSummary.cleanPercentage}% Santri Bebas PK
                  </span>
                  <span className="text-[#0F172A] font-semibold">Real-Time Sync</span>
                </div>
              </div>

              {/* Kategori 2: Mudir Directives Section (Data Riil Firestore) */}
              <div className="space-y-3 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                    <ScrollText className="w-4 h-4 text-[#0F172A]" />
                    Instruksi Mudir
                  </h3>
                  <button 
                    onClick={() => {
                      onOpenDirectivesView();
                      onClose();
                    }}
                    className="text-[11px] text-[#059669] font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Lihat Semua <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {activeDirectives.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-1 font-body">
                    Belum ada arahan aktif Mudir di database
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeDirectives.map((dir) => (
                      <div
                        key={dir.id}
                        className="p-3 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            dir.priority === 'tinggi' 
                              ? 'text-[#DC2626]' 
                              : dir.priority === 'sedang' 
                              ? 'text-[#CA8A04]' 
                              : 'text-[#059669]'
                          }`}>
                            Prioritas {dir.priority}
                          </span>
                          <span className="text-[10px] text-[#64748B]">{dir.issuedDate}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1 font-headline">
                          {dir.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                          {dir.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kategori 3: Room Cleanliness Top Leaderboard Section (Data Riil Rooms) */}
              <div className="space-y-3 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                    <Trophy className="w-4 h-4 text-[#0F172A]" />
                    Top Kamar Terbaik
                  </h3>
                  <span className="text-[10px] text-[#64748B] font-medium">
                    {getCurrentWeekInfo()}
                  </span>
                </div>

                {topRooms.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-1 font-body">
                    Belum ada data evaluasi kamar di database
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topRooms.map((room, idx) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-[#EAB308]/20 text-[#CA8A04]' : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0F172A] font-headline">{room.roomName}</p>
                            <p className="text-[10px] text-[#64748B]">{room.dormitoryName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-xs font-bold text-[#0F172A]">
                            <span>{room.totalPP}</span>
                            <PPIcon className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[9px] text-[#64748B] font-medium mt-0.5">
                            {room.indah} ind • {room.rapi} rap • {room.bersih} ber
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kategori 4: Activity Feed Section (Data Riil Database) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                    <Activity className="w-4 h-4 text-[#0F172A]" />
                    Catatan Aktivitas
                  </h3>
                  <span className="text-[10px] text-[#64748B] font-medium">Terbaru</span>
                </div>

                {activityFeed.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-1 font-body">
                    Belum ada catatan aktivitas database
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activityFeed.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 p-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                      >
                        <IconBox 
                          size="sm" 
                          bgClass={
                            item.type === 'violation' 
                              ? 'bg-[#EF4444]/10 text-[#DC2626]' 
                              : item.type === 'achievement'
                              ? 'bg-[#EAB308]/10 text-[#CA8A04]'
                              : item.type === 'hafalan'
                              ? 'bg-[#3B82F6]/10 text-[#2563EB]'
                              : item.type === 'directive'
                              ? 'bg-[#8B5CF6]/10 text-[#7C3AED]'
                              : 'bg-[#059669]/10 text-[#059669]'
                          }
                        >
                          {item.type === 'violation' ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : item.type === 'achievement' ? (
                            <Trophy className="w-3.5 h-3.5" />
                          ) : item.type === 'hafalan' ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : item.type === 'directive' ? (
                            <ScrollText className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </IconBox>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0F172A] leading-snug line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mt-0.5">
                            <span className="truncate">{item.subtitle}</span>
                            {item.isPK && item.points !== undefined && (
                              <PKIcon className="w-3 h-3 text-[#DC2626] inline-block" />
                            )}
                            {item.isPP && item.points !== undefined && (
                              <PPIcon className="w-3 h-3 text-[#059669] inline-block" />
                            )}
                          </div>
                          <p className="text-[9px] text-[#94A3B8] mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
