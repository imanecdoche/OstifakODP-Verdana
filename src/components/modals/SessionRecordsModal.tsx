import React, { useState, useEffect, useMemo } from 'react';
import { 
  getStoredSessionRecords, 
  recordLoginSession, 
  formatDurationFromTimestamps,
  SessionRecord 
} from '../../lib/sessionLogService';
import { ScrollArea } from '../ui/ScrollArea';
import { UserProfile } from '../../types';

interface SessionRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
}

export const SessionRecordsModal: React.FC<SessionRecordsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Load real records & keep updated
  const loadRecords = () => {
    let list = getStoredSessionRecords();
    // If no records stored yet but user is active, initialize real session
    if (list.length === 0 && currentUser) {
      const live = recordLoginSession(currentUser);
      list = [live];
    }
    setRecords(list);

    // Expand the first active session by default if not set
    if (list.length > 0) {
      setExpandedSessionIds((prev) => {
        if (Object.keys(prev).length === 0) {
          return { [list[0].id]: true };
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen, currentUser]);

  // Listen to window events when real action logs are added
  useEffect(() => {
    const handleUpdate = () => {
      loadRecords();
    };
    window.addEventListener('ostifak_session_records_updated', handleUpdate);
    return () => window.removeEventListener('ostifak_session_records_updated', handleUpdate);
  }, [currentUser]);

  // Live timer for active session duration counter
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleExpand = (id: string) => {
    setExpandedSessionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain font-body"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-[96vw] xl:max-w-7xl max-h-[94dvh] flex flex-col rounded-xl shadow-[0_20px_70px_rgba(15,23,42,0.35)] border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (Murni Tanpa Ikon) */}
        <div className="bg-[#142A18] text-white px-6 py-5 flex items-center justify-between border-b border-emerald-950/40 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/40">
                AUDIT KEAMANAN & SESI RILL
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Total {filteredRecords.length} Sesi Rill Tercatat
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold font-headline tracking-tight text-white mt-1">
              Rekam Sesi Login & Log Aktivitas
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Data autentikasi real-time, metadata sistem perangkat, IP jaringan, dan log kronologis aktivitas akun.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-white/20 text-white/90 hover:text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            title="Tutup Jendela"
          >
            TUTUP
          </button>
        </div>

        {/* 2. Toolbar & Filter (Murni Tanpa Ikon) */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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

        {/* 3. Table & Nested Action Logs Body */}
        <ScrollArea 
          className="flex-1 min-h-0 bg-white"
          viewportClassName="p-4 sm:p-6 space-y-4"
          topOffset="top-3"
          bottomOffset="bottom-3"
        >
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-sm font-bold text-slate-700">Belum ada riwayat sesi yang tercatat</p>
              <p className="text-xs text-slate-500 mt-1">Setiap kali login sukses dilakukan, sesi rill akan tercatat otomatis di sini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((session, index) => {
                const isExpanded = !!expandedSessionIds[session.id];
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            isExpanded
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isExpanded ? '[-] TUTUP RINCIAN' : '[+] BUKA RINCIAN'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Section: Full Technical Detail & Actions Log */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">
                        
                        {/* Detail Info Grid Box */}
                        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.5px] mb-3">
                            DETAIL METADATA JARINGAN & PERANGKAT LENGKAP
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">ALAMAT IP (HOST/GATEWAY)</p>
                              <p className="font-mono font-bold text-slate-800">{session.ipAddress}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">ALAMAT MAC / IDENTIFIER</p>
                              <p className="font-mono font-bold text-slate-800">{session.macAddress}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">KOORDINAT GPS PRESISI</p>
                              <p className="font-mono font-bold text-slate-800">{session.coordinates}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">LOKASI FISIK AKSES</p>
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
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                                    <th className="py-2.5 px-4 w-12">NO</th>
                                    <th className="py-2.5 px-4 w-32">WAKTU (DETIK)</th>
                                    <th className="py-2.5 px-4 w-48">MODUL / HALAMAN</th>
                                    <th className="py-2.5 px-4 w-48">TIPE AKTIVITAS</th>
                                    <th className="py-2.5 px-4">DESKRIPSI TINDAKAN</th>
                                    <th className="py-2.5 px-4 w-28 text-right">STATUS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {session.actions.map((act, actIdx) => (
                                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                                      <td className="py-3 px-4 font-bold text-slate-400">
                                        {actIdx + 1}
                                      </td>
                                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                        {act.time}
                                      </td>
                                      <td className="py-3 px-4 font-semibold text-slate-800">
                                        {act.module}
                                      </td>
                                      <td className="py-3 px-4 text-slate-700">
                                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium">
                                          {act.actionType}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-slate-600 leading-relaxed">
                                        {act.description}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                          act.status === 'Sukses'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : act.status === 'Terverifikasi'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : act.status === 'Peringatan'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-rose-100 text-rose-800 border border-rose-200'
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

        {/* 4. Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div>
            Data sesi login tercatat secara real-time dari perangkat yang aktif saat ini.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
          >
            TUTUP MODUL
          </button>
        </div>
      </div>
    </div>
  );
};
