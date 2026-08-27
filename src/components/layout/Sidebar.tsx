import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  ShieldAlert, 
  ScrollText, 
  MessageSquare, 
  Building2, 
  BookOpen, 
  Languages, 
  Sparkles, 
  HeartPulse, 
  Wallet,
  X,
  SlidersHorizontal,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Trophy
} from 'lucide-react';
import { UserProfile, DivisionId } from '../../types';
import { mockDivisions } from '../../data/mockData';
import { ScrollArea } from '../ui/ScrollArea';
import { APP_VERSION_INFO } from '../../config/version';

interface SidebarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  selectedDivision: DivisionId | null;
  onSelectDivision: (divId: DivisionId | null) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onLogout,
  activeView,
  onSelectView,
  selectedDivision,
  onSelectDivision,
  isOpenMobile,
  onCloseMobile,
}) => {
  const getDivisionIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Languages': return <Languages className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Profil Santri', icon: <Users className="w-4 h-4" /> },
    { id: 'achievements', label: 'Prestasi Santri', icon: <Trophy className="w-4 h-4" /> },
    { id: 'dormitory', label: 'Asrama', icon: <Building2 className="w-4 h-4" /> },
    { id: 'classes', label: 'Kelas', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'violations', label: 'Pelanggaran & Mahkamah', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'programs', label: 'Program Kerja Divisi', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'directives', label: 'Instruksi Mudir', icon: <ScrollText className="w-4 h-4" /> },
  ];

  // Gesture Swipe Left to close Mobile Sidebar
  const touchStartRef = React.useRef({ x: 0, y: 0, time: 0 });

  const handleSidebarTouchStart = (e: React.TouchEvent) => {
    if (!isOpenMobile || e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleSidebarTouchEnd = (e: React.TouchEvent) => {
    if (!isOpenMobile || !touchStartRef.current.time || e.changedTouches.length !== 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current.time = 0;

    // Swipe left (deltaX < -40) closes mobile sidebar
    if (deltaX < -40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 500) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#0F172A]/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        data-sidebar="true"
        onTouchStart={handleSidebarTouchStart}
        onTouchEnd={handleSidebarTouchEnd}
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] lg:w-[220px] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-[0_8px_32px_rgba(15,23,42,0.15)]' : '-translate-x-full'
        }`}
      >
        {/* Brand Header: Eksklusif Logo SVG Saja (Tanpa Teks OSDIGI) */}
        <div className="relative h-16 lg:h-14 px-4 border-b border-[#E2E8F0] flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Logo OSTIFAK"
            className="w-10 h-10 object-contain drop-shadow-xs select-none"
          />
          <button
            onClick={onCloseMobile}
            className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden w-8 h-8 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer active:scale-95"
            title="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Navigation Scroll Area */}
        <ScrollArea
          className="flex-1"
          viewportClassName="p-3 space-y-5"
          topOffset="top-3"
          bottomOffset="bottom-3"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.5px] px-2.5 mb-1.5 font-headline">
              Navigasi Utama
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = activeView === item.id && selectedDivision === null;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onSelectDivision(null);
                      onCloseMobile();
                    }}
                    className={`w-full h-8.5 lg:h-8 flex items-center justify-between px-2.5 rounded-md text-[11.5px] transition-all duration-160 cursor-pointer active:scale-[0.97] ${
                      isActive
                        ? 'bg-[#0F172A] text-white font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={isActive ? 'text-[#059669]' : 'text-[#64748B]'} shrink-0>
                        {item.icon}
                      </span>
                      <span className="truncate whitespace-nowrap leading-none">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.5px] font-headline">
                Divisi OSTIFAK (9)
              </p>
              <SlidersHorizontal className="w-3 h-3 text-[#94A3B8]" />
            </div>
            <nav className="space-y-0.5">
              {mockDivisions.map((div) => {
                const isActive = selectedDivision === div.id;
                return (
                  <button
                    key={div.id}
                    onClick={() => {
                      onSelectDivision(div.id);
                      onCloseMobile();
                    }}
                    className={`w-full h-8 lg:h-7.5 flex items-center justify-between px-2.5 rounded-md text-[11.5px] transition-all duration-160 cursor-pointer active:scale-[0.97] ${
                      isActive
                        ? 'bg-[#0F172A] text-white font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={isActive ? 'text-[#059669]' : 'text-[#64748B]'} shrink-0>
                        {getDivisionIcon(div.iconName)}
                      </span>
                      <span className="truncate whitespace-nowrap leading-none">{div.name}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </ScrollArea>

        {/* Bottom Sidebar: Menu SIAPA AKU & Versi Aplikasi */}
        <div className="p-3 px-4 border-t border-[#E2E8F0] bg-white flex flex-col items-center justify-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              onSelectView('whoami');
              onSelectDivision(null);
              onCloseMobile();
            }}
            className={`w-full py-2 px-3 text-center text-xs uppercase tracking-wider font-headline font-bold transition-colors cursor-pointer rounded-md ${
              activeView === 'whoami' && selectedDivision === null
                ? 'text-[#0F172A] bg-slate-100 font-extrabold shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            SIAPA AKU
          </button>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight select-none">
            {APP_VERSION_INFO.version}
          </span>
        </div>
      </aside>
    </>
  );
};
