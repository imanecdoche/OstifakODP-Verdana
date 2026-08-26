import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SeverityLevel, 
  PenaltyStatus, 
  ViolationRecord 
} from '../../types';
import { DormitoryRoom, SantriRecord } from '../../lib/firestoreService';
import { getSeverityInfo, sliderFillPercent } from '../../lib/severityUtils';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';
import { useLenisModalLock } from '../../lib/lenis';

interface RollingDigitProps {
  digit: string;
}

const RollingDigit: React.FC<RollingDigitProps> = ({ digit }) => {
  const num = parseInt(digit, 10);
  if (isNaN(num)) {
    return <span>{digit}</span>;
  }

  return (
    <span className="inline-block h-[1.15em] w-[0.62em] overflow-hidden relative leading-[1.15em] text-center align-baseline">
      <motion.span
        initial={false}
        animate={{ y: `-${num * 10}%` }}
        transition={{
          type: 'spring',
          stiffness: 460,
          damping: 26,
          mass: 0.6
        }}
        className="flex flex-col select-none"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1.15em] flex items-center justify-center font-mono font-bold">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

export const RollingNumber: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const digits = String(value).split('');

  return (
    <span className={`inline-flex items-center font-mono tracking-tight ${className}`}>
      {digits.map((d, i) => (
        <RollingDigit key={`${digits.length - i}-${d}`} digit={d} />
      ))}
    </span>
  );
};

interface NewViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddViolation: (record: Omit<ViolationRecord, 'id'>) => void;
  rooms?: DormitoryRoom[];
  students?: SantriRecord[];
}

