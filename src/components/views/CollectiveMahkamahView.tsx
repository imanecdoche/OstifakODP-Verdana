import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SantriRecord, recordCollectiveMahkamahSession } from '../../lib/firestoreService';
import { getSeverityInfo, sliderFillPercent } from '../../lib/severityUtils';
import { RollingNumber } from '../modals/NewViolationModal';
import { gooeyToast } from '../../lib/toast';
import { PKIcon } from '../ui/PointIcons';

interface CollectiveMahkamahViewProps {
  students: SantriRecord[];
  onBack: () => void;
  onSuccess?: () => void;
}

const AVAILABLE_DIVISIONS = [
  'Div. Keamanan',
  'Div. Ibadah & Masjid',
  'Div. Tahfizh & Diniyah',
  'Div. Bahasa (Lughah)',
  'Div. Kebersihan & Asrama',
  'Div. Kesehatan & UKS',
  'BPH & Pengasuhan',
];

export const CollectiveMahkamahView: React.FC<CollectiveMahkamahViewProps> = ({
  students,
  onBack,
  onSuccess,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(['Div. Keamanan']);
  const [violation, setViolation] = useState('');
  const [penalty, setPenalty] = useState('');
  const [points, setPoints] = useState<number>(1);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edge shadow states for scrollable santri list
  const santriListRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const checkSantriScroll = () => {
    if (santriListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = santriListRef.current;
      setShowTopShadow(scrollTop > 4);
      setShowBottomShadow(scrollTop < scrollHeight - clientHeight - 4);
    }
  };

  // Filtered available students based on search query
  const searchedStudents = useMemo(() => {
    if (!studentSearch.trim()) return students.slice(0, 32);
    const query = studentSearch.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(query) ||
        (s.nis && s.nis.toLowerCase().includes(query)) ||
        (s.kamar && s.kamar.toLowerCase().includes(query)) ||
        (s.kelas && s.kelas.toLowerCase().includes(query))
    );
  }, [students, studentSearch]);

  useEffect(() => {
    checkSantriScroll();
  }, [searchedStudents]);

  // Selected student objects list
  const selectedStudentList = useMemo(() => {
    const set = new Set(selectedStudentIds);
    return students.filter((s) => set.has(s.id));
  }, [students, selectedStudentIds]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllSearched = () => {
    const idsToAdd = searchedStudents.map((s) => s.id);
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const clearAllSelected = () => {
    setSelectedStudentIds([]);
  };

  const toggleDivision = (div: string) => {
    setSelectedDivisions((prev) =>
      prev.includes(div)
        ? prev.length > 1
          ? prev.filter((d) => d !== div)
          : prev
        : [...prev, div]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentIds.length === 0) {
      gooeyToast.error('Pilih Santri Terlebih Dahulu', {
        description: 'Minimal 1 santri harus dipilih untuk sidang mahkamah kolektif.',
      });
      return;
    }

    if (!violation.trim()) {
      gooeyToast.error('Jenis Pelanggaran Wajib Diisi', {
        description: 'Tuliskan deskripsi kasus pelanggaran yang disidangkan.',
      });
      return;
    }

    if (!penalty.trim()) {
      gooeyToast.error('Bentuk Hukuman Wajib Diisi', {
        description: 'Tuliskan takzir / sanksi edukatif yang ditetapkan.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const targetStudentsPayload = selectedStudentList.map((s) => ({
        id: s.id,
        name: s.studentName,
        nis: s.nis,
        kamar: s.kamar,
      }));

      await recordCollectiveMahkamahSession({
        students: targetStudentsPayload,
        divisions: selectedDivisions,
        violation: violation.trim(),
        penalty: penalty.trim(),
        date: sessionDate,
        points: Number(points) || 0,
        sessionNotes: sessionNotes.trim(),
      });

      gooeyToast.success('Sidang Mahkamah Kolektif Disimpan', {
        description: `Berhasil mencatat rekam mahkamah untuk ${selectedStudentIds.length} santri.`,
      });

      // Reset form
      setSelectedStudentIds([]);
      setViolation('');
      setPenalty('');
      setPoints(1);
      setSessionNotes('');
      onSuccess?.();
      onBack();
    } catch (err) {
      console.error('Gagal mencatat sidang mahkamah kolektif:', err);
      gooeyToast.error('Gagal Menyimpan Sidang', {
        description: 'Terjadi kesalahan sistem saat memperbarui data.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-16 font-body">
      
      {/* 1. Header Utama Halaman Penuh (Zero Icon Policy) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
            Sidang Mahkamah Kolektif
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl font-body leading-relaxed">
            Pencatatan vonis takzir serentak untuk multi-santri dan lintas divisi organisasi santri.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-4 bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold rounded-md hover:bg-[#F8FAFC] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            ← Kembali ke Rekapitulasi
          </button>
        </div>
      </div>

      {/* Form Utama Halaman Penuh */}
      <form onSubmit={handleSubmit} className="space-y-10">

        {/* 2. Section Pemilihan Santri */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] uppercase tracking-[0.5px] font-headline">
                Pilih Santri yang Disidang ({selectedStudentIds.length} Terpilih)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                Cari dan tentukan daftar santri yang terlibat dalam persidangan ini
              </p>
            </div>

            {selectedStudentIds.length > 0 && (
              <button
                type="button"
                onClick={clearAllSelected}
                className="text-xs text-[#EF4444] hover:underline font-semibold cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Hapus Semua Pilihan
              </button>
            )}
          </div>

          {/* Tag List Santri Terpilih */}
          {selectedStudentList.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] max-h-36 overflow-y-auto">
              {selectedStudentList.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white text-[#0F172A] border border-[#E2E8F0] rounded-md text-xs font-medium"
                >
                  <span className="font-semibold">{s.studentName}</span>
                  <span className="text-[11px] text-[#64748B]">({s.kamar || s.kelas})</span>
                  <button
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className="text-[#94A3B8] hover:text-[#EF4444] font-bold text-xs cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search Box Input */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Ketik nama santri, NIS, kamar, atau kelas..."
                className="w-full h-10 px-3.5 text-xs text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0F172A] font-body"
              />
            </div>
            {searchedStudents.length > 0 && (
              <button
                type="button"
                onClick={selectAllSearched}
                className="h-10 px-4 text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                + Pilih Semua ({searchedStudents.length})
              </button>
            )}
          </div>

          {/* Grid Santri Scrollable */}
          <div className="relative border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
            {/* Top Shadow */}
            <div
              className={`pointer-events-none absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-[#0F172A]/5 to-transparent z-10 transition-opacity duration-200 ${
                showTopShadow ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Bottom Shadow */}
            <div
              className={`pointer-events-none absolute left-0 right-0 bottom-0 h-6 bg-gradient-to-t from-[#0F172A]/5 to-transparent z-10 transition-opacity duration-200 ${
                showBottomShadow ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div
              ref={santriListRef}
              onScroll={checkSantriScroll}
              className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 sm:max-h-80 overflow-y-auto"
            >
              {searchedStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className={`text-left p-3.5 rounded-md border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <p className="font-bold truncate font-headline">{s.studentName}</p>
                    <p className={`text-[11px] truncate mt-1.5 ${isSelected ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                      {s.kamar || '-'} • {s.kelas || '-'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Section Divisi Penyelenggara */}
        <div className="space-y-4 pt-8 border-t border-[#E2E8F0]">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] uppercase tracking-[0.5px] font-headline">
              Divisi Penyelenggara & Terkait
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Pilih satu atau beberapa divisi yang memimpin dan mengawasi jalannya sidang
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_DIVISIONS.map((div) => {
              const isSelected = selectedDivisions.includes(div);
              return (
                <button
                  key={div}
                  type="button"
                  onClick={() => toggleDivision(div)}
                  className={`px-4 py-2.5 rounded-md text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold shadow-xs'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A] font-medium'
                  }`}
                >
                  {div}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Section Detail Kasus & Vonis Takzir */}
        <div className="space-y-5 pt-8 border-t border-[#E2E8F0]">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] uppercase tracking-[0.5px] font-headline">
              Detail Kasus Pelanggaran & Bentuk Hukuman
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-body">
              Rincian dakwaan pelanggaran kedisiplinan dan sanksi edukatif yang ditetapkan mahkamah
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
              Kasus / Jenis Pelanggaran *
            </label>
            <input
              type="text"
              required
              value={violation}
              onChange={(e) => setViolation(e.target.value)}
              placeholder="Contoh: Terlambat Shalat Berjamaah Masbuq & Keluar Asrama Tanpa Izin"
              className="w-full h-10 px-3.5 text-xs text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0F172A] font-body"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
              Bentuk Takzir / Hukuman Edukatif *
            </label>
            <textarea
              required
              rows={3}
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="Contoh: Membersihkan Kamar Mandi Masjid 3 Hari & Menyetor Hafalan Juz 30"
              className="w-full p-3 text-xs text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0F172A] font-body resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                Tanggal Sidang Mahkamah *
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full h-10 px-3.5 text-xs text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0F172A] font-body cursor-pointer"
              />
            </div>

            {/* Interactive Severity Slider (replaces plain number input) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0F172A] font-headline">
                  Bobot Poin Pelanggaran
                </label>

                <div className="flex items-center gap-1.5 text-xs font-bold font-headline">
                  <span className="text-[#0F172A] flex items-center font-mono gap-0.5">
                    +<RollingNumber value={points} className="text-sm font-bold text-[#0F172A] mx-0.5" />
                    <PKIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[#94A3B8] font-normal">—</span>
                  <span className={`${getSeverityInfo(points).colorClass} font-semibold transition-colors duration-150`}>
                    {getSeverityInfo(points).label}
                  </span>
                </div>
              </div>

              <div className="relative py-1">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0F172A] transition-all focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, ${getSeverityInfo(points).accentColor} 0%, ${getSeverityInfo(points).accentColor} ${sliderFillPercent(points)}%, #E2E8F0 ${sliderFillPercent(points)}%, #E2E8F0 100%)`
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#94A3B8] font-medium px-1 select-none">
                <span className={points <= 12 ? 'text-emerald-700 font-bold' : ''}>1-12 Ringan</span>
                <span className={points >= 13 && points <= 25 ? 'text-amber-700 font-bold' : ''}>13-25 Sedang</span>
                <span className={points >= 26 && points <= 38 ? 'text-rose-600 font-bold' : ''}>26-38 Berat</span>
                <span className={points >= 39 ? 'text-red-700 font-bold' : ''}>39-50 Sangat Berat</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
              Catatan Eksekusi / Pengawas Mahkamah (Opsional)
            </label>
            <input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Contoh: Sidang dipimpin oleh Mahkamah Div. Keamanan & Bahasa"
              className="w-full h-10 px-3.5 text-xs text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#0F172A] font-body"
            />
          </div>
        </div>

        {/* 5. Footer Aksi & Navigasi Kembali */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#64748B] font-body">
            <span className="font-bold text-[#0F172A]">{selectedStudentIds.length} santri</span> akan otomatis diperbarui rekam kedisiplinannya secara atomik.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="h-10 px-5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedStudentIds.length === 0}
              className="h-10 px-6 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan Sesi Mahkamah...' : `Simpan Sesi Mahkamah (${selectedStudentIds.length})`}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
