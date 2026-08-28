import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  ChevronRight,
  X,
  UserCheck,
  Trophy,
  ShieldAlert,
  Award,
  BedDouble,
  ArrowUpRight
} from 'lucide-react';
import { 
  SchoolClass, 
  OFFICIAL_CLASSES,
  SantriRecord,
  subscribeToSantri
} from '../../lib/firestoreService';
import { useLenisModalLock } from '../../lib/lenis';
import { useIsMobile } from '../../lib/useIsMobile';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PillTabs, TabOption } from '../ui/PillTabs';
import { ScrollArea } from '../ui/ScrollArea';
import { StudentDetailModal } from '../modals/StudentDetailModal';
import { PPIcon } from '../ui/PointIcons';

interface ClassesViewProps {
  classes?: SchoolClass[];
  students?: SantriRecord[];
}

export const ClassesView: React.FC<ClassesViewProps> = ({ 
  classes = OFFICIAL_CLASSES,
  students: propStudents
}) => {
  const isMobile = useIsMobile(768);
  const [localStudents, setLocalStudents] = useState<SantriRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('ostifak_class_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ostifak_class_filter', selectedLevelFilter);
    } catch (e) {
      console.error('Error saving class filter:', e);
    }
  }, [selectedLevelFilter]);

  const [selectedClassModal, setSelectedClassModal] = useState<SchoolClass | null>(null);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<SantriRecord | null>(null);
  useLenisModalLock(!!selectedClassModal || !!selectedDetailStudent);

  // Subscribe to realtime students if not passed as prop
  useEffect(() => {
    if (propStudents && propStudents.length > 0) {
      setLocalStudents(propStudents);
      return;
    }
    const unsub = subscribeToSantri((data) => {
      setLocalStudents(data);
    });
    return () => unsub();
  }, [propStudents]);

  // Global Escape Key Listener for ClassesView
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDetailStudent) {
          setSelectedDetailStudent(null);
          return;
        }
        if (selectedClassModal) {
          setSelectedClassModal(null);
          return;
        }
      }
    };

    const handleCustomEscape = () => {
      setSelectedDetailStudent(null);
      setSelectedClassModal(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ostifak-escape-pressed', handleCustomEscape);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [selectedDetailStudent, selectedClassModal]);

  const activeStudents = propStudents && propStudents.length > 0 ? propStudents : localStudents;

  // Map class name -> array of SantriRecord
  const classSantriMap = useMemo(() => {
    const map = new Map<string, SantriRecord[]>();
    for (const s of activeStudents) {
      if (!s.kelas) continue;
      const normalizedKelas = s.kelas.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!map.has(normalizedKelas)) {
        map.set(normalizedKelas, []);
      }
      map.get(normalizedKelas)!.push(s);
    }
    return map;
  }, [activeStudents]);

  // Enrich classes with realtime student counts & names
  const enrichedClasses = useMemo(() => {
    return classes.map((cls) => {
      const normalized = cls.className.toLowerCase().replace(/\s+/g, ' ').trim();
      const matchingSantri = classSantriMap.get(normalized) || [];
      return {
        ...cls,
        studentCount: matchingSantri.length,
        students: matchingSantri.map((s) => s.studentName),
      };
    });
  }, [classes, classSantriMap]);

  // Filter Tabs: Semua Kelas + Tingkat 1 - 6 (tanpa count badge)
  const filterTabs: TabOption<string>[] = [
    { id: 'all', label: 'Semua Kelas' },
    { id: 'Tingkat 1', label: 'Kelas 1' },
    { id: 'Tingkat 2', label: 'Kelas 2' },
    { id: 'Tingkat 3', label: 'Kelas 3' },
    { id: 'Tingkat 4', label: 'Kelas 4 (IPA/IPS)' },
    { id: 'Tingkat 5', label: 'Kelas 5 (IPA/IPS)' },
    { id: 'Tingkat 6', label: 'Kelas 6 (IPA/IPS)' },
  ];

  // Filtered Classes
  const filteredClasses = enrichedClasses.filter((cls) => {
    if (selectedLevelFilter !== 'all' && cls.level !== selectedLevelFilter) {
      return false;
    }
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      cls.className.toLowerCase().includes(term) ||
      cls.generation.toLowerCase().includes(term) ||
      cls.major.toLowerCase().includes(term) ||
      cls.waliKelas.toLowerCase().includes(term)
    );
  });

  const totalClasses = classes.length;
  const uniqueLevels = Array.from(new Set(classes.map((c) => c.level))).length;
  const totalStudents = activeStudents.length;

  // Realtime students for class modal
  const modalClassSantri = useMemo(() => {
    if (!selectedClassModal) return [];
    const normalized = selectedClassModal.className.toLowerCase().replace(/\s+/g, ' ').trim();
    return classSantriMap.get(normalized) || [];
  }, [selectedClassModal, classSantriMap]);

  return (
    <div className="relative w-full overflow-x-hidden font-body min-h-screen">
      {/* 1. Base Layer: Classes View (Always rendered in DOM, preventing any blank screens) */}
      <div className={`space-y-8 font-body ${selectedDetailStudent ? 'pointer-events-none' : ''}`}>
        {/* Header (Unboxed, Zero Icon Policy) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
              Sistem & Manajemen Kelas
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-body">
              Acuan utama 9 Kelas resmi (Kelas 1 - 3, Kelas 4 - 6 IPA/IPS) untuk data santri, absensi, prestasi kelas, dan kedisiplinan.
            </p>
          </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Kelas, Jurusan, Angkatan..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] font-body"
            />
          </div>
        </div>
      </div>

      {/* 3 Summary Metrics (Unboxed 1-Row with Dividers) */}
      <div className="grid grid-cols-3 divide-x divide-[#E2E8F0] border-y border-[#E2E8F0] overflow-hidden">
        <div className="p-3 sm:px-5 sm:py-4 first:pl-2 sm:first:pl-4">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Kelas Terdaftar
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline whitespace-nowrap">
              {totalClasses}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] font-medium font-body hidden xs:inline">Kelas</span>
          </div>
        </div>

        <div className="p-3 sm:px-5 sm:py-4">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Tingkatan Kelas
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline whitespace-nowrap">
              {uniqueLevels}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] font-medium font-body hidden xs:inline">Tingkat</span>
          </div>
        </div>

        <div className="p-3 sm:px-5 sm:py-4 last:pr-2 sm:last:pr-4">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Total Santri
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline whitespace-nowrap">
              {totalStudents}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] font-medium font-body hidden xs:inline">Santri</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <PillTabs
          tabs={filterTabs}
          activeTab={selectedLevelFilter}
          onChange={(tab) => setSelectedLevelFilter(tab)}
        />
      </div>

      {/* Classes Grid: Exactly 2 Columns per Row for visual breathing space */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClasses.map((cls) => (
          <Card 
            key={cls.id} 
            variant="default" 
            className="p-6 space-y-5 hoverable cursor-pointer transition-all border border-[#E2E8F0]"
            onClick={() => setSelectedClassModal(cls)}
          >
            {/* Class Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-headline tracking-tight">{cls.className}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">{cls.level} • {cls.generation}</p>
              </div>
              <span className="text-xs font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-[4px]">
                {cls.studentCount} Santri
              </span>
            </div>

            {/* Unboxed 3 Aspect Stats (Bersih, Disiplin, Akademik) */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#E2E8F0]">
              <div>
                <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Kebersihan</p>
                <p className="text-lg font-bold text-[#0F172A] mt-0.5 flex items-center gap-1">
                  <span>{cls.cleanlinessScore || 0}</span>
                  <PPIcon className="w-4 h-4" />
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Disiplin</p>
                <p className="text-lg font-bold text-[#0F172A] mt-0.5 flex items-center gap-1">
                  <span>{cls.disciplineScore || 0}</span>
                  <PPIcon className="w-4 h-4" />
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Akademik</p>
                <p className="text-lg font-bold text-[#0F172A] mt-0.5 flex items-center gap-1">
                  <span>{cls.academicScore || 0}</span>
                  <PPIcon className="w-4 h-4" />
                </p>
              </div>
            </div>

            {/* Footer Detail Link & Wali Kelas */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Wali Kelas: <strong className="text-[#0F172A]">{cls.waliKelas}</strong></span>
              <span className="text-[#0F172A] font-semibold hover:underline flex items-center gap-1">
                Buka Detail <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>
      </div>

      {/* 2. Slide-Over Layer: Student Detail Page (Rendered simultaneously in DOM over base layer) */}
      <AnimatePresence>
        {selectedDetailStudent && (
          <motion.div
            key={`classes-student-detail-${selectedDetailStudent.id}`}
            data-lenis-prevent
            initial={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed inset-x-0 bottom-0 top-16 lg:top-14 lg:left-[220px] z-30 bg-[#F8FAFC] overflow-y-auto overscroll-contain"
          >
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 font-body">
              <StudentDetailModal
                student={selectedDetailStudent}
                classes={classes}
                onClose={() => setSelectedDetailStudent(null)}
                onStudentUpdated={(updatedStudent) => {
                  setLocalStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
                  setSelectedDetailStudent(updatedStudent);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Class Detail Modal Dialog — Mobile: Bottom Sheet, Desktop: Full-Page Right-to-Left Slide-In Panel (No Backdrop) */}
      <AnimatePresence>
        {selectedClassModal && !selectedDetailStudent && (
          <>
            <motion.div
              key={`class-detail-${selectedClassModal.id}`}
              data-lenis-prevent
              initial={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
              animate={{ x: 0, y: 0 }}
              exit={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
              transition={
                isMobile
                  ? { type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }
                  : { duration: 0.65, ease: [0.4, 0, 0.2, 1] }
              }
              className={
                isMobile
                  ? "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-[#FFFFFF] max-h-[88dvh] shadow-[0_-10px_40px_rgba(15,23,42,0.18)] border-t border-[#E2E8F0] overflow-hidden"
                  : "fixed inset-x-0 bottom-0 top-16 lg:top-14 lg:left-[220px] z-40 bg-[#F8FAFC] overflow-y-auto overscroll-contain"
              }
            >
              {/* Mobile Top Drag Handle */}
              <div className={`${isMobile ? 'flex' : 'hidden'} pt-3 pb-1 justify-center shrink-0 bg-[#F8FAFC]`}>
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Header (Clean Flat, Icon-Only Back Button Top-Left) */}
              <div className={`${isMobile ? 'px-6 py-3.5' : 'px-6 sm:px-10 py-4 sm:py-5'} border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0 flex items-center gap-3 sm:gap-4`}>
                <button
                  type="button"
                  onClick={() => setSelectedClassModal(null)}
                  aria-label="Tutup Detail Kelas"
                  title="Tutup Detail Kelas"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#0F172A] text-white hover:bg-[#1E293B] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A] truncate">
                    {selectedClassModal.className}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-body truncate">
                    {selectedClassModal.level} • {selectedClassModal.generation} • Jurusan {selectedClassModal.major}
                  </p>
                </div>
              </div>

              {/* Body - Scrollable Flat Sections with Thin Dividers */}
              <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${isMobile ? 'p-5 sm:p-6 space-y-8 text-xs pb-10' : 'max-w-4xl w-full mx-auto p-5 sm:p-8 space-y-8 text-xs'}`}>
                {/* Matriks Penilaian Kelas */}
                <div>
                  <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-3 text-xs">
                    MATRIKS PENILAIAN KELAS
                  </h4>
                  <div className="grid grid-cols-3 divide-x divide-[#E2E8F0] border-y border-[#E2E8F0] py-4">
                    <div className="pr-4">
                      <p className="text-[#64748B] font-medium uppercase text-[10px]">Kebersihan</p>
                      <p className="text-base font-bold text-[#0F172A] mt-0.5">
                        {selectedClassModal.cleanlinessScore > 0 ? `${selectedClassModal.cleanlinessScore} / 100` : 'Belum dinilai'}
                      </p>
                    </div>
                    <div className="px-4">
                      <p className="text-[#64748B] font-medium uppercase text-[10px]">Kedisiplinan</p>
                      <p className="text-base font-bold text-[#0F172A] mt-0.5">
                        {selectedClassModal.disciplineScore > 0 ? `${selectedClassModal.disciplineScore} / 100` : 'Belum dinilai'}
                      </p>
                    </div>
                    <div className="pl-4">
                      <p className="text-[#64748B] font-medium uppercase text-[10px]">Kerapian</p>
                      <p className="text-base font-bold text-[#0F172A] mt-0.5">
                        {selectedClassModal.neatnessScore > 0 ? `${selectedClassModal.neatnessScore} / 100` : 'Belum dinilai'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anggota Santri Kelas */}
                <div className="border-b border-[#E2E8F0] pb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline text-xs">
                      ANGGOTA SANTRI ({modalClassSantri.length})
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                      <span className="text-[11px] text-[#64748B] font-medium">Aktif</span>
                    </div>
                  </div>

                  {modalClassSantri.length === 0 ? (
                    <p className="text-[#64748B]">Belum ada santri yang didaftarkan ke kelas ini.</p>
                  ) : (
                    <ScrollArea
                      className="max-h-60"
                      viewportClassName="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1"
                      topOffset="top-1"
                      bottomOffset="bottom-1"
                    >
                      {modalClassSantri.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => setSelectedDetailStudent(res)}
                          className="bg-white rounded-xl border border-slate-200/80 hover:border-[#059669] hover:bg-slate-50/80 shadow-2xs transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-[#0F172A] text-xs truncate block group-hover:text-[#059669] transition-colors">{res.studentName}</span>
                              <span className="text-[10px] text-[#64748B]">{res.kamar || 'Kamar -'}</span>
                            </div>
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] group-hover:bg-[#059669] group-hover:border-[#059669] text-[#475569] group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
                              <div className="relative w-3.5 h-3.5 overflow-hidden flex items-center justify-center">
                                <ArrowUpRight className="w-3.5 h-3.5 text-inherit transition-transform duration-300 ease-out transform group-hover:translate-x-3.5 group-hover:-translate-y-3.5 shrink-0" />
                                <ArrowUpRight className="w-3.5 h-3.5 text-inherit absolute inset-0 transition-transform duration-300 ease-out transform -translate-x-3.5 translate-y-3.5 group-hover:translate-x-0 group-hover:translate-y-0 shrink-0" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
                            <span>{res.hafalan || '0 Juz'}</span>
                            <span className={res.isTahsinPassed ? 'text-[#059669] font-medium' : 'text-[#D97706] font-medium'}>
                              {res.isTahsinPassed ? 'Lulus Tahsin' : 'Bimbingan'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>

                {/* Rekam Prestasi & Rekam Pelanggaran (2 Kolom Flat with Dividers) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="md:pr-8 md:border-r md:border-[#E2E8F0]">
                    <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-2 text-xs">
                      REKAM PRESTASI
                    </h4>
                    <p className="text-[#64748B] italic">Belum ada riwayat prestasi.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-2 text-xs">
                      REKAM PELANGGARAN
                    </h4>
                    <p className="text-[#64748B] italic">Belum ada riwayat pelanggaran.</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#F8FAFC] px-6 py-3.5 pb-8 sm:pb-3.5 border-t border-[#E2E8F0] flex items-center justify-end shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedClassModal(null)}
                  className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
                >
                  Tutup Detail
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