export const NewViolationModal: React.FC<NewViolationModalProps> = ({
  isOpen,
  onClose,
  onAddViolation,
  rooms = [],
  students = [],
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [nis, setNis] = useState('');
  const [kamar, setKamar] = useState('');
  const [kelas, setKelas] = useState('');
  const [violation, setViolation] = useState('');
  const [category, setCategory] = useState('Disiplin & Ibadah');
  const [points, setPoints] = useState<number>(10);
  const [penaltyDescription, setPenaltyDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Divisi Keamanan');
  const studentComboRef = useRef<HTMLDivElement>(null);

  useLenisModalLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (isStudentOpen) {
          setIsStudentOpen(false);
          return;
        }
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
  }, [isOpen, onClose, isStudentOpen]);


  const severityInfo = getSeverityInfo(points);

  // Close student combobox on outside click
  useEffect(() => {
    if (!isStudentOpen) return;
    const handler = (e: MouseEvent) => {
      if (studentComboRef.current && !studentComboRef.current.contains(e.target as Node)) {
        setIsStudentOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isStudentOpen]);

  if (!isOpen) return null;

  const term = studentQuery.trim().toLowerCase();
  const filteredStudents = term
    ? students.filter((s) => 
        s.studentName.toLowerCase().includes(term) ||
        (s.kamar && s.kamar.toLowerCase().includes(term)) ||
        (s.kelas && s.kelas.toLowerCase().includes(term))
      )
    : students;

  const handleSelectStudent = (s: SantriRecord) => {
    setStudentName(s.studentName);
    setNis(s.nis && s.nis !== '-' ? s.nis : '2024.12.001');
    setKamar(s.kamar || 'Kamar -');
    setKelas(s.kelas || 'Kelas -');
    setStudentQuery('');
    setIsStudentOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !violation) return;

    onAddViolation({
      studentName,
      nis: nis || '2024.12.001',
      kamar: kamar || 'Qatar 1',
      violation,
      category,
      points: Number(points),
      severity: severityInfo.severity,
      status: 'belum_dihukum',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      penaltyDescription: penaltyDescription || 'Menunggu sidang mahkamah divisi',
      reportedBy,
    });

    // Reset & Close
    setStudentName('');
    setStudentQuery('');
    setIsStudentOpen(false);
    setNis('');
    setKamar('');
    setKelas('');
    setViolation('');
    setPenaltyDescription('');
    setPoints(10);
    onClose();
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
      <div className="bg-white w-full max-w-2xl md:max-w-3xl rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-[#E2E8F0] overflow-hidden my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header Modal (Clean Flat Header, Zero Icon Policy) */}
        <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
          <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A]">Catat Pelanggaran Santri</h3>
          <p className="text-xs text-[#64748B] font-body mt-0.5">Input berkas sidang & rekam poin kedisiplinan santri</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-8">
          
          {/* Row 1: Searchable Combobox Santri */}
          <div ref={studentComboRef} className="relative">
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
              Nama Lengkap Santri *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={isStudentOpen ? studentQuery : studentName}
                onChange={(e) => {
                  setStudentQuery(e.target.value);
                  setIsStudentOpen(true);
                }}
                onFocus={() => {
                  setStudentQuery('');
                  setIsStudentOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsStudentOpen(false);
                  if (e.key === 'Enter' && isStudentOpen && filteredStudents.length > 0) {
                    e.preventDefault();
                    handleSelectStudent(filteredStudents[0]);
                  }
                }}
                placeholder="Ketik untuk mencari nama santri..."
                className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:bg-white focus:outline-none transition-all cursor-pointer font-medium"
              />
            </div>

            {/* Custom Floating Dropdown Overlay */}
            {isStudentOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 animate-in fade-in zoom-in-95">
                <ScrollArea
                  className="max-h-60"
                  viewportClassName="p-1.5 space-y-1"
                  topOffset="top-1"
                  bottomOffset="bottom-1"
                >
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center">
                      <p className="font-semibold text-slate-700">Santri tidak ditemukan</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Coba cari dengan kata kunci nama atau asrama lain.</p>
                    </div>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        className={`w-full px-3.5 py-2.5 rounded-lg flex flex-col text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                          studentName === s.studentName ? 'bg-emerald-50/80 border border-emerald-200/60' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{s.studentName}</span>
                          {s.nis && s.nis !== '-' && (
                            <span className="text-[10px] font-mono text-slate-400">NIS: {s.nis}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          Kamar {s.kamar || '-'} • {s.kelas || '-'}
                        </span>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Row 2: Kamar Asrama & Kelas Santri (Otomatis & Disabled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                Kamar Asrama (Otomatis)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={kamar || 'Pilih santri terlebih dahulu'}
                className="w-full h-10 px-3.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed font-medium select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                Kelas Santri (Otomatis)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={kelas || 'Pilih santri terlebih dahulu'}
                className="w-full h-10 px-3.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed font-medium select-none"
              />
            </div>
          </div>

          {/* Row 3: Kategori Pelanggaran & Tindakan Pelanggaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                Kategori Pelanggaran *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#142A18] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Disiplin & Ibadah">Disiplin & Ibadah</option>
                <option value="Bahasa & Komunikasi">Bahasa & Komunikasi</option>
                <option value="Kebersihan & Kerapihan">Kebersihan & Kerapihan</option>
                <option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
                <option value="Etika & Akhlaq">Etika & Akhlaq</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
                Tindakan Pelanggaran *
              </label>
              <input
                type="text"
                required
                value={violation}
                onChange={(e) => setViolation(e.target.value)}
                placeholder="Contoh: Terlambat Masuk Halaqah Shubuh"
                className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#142A18] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Range Slider Bobot Poin & Kategori Plain Text */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A] font-headline">
                Tingkat Keparahan Kasus & Bobot Poin
              </label>

              {/* Dynamic Jackpot Rolling Number & Plain Text Category (No Badges / No Boxes) */}
              <div className="flex items-center gap-1.5 text-xs font-bold font-headline">
                <span className="text-slate-900 flex items-center font-mono">
                  +<RollingNumber value={points} className="text-sm font-bold text-slate-900 mx-0.5" /> PK
                </span>
                <span className="text-slate-400 font-normal">—</span>
                <span className={`${severityInfo.colorClass} font-semibold transition-colors duration-150`}>
                  {severityInfo.label}
                </span>
              </div>
            </div>

            {/* Range Slider HTML Input (min 1, max 50) */}
            <div className="relative py-1">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#142A18] transition-all focus:outline-none"
                style={{
                  background: `linear-gradient(to right, ${severityInfo.accentColor} 0%, ${severityInfo.accentColor} ${sliderFillPercent(points)}%, #E2E8F0 ${sliderFillPercent(points)}%, #E2E8F0 100%)`
                }}
              />
            </div>

            {/* Threshold Milestones (Plain Text) */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1 select-none">
              <span className={points <= 12 ? 'text-emerald-700 font-bold' : ''}>1-12 Ringan</span>
              <span className={points >= 13 && points <= 25 ? 'text-amber-700 font-bold' : ''}>13-25 Sedang</span>
              <span className={points >= 26 && points <= 38 ? 'text-rose-600 font-bold' : ''}>26-38 Berat</span>
              <span className={points >= 39 ? 'text-red-700 font-bold' : ''}>39-50 Sangat Berat</span>
            </div>
          </div>

          {/* Row 5: Rekomendasi Hukuman / Takzir */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-headline">
              Rekomendasi Hukuman / Takzir
            </label>
            <textarea
              rows={2}
              value={penaltyDescription}
              onChange={(e) => setPenaltyDescription(e.target.value)}
              placeholder="Contoh: Membaca Al-Quran 1 Juz di teras masjid selama 3 hari berturut-turut."
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-[#142A18] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Berkas Pelanggaran
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

