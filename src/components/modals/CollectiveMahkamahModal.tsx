import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { SantriRecord, recordCollectiveMahkamahSession } from '../../lib/firestoreService';
import { gooeyToast } from 'goey-toast';

interface CollectiveMahkamahModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: SantriRecord[];
  onSuccess?: () => void;
}

const AVAILABLE_DIVISIONS = [
  'Divisi Keamanan',
  'Divisi Ibadah & Masjid',
  'Divisi Tahfizh & Diniyah',
  'Divisi Bahasa (Lughah)',
  'Divisi Kebersihan & Asrama',
  'Divisi Kesehatan & UKS',
  'BPH & Pengasuhan',
];

export const CollectiveMahkamahModal: React.FC<CollectiveMahkamahModalProps> = ({
  isOpen,
  onClose,
  students,
  onSuccess,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(['Divisi Keamanan']);
  const [violation, setViolation] = useState('');
  const [penalty, setPenalty] = useState('');
  const [points, setPoints] = useState<number>(10);
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
    if (!studentSearch.trim()) return students.slice(0, 24);
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

  useEffect(() => {
    if (!isOpen) return;
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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      setPoints(10);
      setSessionNotes('');
      onSuccess?.();
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        data-modal="true"
        className="relative w-full max-w-5xl h-[92vh] max-h-[94vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto font-body"
      >
        {/* Header (Clean & Unboxed Tanpa Ikon) */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200 bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-headline tracking-tight">
              Sidang Mahkamah Kolektif
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pencatatan vonis takzir serentak untuk multi-santri dan multi-divisi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7">
          {/* Section: Pemilihan Santri */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-headline">
                Pilih Santri yang Disidang ({selectedStudentIds.length} Terpilih)
              </h3>
              {selectedStudentIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllSelected}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer transition-colors"
                >
                  Hapus Semua Pilihan
                </button>
              )}
            </div>

            {/* Selected Santri Tag List */}
            {selectedStudentList.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-32 overflow-y-auto no-scrollbar">
                {selectedStudentList.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 border border-slate-200 rounded-md text-xs font-medium"
                  >
                    <span>{s.studentName}</span>
                    <span className="text-[10px] text-slate-400">({s.kamar || s.kelas})</span>
                    <button
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Ketik nama santri, NIS, kamar, atau kelas..."
                className="w-full h-10 pl-10 pr-28 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-body"
              />
              {searchedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllSearched}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  + Pilih Semua ({searchedStudents.length})
                </button>
              )}
            </div>

            {/* Scrollable Santri Grid with Edge Shadows & no-scrollbar */}
            <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-white">
              {/* Top Edge Shadow */}
              <div
                className={`pointer-events-none absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-slate-200/50 to-transparent z-10 transition-opacity duration-200 ${
                  showTopShadow ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Bottom Edge Shadow */}
              <div
                className={`pointer-events-none absolute left-0 right-0 bottom-0 h-6 bg-gradient-to-t from-slate-200/50 to-transparent z-10 transition-opacity duration-200 ${
                  showBottomShadow ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div
                ref={santriListRef}
                onScroll={checkSantriScroll}
                className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto no-scrollbar"
              >
                {searchedStudents.map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className={`text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold truncate">{s.studentName}</p>
                      <p className={`text-[11px] truncate mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {s.kamar || '-'} · {s.kelas || '-'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Divisi Penyelenggara */}
          <div className="space-y-3.5 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-headline">
              Divisi Penyelenggara & Terkait
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_DIVISIONS.map((div) => {
                const isSelected = selectedDivisions.includes(div);
                return (
                  <button
                    key={div}
                    type="button"
                    onClick={() => toggleDivision(div)}
                    className={`px-4 py-2 rounded-lg text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {div}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Detail Kasus & Vonis Takzir */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-headline">
              Detail Kasus Pelanggaran & Bentuk Hukuman
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kasus / Jenis Pelanggaran *
              </label>
              <input
                type="text"
                required
                value={violation}
                onChange={(e) => setViolation(e.target.value)}
                placeholder="Contoh: Terlambat Shalat Berjamaah Masbuq & Keluar Asrama Tanpa Izin"
                className="w-full h-10 px-3.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-body"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bentuk Takzir / Hukuman Edukatif *
              </label>
              <textarea
                required
                rows={2}
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)}
                placeholder="Contoh: Membersihkan Kamar Mandi Masjid 3 Hari & Menyetor Hafalan Juz 30"
                className="w-full p-3 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-body"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tanggal Sidang Mahkamah *
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-body cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bobot Poin Pelanggaran (Opsional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full h-10 px-3.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catatan Eksekusi / Pengawas Mahkamah (Opsional)
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Contoh: Sidang dipimpin oleh Mahkamah Divisi Keamanan & Bahasa"
                className="w-full h-10 px-3.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs font-body"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              <span>{selectedStudentIds.length} santri</span> akan otomatis diperbarui secara atomik.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedStudentIds.length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Menyimpan Sesi Mahkamah...' : `Simpan Sesi Mahkamah (${selectedStudentIds.length})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
