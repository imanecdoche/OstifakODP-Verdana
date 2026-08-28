import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  SantriRecord, 
  Dormitory, 
  SchoolClass, 
  OFFICIAL_DORMITORIES, 
  OFFICIAL_CLASSES 
} from '../../lib/firestoreService';
import { 
  ReportDatePreset, 
  ReportFilterOptions 
} from '../../types/report';
import { 
  calculateCombinedAnalytics, 
  getPresetDateBounds 
} from '../../utils/reportAnalytics';
import { MinimalLineChart } from '../reports/MinimalLineChart';
import { RatioProgressBar } from '../reports/RatioProgressBar';
import { HighDensityTable } from '../reports/HighDensityTable';
import { Button } from '../ui/Button';
import { 
  Printer, 
  Calendar, 
  Filter, 
  Search, 
  FileSpreadsheet, 
  ShieldAlert, 
  BookOpen, 
  Layers, 
  User, 
  X, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface ReportsViewProps {
  students: SantriRecord[];
  dormitories?: Dormitory[];
  classes?: SchoolClass[];
  onSelectStudent?: (student: SantriRecord) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  dormitories = OFFICIAL_DORMITORIES,
  classes = OFFICIAL_CLASSES,
  onSelectStudent,
}) => {
  // State Filter Control
  const [activeDivision, setActiveDivision] = useState<'tahfizh' | 'keamanan' | 'gabungan'>('tahfizh');
  const [datePreset, setDatePreset] = useState<ReportDatePreset>('monthly');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDormitoryId, setSelectedDormitoryId] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Close combobox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered student list for the combobox
  const filteredStudentsForCombobox = useMemo(() => {
    if (!students) return [];
    return students.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const nameMatch = (s.name || s.studentName || '').toLowerCase().includes(q);
      const nisMatch = (s.nis || '').toLowerCase().includes(q);
      const kamarMatch = (s.dormitoryId || s.kamar || '').toLowerCase().includes(q);
      const classMatch = (s.classId || s.kelas || '').toLowerCase().includes(q);
      return nameMatch || nisMatch || kamarMatch || classMatch;
    });
  }, [students, searchQuery]);

  const selectedStudent = useMemo(() => {
    if (selectedStudentId === 'all') return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Consolidated Filter Options
  const filterOptions: ReportFilterOptions = useMemo(() => ({
    dateRange: {
      preset: datePreset,
      startDate: customStartDate,
      endDate: customEndDate,
    },
    dormitoryId: selectedDormitoryId,
    classId: selectedClassId,
    studentId: selectedStudentId,
    searchQuery: selectedStudentId === 'all' ? searchQuery : undefined,
  }), [datePreset, customStartDate, customEndDate, selectedDormitoryId, selectedClassId, selectedStudentId, searchQuery]);

  // Reactive Analytics Engine Execution
  const analytics = useMemo(() => {
    return calculateCombinedAnalytics(students, filterOptions);
  }, [students, filterOptions]);

  const dateBounds = useMemo(() => {
    return getPresetDateBounds(filterOptions.dateRange);
  }, [filterOptions.dateRange]);

  // Print Handler
  const handlePrint = () => {
    const originalTitle = document.title;
    const divName = activeDivision === 'tahfizh' ? 'Tahfizh' : activeDivision === 'keamanan' ? 'Keamanan' : 'Gabungan';
    const studentTag = selectedStudent ? `_${(selectedStudent.name || selectedStudent.studentName || 'Santri').replace(/\s+/g, '_')}` : '';
    document.title = `Laporan_Resmi_${divName}${studentTag}_OSTIFAK_${dateBounds.startDate}_sd_${dateBounds.endDate}`;
    window.print();
    document.title = originalTitle;
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setDatePreset('monthly');
    setSelectedDormitoryId('all');
    setSelectedClassId('all');
    setSelectedStudentId('all');
    setSearchQuery('');
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 space-y-6 font-body text-[#0F172A]">
      {/* 1. TOP HEADER BAR */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-[#0F172A]">
            Laporan Multidivisi & Analitik SSOT
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Agregasi data real-time, tren produktivitas, dan dokumen cetak resmi pesantren
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={handlePrint}
            className="shadow-2xs font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK / EKSPOR PDF</span>
          </Button>
        </div>
      </div>

      {/* 2. FILTER CONTROL PANEL (FLAT ANTI-GRAVITY UI) */}
      <div className="no-print bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-4 shadow-2xs">
        {/* Division Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-md">
            {[
              { id: 'tahfizh', label: 'Divisi Tahfizh', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'keamanan', label: 'Divisi Keamanan / Disiplin', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
              { id: 'gabungan', label: 'Laporan Gabungan (Eksekutif)', icon: <Layers className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = activeDivision === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDivision(tab.id as any)}
                  className={`px-3 py-1.5 text-xs rounded font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0F172A] font-bold shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-mono">
            {selectedStudent ? (
              <span className="bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Individu: {selectedStudent.name || selectedStudent.studentName}</span>
              </span>
            ) : (
              <span>Scope: <strong>{analytics.totalStudentsCount} Santri Terfilter</strong></span>
            )}
          </div>
        </div>

        {/* Date Presets & Scope Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Rentang Waktu */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">
              Periode Waktu
            </label>
            <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded">
              {[
                { id: 'weekly', label: 'Mingguan' },
                { id: 'monthly', label: 'Bulanan' },
                { id: 'yearly', label: 'Tahunan' },
                { id: 'custom', label: 'Kustom' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDatePreset(p.id as any)}
                  className={`flex-1 py-1 text-[11px] rounded font-medium transition-all ${
                    datePreset === p.id ? 'bg-[#0F172A] text-white font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Pickers */}
          {datePreset === 'custom' ? (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">Mulai</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">Sampai</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">Rentang Terhitung</label>
              <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-[11px] text-[#0F172A]">
                {dateBounds.startDate} s.d. {dateBounds.endDate}
              </div>
            </div>
          )}

          {/* Filter Asrama & Kelas */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">Asrama</label>
              <select
                value={selectedDormitoryId}
                onChange={(e) => setSelectedDormitoryId(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:outline-none"
              >
                <option value="all">Semua Asrama</option>
                {dormitories.map((d: any) => (
                  <option key={d.id} value={d.name || d.dormitoryName}>{d.name || d.dormitoryName}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">Kelas</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:outline-none"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.className || c.name}>{c.className || c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Searchable Student Combobox (SSOT Interactive Filter) */}
          <div className="relative" ref={comboboxRef}>
            <label className="block text-[10px] font-bold uppercase text-[#64748B] mb-1 font-headline">
              Santri / Individu
            </label>
            
            {selectedStudent ? (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-xs text-[#065F46]">
                <span className="font-semibold truncate">
                  {selectedStudent.name || selectedStudent.studentName} ({selectedStudent.nis || '-'})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentId('all')}
                  className="text-[#059669] hover:text-[#047857] p-0.5 rounded cursor-pointer"
                  title="Kembali ke Laporan Kolektif"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS santri..."
                  value={searchQuery}
                  onFocus={() => setIsStudentDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsStudentDropdownOpen(true);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#0F172A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                  className="absolute right-2 top-2 text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Dropdown Results */}
            {isStudentDropdownOpen && !selectedStudent && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-md shadow-lg max-h-56 overflow-y-auto divide-y divide-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentId('all');
                    setIsStudentDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8FAFC] font-semibold text-[#0F172A] flex items-center justify-between"
                >
                  <span>👥 Semua Santri (Laporan Kolektif)</span>
                  <span className="text-[10px] text-[#64748B] font-mono font-normal">
                    {filteredStudentsForCombobox.length} Santri
                  </span>
                </button>

                {filteredStudentsForCombobox.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-[#94A3B8] text-center">
                    Santri tidak ditemukan
                  </div>
                ) : (
                  filteredStudentsForCombobox.slice(0, 30).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        setIsStudentDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F5F9] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-[#0F172A]">{st.name || st.studentName}</p>
                        <p className="text-[10px] text-[#64748B]">
                          NIS: {st.nis || '-'} • {st.dormitoryId || st.kamar || '-'} • {st.classId || st.kelas || '-'}
                        </p>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <span className="text-[#059669]">+{st.activePP ?? st.poinPrestasi ?? 0} PP</span>
                        <span className="mx-1 text-[#CBD5E1]">|</span>
                        <span className="text-[#EF4444]">{st.activePK ?? st.poinPelanggaran ?? 0} PK</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. LIVE PRINT-PREVIEW CANVAS AREA (ANTI-GRAVITY EDITORIAL CANVAS) */}
      <div id="printable-report-area" className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:shadow-none">
        {/* Kop Resmi Pesantren / Header Document */}
        <div className="border-b-2 border-[#0F172A] pb-4 space-y-1 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#059669] uppercase tracking-widest font-headline">PONDOK PESANTREN FAJRUL KARIM • OSTIFAK</span>
            <h2 className="text-xl font-bold font-headline tracking-tight text-[#0F172A]">
              {selectedStudent ? (
                `LAPORAN PORTOFOLIO INDIVIDUAL SANTRI: ${(selectedStudent.name || selectedStudent.studentName || '').toUpperCase()}`
              ) : (
                <>
                  {activeDivision === 'tahfizh' && 'LAPORAN AGREGASI & PRODUKTIVITAS DIVISI TAHFIZH'}
                  {activeDivision === 'keamanan' && 'LAPORAN KEDISIPLINAN & BUKU SAKU DIVISI KEAMANAN'}
                  {activeDivision === 'gabungan' && 'LAPORAN GABUNGAN EKSEKUTIF OPERASIONAL SANTRI'}
                </>
              )}
            </h2>
            <p className="text-xs text-[#64748B]">
              Rentang Periode: <strong className="text-[#0F172A] font-mono">{dateBounds.startDate}</strong> s.d. <strong className="text-[#0F172A] font-mono">{dateBounds.endDate}</strong>
              {selectedStudent && ` • NIS: ${selectedStudent.nis || '-'} • Asrama: ${selectedStudent.dormitoryId || selectedStudent.kamar || '-'} • Kelas: ${selectedStudent.classId || selectedStudent.kelas || '-'}`}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-[#64748B] border-l sm:border-l-0 sm:pl-0 pl-3">
            <p>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-[10px] text-[#94A3B8]">Status Data: SSOT Real-time</p>
          </div>
        </div>

        {/* --- VIEW SECTION: DIVISI TAHFIZH --- */}
        {activeDivision === 'tahfizh' && (
          <div className="space-y-6">
            {/* Executive Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs divide-x divide-[#E2E8F0] border-b border-[#E2E8F0] pb-4">
              <div className="pr-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Total Ziyadah</span>
                <p className="text-xl font-bold text-[#059669] mt-0.5 font-mono">{analytics.tahfizh.totalPagesZiyadah} <span className="text-xs font-normal">Hal</span></p>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Total Murojaah</span>
                <p className="text-xl font-bold text-[#0F172A] mt-0.5 font-mono">{analytics.tahfizh.totalPagesMurojaah} <span className="text-xs font-normal">Hal</span></p>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Rasio Ziyadah : Murojaah</span>
                <p className="text-xl font-bold text-[#0F172A] mt-0.5 font-mono">{analytics.tahfizh.ziyadahPercentage}% : {analytics.tahfizh.murojaahPercentage}%</p>
              </div>
              <div className="pl-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">
                  {analytics.tahfizh.peakProductivity.peakLabel}
                </span>
                <p className="text-xl font-bold text-[#059669] mt-0.5 font-headline">
                  {analytics.tahfizh.peakProductivity.peakUnitName}
                </p>
              </div>
            </div>

            {/* Ratio Progress Bar & Fluency Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">DISTRIBUSI KATEGORI SETORAN</h4>
                <RatioProgressBar
                  title="Proporsi Setoran (Ziyadah vs Murojaah)"
                  segments={[
                    { id: 'ziyadah', label: 'Ziyadah (Baru)', value: analytics.tahfizh.totalPagesZiyadah, color: '#059669' },
                    { id: 'murojaah', label: 'Murojaah (Pengulangan)', value: analytics.tahfizh.totalPagesMurojaah, color: '#0F172A' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">DISTRIBUSI KELANCARAN SETORAN</h4>
                <RatioProgressBar
                  title="Kualitas Kelancaran Hafalan"
                  segments={[
                    { id: 'mutqin', label: 'Mutqin', value: analytics.tahfizh.fluency.mutqin, color: '#059669' },
                    { id: 'lancar', label: 'Lancar', value: analytics.tahfizh.fluency.lancar, color: '#38BDF8' },
                    { id: 'perbaikan', label: 'Perbaikan', value: analytics.tahfizh.fluency.perbaikan, color: '#F59E0B' },
                  ]}
                />
              </div>
            </div>

            {/* Trend Chart */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">TREN VOLUME SETORAN HARIAN (HALAMAN)</h4>
              <MinimalLineChart
                dataPoints={analytics.tahfizh.dailyTrends}
                series={[
                  { id: 'ziyadah', label: 'Ziyadah (Baru)', color: '#059669', data: analytics.tahfizh.dailyTrends.map(t => t.value1) },
                  { id: 'murojaah', label: 'Murojaah', color: '#0F172A', data: analytics.tahfizh.dailyTrends.map(t => t.value2) },
                ]}
              />
            </div>

            {/* High Density Table Top Performers */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">REKAPITULASI SANTRI TERPRODUKTIF TAHFIZH</h4>
              <HighDensityTable
                data={analytics.tahfizh.topPerformers}
                keyExtractor={(item: any) => item.studentId}
                columns={[
                  { key: 'rank', header: 'No', render: (_, idx) => <span className="font-mono">{idx + 1}</span> },
                  { key: 'name', header: 'Nama Santri', render: (item: any) => <span className="font-bold text-[#0F172A]">{item.name}</span> },
                  { key: 'kamar', header: 'Asrama / Kelas', render: (item: any) => <span>{item.kamar} • {item.kelas}</span> },
                  { key: 'ziyadah', header: 'Ziyadah', render: (item: any) => <span className="font-mono font-bold text-[#059669]">+{item.totalZiyadahPages} Hal</span> },
                  { key: 'murojaah', header: 'Murojaah', render: (item: any) => <span className="font-mono font-bold text-[#0F172A]">{item.totalMurojaahPages} Hal</span> },
                ]}
              />
            </div>
          </div>
        )}

        {/* --- VIEW SECTION: DIVISI KEAMANAN & KEDISIPLINAN --- */}
        {activeDivision === 'keamanan' && (
          <div className="space-y-6">
            {/* Executive Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs divide-x divide-[#E2E8F0] border-b border-[#E2E8F0] pb-4">
              <div className="pr-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Total Active PK</span>
                <p className="text-xl font-bold text-[#EF4444] mt-0.5 font-mono">{analytics.discipline.totalActivePK} <span className="text-xs font-normal">PK</span></p>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Total Lifetime PK</span>
                <p className="text-xl font-bold text-[#0F172A] mt-0.5 font-mono">{analytics.discipline.totalLifetimePK} <span className="text-xs font-normal">PK</span></p>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Poin Peluruhan (Decay)</span>
                <p className="text-xl font-bold text-[#059669] mt-0.5 font-mono">-{analytics.discipline.totalDecayedPK} <span className="text-xs font-normal">PK</span></p>
              </div>
              <div className="pl-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">
                  {analytics.discipline.peakDiscipline.peakLabel}
                </span>
                <p className="text-xl font-bold text-[#EF4444] mt-0.5 font-headline">
                  {analytics.discipline.peakDiscipline.peakUnitName}
                </p>
              </div>
            </div>

            {/* Ratio Progress Bar Kategori Pelanggaran */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">DISTRIBUSI KATEGORI PELANGGARAN</h4>
              <RatioProgressBar
                title="Proporsi Tingkat Pelanggaran"
                segments={[
                  { id: 'ringan', label: 'Ringan', value: analytics.discipline.categoryBreakdown.ringan, color: '#94A3B8' },
                  { id: 'sedang', label: 'Sedang', value: analytics.discipline.categoryBreakdown.sedang, color: '#F59E0B' },
                  { id: 'berat', label: 'Berat (Lock Decay)', value: analytics.discipline.categoryBreakdown.berat, color: '#EF4444' },
                ]}
              />
            </div>

            {/* Trend Chart */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">TREN PELANGGARAN HARIAN (POIN PK BARU)</h4>
              <MinimalLineChart
                dataPoints={analytics.discipline.dailyTrends}
                series={[
                  { id: 'pk', label: 'Poin PK Baru', color: '#EF4444', data: analytics.discipline.dailyTrends.map(t => t.value1) },
                  { id: 'count', label: 'Jumlah Kasus', color: '#0F172A', data: analytics.discipline.dailyTrends.map(t => t.value2) },
                ]}
              />
            </div>

            {/* High Density Table High Risk Students */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">REKAPITULASI SANTRI DALAM PEMBINAAN DISIPLIN (HIGH RISK)</h4>
              <HighDensityTable
                data={analytics.discipline.highRiskStudents}
                keyExtractor={(item: any) => item.studentId}
                columns={[
                  { key: 'rank', header: 'No', render: (_, idx) => <span className="font-mono">{idx + 1}</span> },
                  { key: 'name', header: 'Nama Santri', render: (item: any) => <span className="font-bold text-[#0F172A]">{item.name}</span> },
                  { key: 'kamar', header: 'Asrama / Kelas', render: (item: any) => <span>{item.kamar} • {item.kelas}</span> },
                  { key: 'activePK', header: 'Active PK', render: (item: any) => <span className="font-mono font-bold text-[#EF4444]">{item.activePK} PK</span> },
                  { key: 'lifetimePK', header: 'Lifetime PK', render: (item: any) => <span className="font-mono text-[#64748B]">{item.lifetimePK} PK</span> },
                  { key: 'status', header: 'Status Peluruhan', render: (item: any) => (
                    <span className={`text-[10px] font-semibold ${item.hasDecayLock ? 'text-[#F59E0B]' : 'text-[#059669]'}`}>
                      {item.statusLabel}
                    </span>
                  ) },
                ]}
              />
            </div>
          </div>
        )}

        {/* --- VIEW SECTION: LAPORAN GABUNGAN (EKSEKUTIF) --- */}
        {activeDivision === 'gabungan' && (
          <div className="space-y-6">
            {/* Executive Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs divide-x divide-[#E2E8F0] border-b border-[#E2E8F0] pb-4">
              <div className="pr-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Total Active PP</span>
                <p className="text-xl font-bold text-[#059669] mt-0.5 font-mono">+{analytics.totalActivePP} <span className="text-xs font-normal">PP</span></p>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Total Active PK</span>
                <p className="text-xl font-bold text-[#EF4444] mt-0.5 font-mono">{analytics.totalActivePK} <span className="text-xs font-normal">PK</span></p>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Rasio Kelipatan PP : PK</span>
                <p className="text-xl font-bold text-[#0F172A] mt-0.5 font-mono">{analytics.ratioPPvsPK}x</p>
              </div>
              <div className="pl-2">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold font-headline">Indeks Kedisiplinan Santri</span>
                <p className="text-xl font-bold text-[#059669] mt-0.5 font-headline">{analytics.overallDisciplineIndex}%</p>
              </div>
            </div>

            {/* Proportional Ratio PP vs PK */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">KOMPARASI RASIO POIN PRESTASI VS POIN PELANGGARAN AKTIF</h4>
              <RatioProgressBar
                title="Keseimbangan Poin Operasional Santri"
                segments={[
                  { id: 'pp', label: 'Poin Prestasi (PP)', value: analytics.totalActivePP, color: '#059669' },
                  { id: 'pk', label: 'Poin Pelanggaran (PK)', value: analytics.totalActivePK, color: '#EF4444' },
                ]}
              />
            </div>

            {/* High Density Table Executive Santri Roster */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider font-headline">DAFTAR RINGKASAN INTEGRITAS OPERASIONAL SANTRI</h4>
              <HighDensityTable
                data={students.slice(0, 15)}
                keyExtractor={(item: any) => item.id}
                columns={[
                  { key: 'nis', header: 'NIS', render: (item: any) => <span className="font-mono">{item.nis || '-'}</span> },
                  { key: 'name', header: 'Nama Santri', render: (item: any) => (
                    <button
                      type="button"
                      onClick={() => onSelectStudent && onSelectStudent(item)}
                      className="font-bold text-[#0F172A] hover:text-[#059669] text-left cursor-pointer"
                    >
                      {item.name || item.studentName}
                    </button>
                  ) },
                  { key: 'kamar', header: 'Asrama / Kelas', render: (item: any) => <span>{item.dormitoryId || item.kamar} • {item.classId || item.kelas}</span> },
                  { key: 'pp', header: 'Active PP', render: (item: any) => <span className="font-mono font-bold text-[#059669]">+{item.activePP ?? item.poinPrestasi ?? 0} PP</span> },
                  { key: 'pk', header: 'Active PK', render: (item: any) => <span className="font-mono font-bold text-[#EF4444]">{item.activePK ?? item.poinPelanggaran ?? 0} PK</span> },
                  { key: 'hafalan', header: 'Hafalan', render: (item: any) => <span>{item.hafalan || '-'}</span> },
                ]}
              />
            </div>
          </div>
        )}

        {/* Footer Signature Block (Editorial Anti-Gravity Print) */}
        <div className="pt-8 border-t border-[#E2E8F0] grid grid-cols-3 gap-4 text-center text-xs print:pt-6 font-body print-avoid-break">
          <div>
            <p className="text-[10px] text-[#64748B]">Kepala Divisi Tahfizh</p>
            <div className="h-14" />
            <p className="font-bold text-[#0F172A] border-t border-[#E2E8F0] pt-1 inline-block px-4">Ust. H. Ahmad Dahlan, Lc.</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Kepala Divisi Keamanan</p>
            <div className="h-14" />
            <p className="font-bold text-[#0F172A] border-t border-[#E2E8F0] pt-1 inline-block px-4">Ust. Muhammad Ridwan, S.Pd.</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748B]">Mudir / Pimpinan Pesantren</p>
            <div className="h-14" />
            <p className="font-bold text-[#0F172A] border-t border-[#E2E8F0] pt-1 inline-block px-4">K.H. Abdullah Syafi'i, M.Ag.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
