import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  getCountFromServer,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isOfflineModeActive } from '../../lib/offlineManager';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CollectionStat {
  name: string;
  label: string;
  count: number | null;
  loading: boolean;
  lastUpdated: string | null;
}

interface OpLog {
  type: 'READ' | 'WRITE' | 'DELETE';
  collection: string;
  ts: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const COLLECTIONS: { name: string; label: string }[] = [
  { name: 'pelanggaran', label: 'Pelanggaran' },
  { name: 'santri',      label: 'Direktori Santri' },
  { name: 'proposal',    label: 'Program Kerja' },
  { name: 'directives',  label: 'Instruksi Mudir' },
  { name: 'dormitories', label: 'Asrama' },
  { name: 'classes',     label: 'Kelas' },
];

// Firebase Spark plan free tier limits (per day)
const QUOTA = {
  reads:   { limit: 50_000,  label: 'Reads / hari',   unit: 'operasi' },
  writes:  { limit: 20_000,  label: 'Writes / hari',  unit: 'operasi' },
  deletes: { limit: 20_000,  label: 'Deletes / hari', unit: 'operasi' },
  storage: { limit: 1_073_741_824, label: 'Storage',  unit: 'bytes'   }, // 1 GiB
};

const MAX_LOG = 120;

const nowStr = () =>
  new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

// ─── Sub-component: thin progress bar (Anti-Gravity style) ─────────────────────
const QuotaRow: React.FC<{
  label: string;
  used: number;
  limit: number;
  unit: string;
  isLast?: boolean;
}> = ({ label, used, limit, unit, isLast }) => {
  const pct = Math.min((used / limit) * 100, 100);
  const danger  = pct >= 90;
  const warning = pct >= 70 && pct < 90;
  const barColor = danger  ? '#EF4444'
                 : warning ? '#F59E0B'
                 :           '#0F172A';

  return (
    <div className={`py-3 ${!isLast ? 'border-b border-[#F1F5F9]' : ''}`}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#0F172A]">{label}</span>
        <div className="flex items-baseline gap-2">
          <span
            className="text-xs font-black tabular-nums"
            style={{ color: barColor }}
          >
            {pct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-[#CBD5E1] font-mono tabular-nums">
            {used.toLocaleString('id-ID')} / {limit.toLocaleString('id-ID')} {unit}
          </span>
        </div>
      </div>
      {/* Thin progress track */}
      <div className="h-[2px] w-full bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface FirestoreStatsViewProps {
  isOfflineMode?: boolean;
  onBack?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const FirestoreStatsView: React.FC<FirestoreStatsViewProps> = ({
  isOfflineMode,
  onBack,
}) => {
  const offline = isOfflineMode || isOfflineModeActive();

  const initStats = (): CollectionStat[] =>
    COLLECTIONS.map(c => ({ ...c, count: null, loading: true, lastUpdated: null }));

  const [stats, setStats]               = useState<CollectionStat[]>(initStats);
  const [opLog, setOpLog]               = useState<OpLog[]>([]);
  const [totalReads, setTotalReads]     = useState(0);
  const [totalWrites, setTotalWrites]   = useState(0);
  const [totalDeletes, setTotalDeletes] = useState(0);
  const [refreshing, setRefreshing]     = useState(false);
  const [sessionStart]                  = useState(Date.now());
  const [, setTick]                     = useState(0);

  // Estimated storage usage: 500 bytes avg per doc
  const totalDocs = stats.reduce((s, c) => s + (c.count ?? 0), 0);
  const estimatedStorage = totalDocs * 500;

  // Scroll-to-top ref for log container
  const logRef = useRef<HTMLDivElement>(null);

  // Live clock for session duration
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const sessionSec = Math.floor((Date.now() - sessionStart) / 1000);
  const sessionLabel = sessionSec < 60
    ? `${sessionSec}d`
    : `${Math.floor(sessionSec / 60)}m ${sessionSec % 60}d`;

  const logOp = useCallback((type: OpLog['type'], col: string) => {
    setOpLog(prev => [{ type, collection: col, ts: Date.now() }, ...prev].slice(0, MAX_LOG));
    if (type === 'READ')   setTotalReads(n => n + 1);
    if (type === 'WRITE')  setTotalWrites(n => n + 1);
    if (type === 'DELETE') setTotalDeletes(n => n + 1);
  }, []);

  const fetchCounts = useCallback(async () => {
    if (offline) {
      setStats(initStats().map(s => ({ ...s, count: 0, loading: false, lastUpdated: nowStr() })));
      return;
    }
    setStats(initStats());
    await Promise.all(
      COLLECTIONS.map(async (col, idx) => {
        try {
          const snap = await getCountFromServer(collection(db, col.name));
          logOp('READ', col.name);
          setStats(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], count: snap.data().count, loading: false, lastUpdated: nowStr() };
            return next;
          });
        } catch {
          setStats(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], count: null, loading: false, lastUpdated: nowStr() };
            return next;
          });
        }
      })
    );
  }, [offline, logOp]);

  // Mount: fetch counts + attach realtime listeners
  useEffect(() => {
    fetchCounts();
    if (offline) return;

    const unsubs = COLLECTIONS.map(col => {
      let first = true;
      return onSnapshot(query(collection(db, col.name)), snap => {
        if (first) { first = false; return; }
        snap.docChanges().forEach(ch => {
          if (ch.type === 'added')    logOp('WRITE',  col.name);
          if (ch.type === 'modified') logOp('WRITE',  col.name);
          if (ch.type === 'removed')  logOp('DELETE', col.name);
        });
      });
    });

    return () => unsubs.forEach(u => u());
  }, [offline]);

  // Scroll log to top whenever a new entry is added
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [opLog.length]);

  const handleRefresh = async () => {
    if (offline) return;
    setRefreshing(true);
    await fetchCounts();
    setRefreshing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-2xl mx-auto py-2 font-body"
    >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] font-headline tracking-tight leading-none">
            Firestore Stats
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1.5 font-normal">
            {offline
              ? 'Mode Offline — Tidak terhubung ke Firestore'
              : 'Koneksi aktif — Statistik real-time Firestore'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              Kembali
            </button>
          )}
          {!offline && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer underline-offset-2 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Memuat…' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* ── Section 1: Ringkasan Operasi ──────────────────────────────── */}
      <section className="mb-8">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
          Ringkasan Operasi — Sesi {sessionLabel}
        </p>
        <div className="grid grid-cols-4 gap-0 border-t border-[#E2E8F0]">
          {[
            { label: 'Total Dokumen', val: totalDocs },
            { label: 'Reads',         val: totalReads },
            { label: 'Writes',        val: totalWrites },
            { label: 'Deletes',       val: totalDeletes },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`py-4 pr-6 ${i > 0 ? 'pl-6 border-l border-[#E2E8F0]' : ''}`}
            >
              <p className="text-2xl font-black text-[#0F172A] leading-none tabular-nums">
                {item.val.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-[#94A3B8] mt-1 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Kuota & Limit Firebase Spark ───────────────────── */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
            Kuota Firebase Spark Plan
          </p>
          <span className="text-[9px] text-[#CBD5E1]">Batas harian / gratis</span>
        </div>
        <div className="border-t border-[#E2E8F0]">
          <QuotaRow
            label={QUOTA.reads.label}
            used={totalReads}
            limit={QUOTA.reads.limit}
            unit={QUOTA.reads.unit}
          />
          <QuotaRow
            label={QUOTA.writes.label}
            used={totalWrites}
            limit={QUOTA.writes.limit}
            unit={QUOTA.writes.unit}
          />
          <QuotaRow
            label={QUOTA.deletes.label}
            used={totalDeletes}
            limit={QUOTA.deletes.limit}
            unit={QUOTA.deletes.unit}
          />
          <QuotaRow
            label={QUOTA.storage.label}
            used={estimatedStorage}
            limit={QUOTA.storage.limit}
            unit="bytes (est.)"
            isLast
          />
        </div>
        <p className="text-[9px] text-[#CBD5E1] mt-2">
          Estimasi storage = jumlah dokumen × 500 bytes rata-rata. Reads/Writes/Deletes dihitung sejak halaman dibuka.
        </p>
      </section>

      {/* ── Section 3: Dokumen per Koleksi ────────────────────────────── */}
      <section className="mb-8">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
          Jumlah Dokumen per Koleksi
        </p>
        <div className="border-t border-[#E2E8F0]">
          {stats.map((stat, i) => (
            <div
              key={stat.name}
              className={`flex items-center justify-between py-3 ${i < stats.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#0F172A]">{stat.label}</span>
                <span className="text-[10px] text-[#CBD5E1] font-mono">{stat.name}</span>
              </div>
              <div className="flex items-baseline gap-3">
                {stat.loading ? (
                  <span className="text-xs text-[#CBD5E1]">—</span>
                ) : stat.count === null ? (
                  <span className="text-xs text-[#EF4444] font-medium">Error</span>
                ) : (
                  <span className="text-sm font-black text-[#0F172A] tabular-nums">
                    {stat.count.toLocaleString('id-ID')}
                  </span>
                )}
                {stat.lastUpdated && (
                  <span className="text-[9px] text-[#CBD5E1] font-mono">{stat.lastUpdated}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Log Aktivitas Real-time (scrollable) ───────────── */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
            Log Aktivitas Real-time
          </p>
          <span className="text-[9px] text-[#CBD5E1]">
            {opLog.length > 0 ? `${opLog.length} entri · max ${MAX_LOG}` : ''}
          </span>
        </div>

        <div className="border-t border-[#E2E8F0]">
          {opLog.length === 0 ? (
            <p className="py-6 text-xs text-[#CBD5E1] italic text-center">
              {offline
                ? 'Mode offline — tidak ada operasi Firestore.'
                : 'Menunggu operasi pertama…'}
            </p>
          ) : (
            /* Fixed-height scrollable log */
            <div
              ref={logRef}
              className="h-72 overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}
            >
              {opLog.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 py-2 text-xs font-mono ${
                    i < opLog.length - 1 ? 'border-b border-[#F8FAFC]' : ''
                  }`}
                >
                  <span
                    className={`w-14 font-bold text-[10px] ${
                      log.type === 'READ'   ? 'text-[#3B82F6]' :
                      log.type === 'WRITE'  ? 'text-[#F59E0B]' :
                                             'text-[#EF4444]'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="flex-1 text-[#64748B]">{log.collection}</span>
                  <span className="text-[#CBD5E1] text-[10px] tabular-nums">
                    {new Date(log.ts).toLocaleTimeString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-[#E2E8F0]">
        <p className="text-[10px] text-[#CBD5E1] font-normal">
          {offline
            ? 'Penyimpanan Lokal: LocalStorage 100 MB — Nol data dikirim ke cloud.'
            : 'Data diambil langsung dari Firestore REST API · Listener aktif selama halaman terbuka.'}
        </p>
      </div>
    </motion.div>
  );
};
