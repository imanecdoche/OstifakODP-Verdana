import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  KasTransaction, 
  subscribeToKasTransactions, 
  addKasTransaction, 
  deleteKasTransaction 
} from '../../lib/firestoreService';
import { mockDivisions } from '../../data/mockData';

interface TreasuryViewProps {
  onBack?: () => void;
}

type TimeRangeFilter = 'this_month' | 'three_months' | 'all';

// Running Text / Marquee Looping Component for Anti-Wrapping Table Cells
const RunningText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
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

export const TreasuryView: React.FC<TreasuryViewProps> = () => {
  const [transactions, setTransactions] = useState<KasTransaction[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [inputDate, setInputDate] = useState('2026-08-26');
  const [transactionType, setTransactionType] = useState<'masuk' | 'keluar'>('masuk');
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [divisionId, setDivisionId] = useState('bph');

  useEffect(() => {
    const unsub = subscribeToKasTransactions((list) => {
      setTransactions(list);
    });
    return () => unsub();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Format currency IDR
  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper konversi ISO date (YYYY-MM-DD) ke teks format tanggal Indonesia
  const formatDateToIndonesian = (isoDate: string): string => {
    if (!isoDate) return '26 Agustus 2026';
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${monthNames[monthIndex] || 'Agustus'} ${year}`;
    }
    return isoDate;
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

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    transactions.forEach((t) => {
      if (t.type === 'masuk') {
        totalIncome += t.amount;
        if (t.date.includes('Agustus 2026') || t.date.startsWith('2026-08')) {
          thisMonthIncome += t.amount;
        }
      } else {
        totalExpense += t.amount;
        if (t.date.includes('Agustus 2026') || t.date.startsWith('2026-08')) {
          thisMonthExpense += t.amount;
        }
      }
    });

    const currentBalance = totalIncome - totalExpense;
    const pendingReceivables = 1500000;

    return {
      currentBalance,
      thisMonthIncome,
      thisMonthExpense,
      pendingReceivables,
    };
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Time range filter
      if (timeRange === 'this_month') {
        const isThisMonth = t.date.includes('Agustus 2026') || t.date.startsWith('2026-08');
        if (!isThisMonth) return false;
      } else if (timeRange === 'three_months') {
        const isThreeMonths = 
          t.date.includes('Juni 2026') || 
          t.date.includes('Juli 2026') || 
          t.date.includes('Agustus 2026') ||
          t.date.startsWith('2026-06') ||
          t.date.startsWith('2026-07') ||
          t.date.startsWith('2026-08');
        if (!isThreeMonths) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchDiv = (t.divisionName || '').toLowerCase().includes(q);
        const matchDate = t.date.toLowerCase().includes(q);
        const matchAmount = t.amount.toString().includes(q);
        if (!matchDesc && !matchDiv && !matchDate && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, timeRange, searchQuery]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^\d]/g, '');
    if (!rawDigits) {
      setDisplayAmount('');
      return;
    }
    const num = parseInt(rawDigits, 10);
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    setDisplayAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayAmount || !description.trim()) return;

    const numAmount = parseFloat(displayAmount.replace(/[^\d]/g, '')) || 0;
    if (numAmount <= 0) return;

    const divObj = mockDivisions.find((d) => d.id === divisionId);
    const divName = divObj ? divObj.name : 'BPH & Kas Organisasi';

    addKasTransaction({
      date: formatDateToIndonesian(inputDate),
      type: transactionType,
      amount: numAmount,
      description: description.trim(),
      divisionId: divisionId,
      divisionName: divName,
      recordedBy: 'Bendahara BPH OSTIFAK',
    });

    // Reset Form
    setInputDate('2026-08-26');
    setTransactionType('masuk');
    setDisplayAmount('');
    setDescription('');
    setDivisionId('bph');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Header & Tombol Aksi Utama (Zero Icon Policy) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
            BPH & Kas Organisasi
          </h1>
          <p className="text-xs text-[#64748B] mt-1.5 max-w-2xl font-body leading-relaxed">
            Pencatatan arus kas operasional organisasi santri, pembukuan ledger harian, alokasi anggaran 9 divisi, dan laporan transparansi kas.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 bg-[#0F172A] text-white text-xs font-semibold rounded-md hover:bg-[#1E293B] active:scale-[0.98] transition-all cursor-pointer select-none whitespace-nowrap"
          >
            + Catat Transaksi Baru
          </button>
        </div>
      </div>

      {/* 2. Metrik Finansial Murni Tipografi (Unboxed 1-Row with Dividers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E2E8F0] py-3.5 border-y border-[#E2E8F0]">
        <div className="px-3 sm:px-6 first:pl-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Saldo Kas Saat Ini
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {formatRupiah(metrics.currentBalance)}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5 font-body">
            Kas riil di bendahara
          </p>
        </div>

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Pemasukan Bulan Ini
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight font-headline">
              {formatRupiah(metrics.thisMonthIncome)}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5 font-body">
            Periode Agustus 2026
          </p>
        </div>

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Pengeluaran Bulan Ini
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#EF4444] tracking-tight font-headline">
              {formatRupiah(metrics.thisMonthExpense)}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5 font-body">
            Realisasi divisi
          </p>
        </div>

        <div className="px-3 sm:px-6 last:pr-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Kas Belum Tertagih
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {formatRupiah(metrics.pendingReceivables)}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5 font-body">
            Iuran kas tertunda
          </p>
        </div>
      </div>

      {/* 3. Filter Rentang Waktu & Bilah Pencarian */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Tab Filter Rentang Waktu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeRange('this_month')}
              className={`h-8 px-3.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                timeRange === 'this_month'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setTimeRange('three_months')}
              className={`h-8 px-3.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                timeRange === 'three_months'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              3 Bulan Terakhir
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`h-8 px-3.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                timeRange === 'all'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              Semua Waktu
            </button>
          </div>

          {/* Search Box Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Cari transaksi, divisi, nominal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 px-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F172A] font-body"
            />
          </div>

        </div>

        {/* 4. Tabel Riwayat Arus Kas (Ledger Harian - Divider Based) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-headline tracking-tight">
              Riwayat Arus Kas (Ledger)
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Daftar seluruh mutasi masuk dan keluar kas organisasi santri
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] font-headline uppercase tracking-[0.5px]">
                <tr>
                  <th className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap">
                    TANGGAL
                  </th>
                  <th className="p-3.5 min-w-[200px] max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] whitespace-nowrap">
                    KETERANGAN & KEPERLUAN
                  </th>
                  <th className="p-3.5 w-44 min-w-[140px] max-w-[180px] whitespace-nowrap">
                    DIVISI TERKAIT
                  </th>
                  <th className="p-3.5 w-32 min-w-[110px] max-w-[130px] whitespace-nowrap">
                    JENIS TRANSAKSI
                  </th>
                  <th className="p-3.5 w-36 min-w-[130px] max-w-[160px] text-right whitespace-nowrap">
                    NOMINAL
                  </th>
                  <th className="p-3.5 w-20 min-w-[65px] max-w-[80px] text-right whitespace-nowrap">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B] font-body">
                      Tidak ada catatan transaksi pada filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const dateObj = formatSplitDate(t.date);
                    return (
                      <tr key={t.id} className="h-14 hover:bg-[#F8FAFC] transition-colors">
                        
                        {/* 1. Kolom Tanggal Dua Baris: Baris 1 Nama Hari, Baris 2 Tanggal Lengkap */}
                        <td className="p-3.5 w-32 min-w-[120px] max-w-[130px] whitespace-nowrap align-middle">
                          <p className="font-bold text-xs text-[#0F172A] font-headline leading-tight whitespace-nowrap">
                            {dateObj.dayName}
                          </p>
                          <p className="text-[11px] text-[#64748B] font-body mt-0.5 leading-tight whitespace-nowrap">
                            {dateObj.formattedDate}
                          </p>
                        </td>

                        {/* 2. Kolom Keterangan & Keperluan (Anti-wrapping dengan Running Text) */}
                        <td className="p-3.5 min-w-[200px] max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] align-middle overflow-hidden">
                          <RunningText 
                            text={t.description} 
                            className="font-bold text-xs text-[#0F172A] font-headline" 
                          />
                          <RunningText 
                            text={`Dicatat oleh: ${t.recordedBy || 'Bendahara BPH OSTIFAK'}`} 
                            className="text-[11px] text-[#64748B] font-body mt-0.5" 
                          />
                        </td>

                        {/* 3. Kolom Divisi Terkait (Anti-wrapping dengan Running Text) */}
                        <td className="p-3.5 w-44 min-w-[140px] max-w-[180px] align-middle overflow-hidden">
                          <RunningText 
                            text={t.divisionName || 'BPH & Kas Organisasi'} 
                            className="text-xs font-medium text-[#0F172A] font-body" 
                          />
                        </td>

                        {/* 4. Kolom Jenis Transaksi (Plain Text, No Badges) */}
                        <td className="p-3.5 w-32 min-w-[110px] max-w-[130px] whitespace-nowrap align-middle">
                          <span className={`font-semibold text-xs whitespace-nowrap ${
                            t.type === 'masuk' ? 'text-[#059669]' : 'text-[#EF4444]'
                          }`}>
                            {t.type === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'}
                          </span>
                        </td>

                        {/* 5. Kolom Nominal Transaksi */}
                        <td className={`p-3.5 w-36 min-w-[130px] max-w-[160px] text-right font-mono font-bold text-xs whitespace-nowrap align-middle ${
                          t.type === 'masuk' ? 'text-[#059669]' : 'text-[#EF4444]'
                        }`}>
                          {t.type === 'masuk' ? '+' : '-'}{formatRupiah(t.amount)}
                        </td>

                        {/* 6. Kolom Aksi */}
                        <td className="p-3.5 w-20 min-w-[65px] max-w-[80px] text-right whitespace-nowrap align-middle">
                          <button
                            onClick={() => deleteKasTransaction(t.id)}
                            className="text-[#94A3B8] hover:text-[#EF4444] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Hapus
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. Modal Form Pencatatan Transaksi Baru (Clean Anti-Gravity UI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg max-w-lg w-full p-6 space-y-6 shadow-xl">
            
            {/* Header Modal Bersih Tanpa Tombol Tutup */}
            <div className="border-b border-[#E2E8F0] pb-4">
              <h3 className="text-lg font-bold text-[#0F172A] font-headline tracking-tight">
                Pencatatan Transaksi Kas Baru
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                Masukkan detail arus kas masuk atau pengeluaran operasional organisasi
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-body">
              
              {/* 1. Toggle Button Jenis Transaksi (MASUK vs KELUAR) */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5 font-headline uppercase tracking-[0.5px]">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <button
                    type="button"
                    onClick={() => setTransactionType('masuk')}
                    className={`h-9 text-xs font-bold rounded transition-all cursor-pointer select-none ${
                      transactionType === 'masuk'
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    MASUK
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('keluar')}
                    className={`h-9 text-xs font-bold rounded transition-all cursor-pointer select-none ${
                      transactionType === 'keluar'
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    KELUAR
                  </button>
                </div>
              </div>

              {/* 2. Tanggal Transaksi (Custom Date Input) */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full h-9 px-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] font-body"
                />
              </div>

              {/* 3. Nominal Transaksi (Prefix "Rp" Permanen & Pemisah Titik Ribuan Otomatis) */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Nominal Transaksi
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-[#64748B] font-mono select-none pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className="w-full h-9 pl-10 pr-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] font-mono font-bold focus:outline-none focus:border-[#0F172A]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 4. Divisi Terkait */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Divisi Terkait
                </label>
                <select
                  value={divisionId}
                  onChange={(e) => setDivisionId(e.target.value)}
                  className="w-full h-9 px-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                >
                  <option value="bph">BPH & Kas Organisasi (Umum)</option>
                  {mockDivisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Keterangan / Keperluan */}
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5 font-headline">
                  Keterangan & Keperluan
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] resize-none"
                  placeholder="Jelaskan sumber penerimaan dana atau rincian pengeluaran operasional..."
                />
              </div>

              {/* 6. Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-[#0F172A] text-white text-xs font-semibold rounded-md hover:bg-[#1E293B] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
