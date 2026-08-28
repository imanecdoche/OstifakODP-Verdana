import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  getStoredSessionRecords, 
  recordLoginSession, 
  formatDurationFromTimestamps,
  subscribeToSessionRecords,
  SessionRecord 
} from '../../lib/sessionLogService';
import { ScrollArea } from '../ui/ScrollArea';
import { Button } from '../ui/Button';
import { UserProfile } from '../../types';

interface SessionRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
}

const RunningText: React.FC<{
  text: string;
  className?: string;
  maxWidthClass?: string;
}> = ({
  text,
  className = '',
  maxWidthClass = 'max-w-[160px] sm:max-w-[240px] md:max-w-none',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [overflowDistance, setOverflowDistance] = React.useState(0);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        if (contentWidth > containerWidth + 3) {
          setIsOverflowing(true);
          setOverflowDistance(contentWidth - containerWidth + 12);
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

  const duration = Math.max(3.5, Math.min(10, overflowDistance / 14));

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap ${maxWidthClass} ${className}`}
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

export const SessionRecordsModal: React.FC<SessionRecordsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Real-time live subscription to multi-device session records
  useEffect(() => {
    if (!isOpen) return;

    const unsub = subscribeToSessionRecords((liveList) => {
      let list = liveList;
      if (list.length === 0 && currentUser) {
        const live = recordLoginSession(currentUser);
        list = [live];
      }
      setRecords(list);
      if (list.length > 0) {
        setExpandedSessionId((prev) => prev ?? list[0].id);
      }
    });

    return () => unsub();
  }, [isOpen, currentUser]);

  // Live timer for active session duration counter
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    const handleCustomEscape = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ostifak-escape-pressed', handleCustomEscape);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [isOpen, onClose]);

  const toggleExpand = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Status filter
      if (statusFilter === 'active' && !rec.isActive) return false;
      if (statusFilter === 'ended' && rec.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMain =
          rec.accountName.toLowerCase().includes(q) ||
          rec.accountEmail.toLowerCase().includes(q) ||
          rec.devicePc.toLowerCase().includes(q) ||
          rec.browser.toLowerCase().includes(q) ||
          rec.ipAddress.toLowerCase().includes(q) ||
          rec.locationName.toLowerCase().includes(q);

        const matchesActions = rec.actions.some(
          (act) =>
            act.module.toLowerCase().includes(q) ||
            act.actionType.toLowerCase().includes(q) ||
            act.description.toLowerCase().includes(q)
        );

        return matchesMain || matchesActions;
      }

      return true;
    });
  }, [records, searchQuery, statusFilter]);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      data-modal="true"
      data-lenis-prevent
      className="fixed inset-0 z-50 w-full h-full min-h-[100dvh] bg-white flex flex-col font-body animate-in fade-in duration-150 overflow-hidden"
    >
      {/* 1. Header (Clean Flat Header, Zero Icon Policy) */}
      <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0] shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-headline tracking-tight text-[#0F172A]">
              Rekam Sesi Login & Log Aktivitas
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Audit log autentikasi dan aktivitas sesi pengurus
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
          >
            Tutup Log
          </Button>
        </div>
      </div>

      {/* 2. Toolbar & Filter (Murni Tanpa Ikon) */}
      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari akun, IP, perangkat, atau aksi..."
              className="w-full h-9 px-3 bg-white border border-slate-300 focus:border-slate-800 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Filter Status Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-1">
              STATUS:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua Sesi
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Sesi Aktif
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ended')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'ended'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>
      </div>

      {/* 3. Table & Nested Action Logs Body */}
      <ScrollArea 
        className="flex-1 min-h-0 bg-white"
        viewportClassName="p-4 sm:p-6 pb-8 sm:pb-6 space-y-4 max-w-7xl mx-auto w-full"
        topOffset="top-3"
        bottomOffset="bottom-3"
      >
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-bold text-slate-700">Belum ada riwayat sesi yang tercatat</p>
              <p className="text-xs text-slate-500 mt-1">Setiap kali login sukses dilakukan, sesi rill akan tercatat otomatis di sini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((session, index) => {
                const isExpanded = expandedSessionId === session.id;
                const isCurrentAccount = currentUser && session.accountEmail.toLowerCase() === (currentUser.email || '').toLowerCase();
                const liveDuration = session.isActive
                  ? formatDurationFromTimestamps(session.loginTimestamp, nowTimestamp)
                  : session.duration;

                return (
                  <div
                    key={session.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      session.isActive
                        ? 'border-emerald-500/60 bg-emerald-50/15 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Main Row / Header Sesi */}
                    <div
                      onClick={() => toggleExpand(session.id)}
                      className="p-4 sm:p-5 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Left: Identitas Akun & Tanggal */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold text-slate-900 font-headline">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900 font-headline">
                            {session.accountName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            ({session.accountEmail})
                          </span>
                          {session.isActive ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SEDANG AKTIF
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              SELESAI
                            </span>
                          )}
                          {isCurrentAccount && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                              SESI ANDA SAAT INI
                            </span>
                          )}
                        </div>

                        {/* Metadata Ringkas */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px] uppercase">WAKTU MASUK</span>
                            <span className="font-bold text-slate-800">{session.dateDay}</span>
                            <span className="text-slate-500 block font-mono text-[11px]">{session.loginTime}</span>
                          </div>

                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px] uppercase">DURASI BERJALAN</span>
                            <span className="font-bold text-slate-800">{liveDuration}</span>
                            {session.logoutTime && (
                              <span className="text-slate-500 block text-[11px]">Keluar: {session.logoutTime}</span>
                            )}
                          </div>

                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px] uppercase">PERANGKAT & BROWSER</span>
                            <span className="font-medium text-slate-800 truncate block">{session.devicePc}</span>
                            <span className="text-slate-500 block text-[11px] truncate">{session.browser}</span>
                          </div>

                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px] uppercase">JARINGAN & LOKASI</span>
                            <span className="font-mono text-slate-800 text-[11px] block">{session.ipAddress}</span>
                            <span className="text-slate-500 block text-[11px] truncate">{session.locationName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Expand / Collapse Toggle Button */}
                      <div className="shrink-0 flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                            TOTAL AKSI
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {session.actions.length} Tindakan Rill
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                          title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Section: Full Technical Detail & Actions Log */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
                        
                        {/* Detail Metadata (Unboxed / Tanpa Kontainer Kotak) */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.5px]">
                            METADATA
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ALAMAT IP (HOST/GATEWAY)</p>
                              <p className="font-mono font-bold text-slate-800">{session.ipAddress}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ALAMAT MAC / IDENTIFIER</p>
                              <p className="font-mono font-bold text-slate-800">{session.macAddress}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">KOORDINAT GPS PRESISI</p>
                              <p className="font-mono font-bold text-slate-800">{session.coordinates}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">LOKASI FISIK AKSES</p>
                              <p className="font-semibold text-slate-800">{session.locationName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Nested Actions Table */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.5px]">
                              DAFTAR AKSI & AKTIVITAS DALAM SESI INI
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              Urutan kronologis dari jam masuk
                            </span>
                          </div>

                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                            <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto overflow-x-auto">
                              <table className="w-auto min-w-full text-left text-xs border-collapse">
                                <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                  <tr className="border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap bg-slate-100">NO</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">WAKTU (DETIK)</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap max-w-[130px] sm:max-w-[180px] md:max-w-none bg-slate-100">MODUL / HALAMAN</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap max-w-[130px] sm:max-w-[170px] md:max-w-none bg-slate-100">TIPE AKTIVITAS</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap max-w-[200px] sm:max-w-[300px] md:max-w-[420px] lg:max-w-none bg-slate-100">DESKRIPSI TINDAKAN</th>
                                    <th className="py-2.5 px-3 w-28 text-right whitespace-nowrap bg-slate-100">STATUS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {session.actions.map((act, actIdx) => (
                                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                                      <td className="py-2.5 px-3 font-bold text-slate-400 text-center whitespace-nowrap">
                                        {actIdx + 1}
                                      </td>
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                                        {act.time}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <RunningText
                                          text={act.module}
                                          maxWidthClass="max-w-[110px] sm:max-w-[160px] md:max-w-none"
                                          className="font-semibold text-slate-800"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <RunningText
                                          text={act.actionType}
                                          maxWidthClass="max-w-[110px] sm:max-w-[150px] md:max-w-none"
                                          className="font-medium text-slate-700"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <RunningText
                                          text={act.description}
                                          maxWidthClass="max-w-[180px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-none"
                                          className="text-slate-600"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                        <span className={`text-[11px] font-semibold tracking-wider ${
                                          act.status === 'Sukses'
                                            ? 'text-[#059669]'
                                            : act.status === 'Terverifikasi'
                                            ? 'text-blue-600'
                                            : act.status === 'Peringatan'
                                            ? 'text-amber-600'
                                            : 'text-[#EF4444]'
                                        }`}>
                                          {act.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
    </div>
  );
};
