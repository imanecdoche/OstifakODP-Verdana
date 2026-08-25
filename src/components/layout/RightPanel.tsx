import React, { useEffect } from 'react';
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
  PanelRight
} from 'lucide-react';
import { 
  mockMudirDirectives, 
  mockNotifications, 
  mockRoomCleanliness 
} from '../../data/mockData';
import { IconBox } from '../ui/IconBox';

import { DormitoryRoom, ALL_OFFICIAL_ROOMS } from '../../lib/firestoreService';
import { ScrollArea } from '../ui/ScrollArea';

interface RightPanelProps {
  rooms?: DormitoryRoom[];
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectivesView: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
  isOpen, 
  onClose, 
  onOpenDirectivesView 
}) => {
  useLenisModalLock(isOpen);
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
  const touchStartRef = React.useRef({ x: 0, y: 0, time: 0 });

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
            className="fixed inset-0 z-40 bg-[#0F172A]/40 backdrop-blur-xs"
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
              
              {/* Kategori 1: AI Assistant Summary Section (Unboxed) */}
              <div className="space-y-2 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#059669]/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#059669]" />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-headline">
                    AI ODP Assistant
                  </span>
                </div>

                <p className="text-xs text-[#334155] leading-relaxed font-body">
                  Disiplin santri pekan ini dalam status <strong className="text-[#059669] font-semibold">Kondusif</strong>. Rekomendasi tindakan cepat pada evaluasi sidang Divisi Keamanan.
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                  <span className="flex items-center gap-1 text-[#059669] font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> 98.4% Shalat Berjamaah
                  </span>
                  <span className="text-[#0F172A] font-semibold">Aktif</span>
                </div>
              </div>

              {/* Kategori 2: Mudir Directives Section */}
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

                {mockMudirDirectives.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-1 font-body">
                    Belum ada arahan aktif Mudir
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mockMudirDirectives.slice(0, 2).map((dir) => (
                      <div
                        key={dir.id}
                        className="p-3 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-semibold uppercase ${dir.priority === 'tinggi' ? 'text-[#DC2626]' : 'text-[#CA8A04]'}`}>
                            Prioritas {dir.priority}
                          </span>
                          <span className="text-[10px] text-[#64748B] ">{dir.issuedDate}</span>
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

              {/* Kategori 3: Room Cleanliness Top Leaderboard Section */}
              <div className="space-y-3 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                    <Trophy className="w-4 h-4 text-[#0F172A]" />
                    Top Kamar Bersih
                  </h3>
                  <span className="text-[10px] text-[#64748B] font-medium ">
                    {getCurrentWeekInfo()}
                  </span>
                </div>

                {mockRoomCleanliness.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-1 font-body">
                    Belum ada data inspeksi kamar
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mockRoomCleanliness.slice(0, 3).map((room, idx) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            (room.rank || idx + 1) === 1 ? 'bg-[#EAB308]/20 text-[#CA8A04]' : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}>
                            #{room.rank || idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0F172A] font-headline">{room.roomName}</p>
                            <p className="text-[10px] text-[#64748B]">{room.building}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#0F172A]">{room.score} Pts</span>
                          <p className="text-[9px] text-[#16A34A] font-medium uppercase">Clean</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kategori 4: Activity Feed Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                    <Activity className="w-4 h-4 text-[#0F172A]" />
                    Catatan Aktivitas
                  </h3>
                </div>

                {mockNotifications.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-1 font-body">
                    Belum ada notifikasi baru
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start gap-2.5 p-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                      >
                        <IconBox size="sm" bgClass={notif.type === 'violation' ? 'bg-[#EF4444]/10 text-[#DC2626]' : 'bg-[#059669]/10 text-[#059669]'}>
                          {notif.type === 'violation' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </IconBox>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#0F172A] leading-snug">{notif.title}</p>
                          <p className="text-[10px] text-[#64748B] mt-0.5">{notif.time}</p>
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
