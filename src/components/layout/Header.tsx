import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  ChevronRight, 
  PanelRightOpen, 
  PanelRightClose, 
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { UserProfile, DivisionId } from '../../types';
import { mockDivisions } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SessionRecordsModal } from '../modals/SessionRecordsModal';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout?: () => void;
  activeView: string;
  selectedDivision: DivisionId | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenMobileSidebar: () => void;
  onOpenNewModal?: () => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  activeView,
  selectedDivision,
  searchQuery,
  onSearchChange,
  onOpenMobileSidebar,
  onOpenNewModal,
  isRightPanelOpen,
  onToggleRightPanel,
  unreadCount,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isSessionRecordsModalOpen, setIsSessionRecordsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchBoxExpanded, setIsSearchBoxExpanded] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeSearch = () => {
    setIsSearchOpen(false);
    if (searchCollapseTimerRef.current) clearTimeout(searchCollapseTimerRef.current);
    searchCollapseTimerRef.current = setTimeout(() => setIsSearchBoxExpanded(false), 300);
  };

  // Collapse global search to icon-only when clicking anywhere outside it
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isSearchOpen]);

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        avatarButtonRef.current &&
        !avatarButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen]);

  // Close settings dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setIsSettingsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsMenuOpen(false);
      }
    };

    if (isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsMenuOpen]);

  const getBreadcrumbTitle = () => {
    if (selectedDivision) {
      const div = mockDivisions.find((d) => d.id === selectedDivision);
      return div ? div.name : 'Detail Divisi';
    }
    switch (activeView) {
      case 'students': return 'Profil Santri';
      case 'dormitory': return 'Daftar Asrama Terdaftar';
      case 'classes': return 'Daftar Kelas Terdaftar';
      case 'violations': return 'Kedisiplinan & Mahkamah';
      case 'programs': return 'Program Kerja & Proposal';
      case 'directives': return 'Instruksi Mudir';
      default: return 'Dashboard';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 flex items-center gap-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex-1 flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer active:scale-[0.97]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            {/* Mobile View: Teks Header Menampilkan Nama App OSDIGI */}
            <div className="lg:hidden">
              <h2 className="text-xl font-black text-[#0F172A] font-headline tracking-tight leading-tight">
                OSDIGI
              </h2>
            </div>

            {/* Desktop View: Menampilkan Judul Breadcrumbs Halaman */}
            <h2 className="hidden lg:block text-lg lg:text-xl font-bold text-[#0F172A] font-headline tracking-tight">
              {getBreadcrumbTitle()}
            </h2>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex-1 flex items-center gap-3 justify-end">
          {/* Global Search (icon-only default, attached to Input Data button, expands leftward) */}
          <div ref={searchWrapRef} className="relative hidden md:block shrink-0">
            <motion.div
              layout
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => {
                if (!isSearchOpen) {
                  if (searchCollapseTimerRef.current) clearTimeout(searchCollapseTimerRef.current);
                  setIsSearchBoxExpanded(true);
                  setIsSearchOpen(true);
                  requestAnimationFrame(() => searchRef.current?.focus());
                }
              }}
              className={`flex items-center h-10 rounded-md cursor-pointer overflow-hidden transition-colors ${
                isSearchBoxExpanded
                  ? 'w-64 lg:w-72 pl-4'
                  : 'w-10 justify-center hover:bg-[#F8FAFC]'
              }`}
            >
              <motion.span layout="position" className="shrink-0">
                <Search className="w-4 h-4 text-[#64748B]" />
              </motion.span>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) closeSearch();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        closeSearch();
                        e.currentTarget.blur();
                      }
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }}
                    exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }}
                    className="w-full h-full min-w-0 ml-3 pr-4 bg-transparent border-none text-xs text-[#0F172A] focus:outline-none font-body"
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Placeholder overlay (outside clipped box so it never stretches) */}
            <AnimatePresence>
              {isSearchOpen && !searchQuery && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.35, ease: 'easeOut', delay: 0.25 },
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
                  className="absolute left-11 top-0 bottom-0 flex items-center whitespace-nowrap text-xs font-bold text-[#64748B] pointer-events-none font-body"
                >
                  Cari Santri (NIS / Nama / Kamar)...
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Right Contextual Panel Toggle */}
          <button
            onClick={onToggleRightPanel}
            className={`shrink-0 h-8 px-3 rounded-md border text-xs font-medium uppercase tracking-[0.5px] transition-all cursor-pointer hidden xl:inline-flex items-center gap-1.5 active:scale-[0.97] ${
              isRightPanelOpen
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
            }`}
            title="Toggle Info Panel"
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
            <span>Info Panel</span>
          </button>

          {/* Notifications Icon Button */}
          <button className="shrink-0 w-8 h-8 rounded-md bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] flex items-center justify-center relative transition-colors cursor-pointer active:scale-[0.97]">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings Icon Button with Dropdown (Rekam Sesi Login) */}
          <div className="relative shrink-0">
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              className={`w-8 h-8 rounded-md border transition-all cursor-pointer flex items-center justify-center active:scale-[0.97] ${
                isSettingsMenuOpen
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border-[#E2E8F0]'
              }`}
              title="Pengaturan Sistem & Rekam Sesi"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Settings Dropdown Menu */}
            {isSettingsMenuOpen && (
              <div
                ref={settingsMenuRef}
                className="absolute right-0 top-11 w-64 bg-white rounded-md shadow-[0_8px_32px_rgba(15,23,42,0.14)] border border-[#E2E8F0] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-body"
                style={{ transformOrigin: 'top right' }}
              >
                <div className="px-3 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    PENGATURAN & AUDIT
                  </p>
                </div>

                <div className="p-1 space-y-0.5">
                  {/* Rekam Sesi Login Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      setIsSessionRecordsModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 text-left rounded-md hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                        Rekam Sesi Login
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Metadata perangkat, IP & log aksi
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                      Audit
                    </span>
                  </button>

                  {/* Preferensi Portal Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-md hover:bg-[#F8FAFC] text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Preferensi Portal</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Popover Window */}
          <div className="relative pl-3 border-l border-[#E2E8F0] shrink-0">
            <button
              ref={avatarButtonRef}
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-8 h-8 rounded-md border transition-all cursor-pointer flex items-center justify-center active:scale-[0.97] ${
                isProfileOpen
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border-[#E2E8F0]'
              }`}
              title="Profil & Pengaturan Akun"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Profile Popover Window */}
            {isProfileOpen && (
              <div
                ref={popupRef}
                className="absolute right-0 top-11 w-72 bg-[#FFFFFF] rounded-md shadow-[0_8px_32px_rgba(15,23,42,0.12)] border border-[#E2E8F0] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-body"
                style={{ transformOrigin: 'top right' }}
              >
                {/* 1. Header Profile Info */}
                <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <h3 className="text-sm font-bold text-[#0F172A] font-headline truncate">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#059669] truncate mt-0.5">
                    {currentUser.role === 'mudir' ? 'Mudir' : currentUser.roleTitle}
                  </p>
                </div>

                {/* 2. Menu Navigation Items */}
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSessionRecordsModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-md hover:bg-[#F8FAFC] text-xs font-medium text-[#0F172A] flex items-center justify-between transition-colors cursor-pointer active:scale-[0.97]"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      <span className="font-semibold text-slate-800">Rekam Sesi Login</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                      Audit
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-md hover:bg-[#F8FAFC] text-xs font-medium text-[#0F172A] flex items-center justify-between transition-colors cursor-pointer active:scale-[0.97]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-[#64748B]" />
                      <span>Pengaturan Akun & Preferensi</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </button>
                </div>

                {/* 3. Footer Logout Action */}
                <div className="p-2 border-t border-[#E2E8F0] bg-[#FFFFFF]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full px-3 py-2 text-left rounded-md hover:bg-[#EF4444]/10 text-xs font-semibold text-[#DC2626] flex items-center gap-2.5 transition-colors cursor-pointer active:scale-[0.97]"
                  >
                    <LogOut className="w-4 h-4 text-[#DC2626]" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Pengaturan Akun & Preferensi"
        subtitle="Kelola informasi profil, preferensi notifikasi, dan tema portal"
      >
        <div className="space-y-4 text-xs font-body text-[#0F172A]">
          {/* Profile Overview */}
          <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
            <h4 className="font-bold text-sm text-[#0F172A] font-headline">{currentUser.name}</h4>
            <p className="text-xs text-[#059669] font-medium mt-0.5">{currentUser.role === 'mudir' ? 'Mudir' : currentUser.roleTitle}</p>
          </div>

          {/* Preferences checklist */}
          <div className="space-y-2">
            <h5 className="font-bold text-xs text-[#0F172A] uppercase tracking-wide font-headline">
              Preferensi Portal
            </h5>

            <div className="p-3 rounded-md border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0F172A]">Notifikasi Arahan Mudir</p>
                <p className="text-[11px] text-[#64748B]">Tampilkan popup saat instruksi baru diterbitkan</p>
              </div>
              <span className="text-[#059669] font-bold">Aktif</span>
            </div>

            <div className="p-3 rounded-md border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0F172A]">Smooth Scrolling (Lenis Engine)</p>
                <p className="text-[11px] text-[#64748B]">Navigasi halus 60fps berbasis inertia physics</p>
              </div>
              <span className="text-[#059669] font-bold">Aktif</span>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Tutup Pengaturan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Near-Fullscreen Session Records Modal (Clean, No Icon) */}
      <SessionRecordsModal
        isOpen={isSessionRecordsModalOpen}
        onClose={() => setIsSessionRecordsModalOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
};
