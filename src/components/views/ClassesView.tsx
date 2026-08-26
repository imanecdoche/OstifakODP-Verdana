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
                <p className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {cls.cleanlinessScore > 0 ? `${cls.cleanlinessScore} Pts` : '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Disiplin</p>
                <p className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {cls.disciplineScore > 0 ? `${cls.disciplineScore} Pts` : '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Akademik</p>
                <p className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {cls.academicScore > 0 ? `${cls.academicScore} Pts` : '-'}
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
            initial={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute top-0 left-0 right-0 z-20 w-full min-h-full bg-[#F8FAFC]"
          >
            <StudentDetailModal
              student={selectedDetailStudent}
              classes={classes}
              onClose={() => setSelectedDetailStudent(null)}
              onStudentUpdated={(updatedStudent) => {
                setLocalStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
                setSelectedDetailStudent(updatedStudent);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Class Detail Modal Dialog */}
      {selectedClassModal && !selectedDetailStudent && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-[#FFFFFF] w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-lg shadow-[0_8px_32px_rgba(15,23,42,0.15)] border border-[#E2E8F0] overflow-hidden my-auto">
            
            {/* Modal Header (Clean Flat Header, Zero Icon Policy) */}
            <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A]">
                {selectedClassModal.className}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                {selectedClassModal.level} • {selectedClassModal.generation} • Jurusan {selectedClassModal.major}
              </p>
            </div>

            {/* Modal Body - Scrollable */}
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-4 sm:p-6 space-y-6 text-xs pb-12 sm:pb-6"
              topOffset="top-4"
              bottomOffset="bottom-4"
            >
              {/* Matriks Penilaian Kelas (Tanpa Penomoran) */}
              <div>
                <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-3 text-xs">
                  MATRIKS PENILAIAN KELAS
                </h4>
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <div>
                    <p className="text-[#64748B] font-medium uppercase text-[10px]">Kebersihan</p>
                    <p className="text-base font-bold text-[#0F172A] mt-0.5">
                      {selectedClassModal.cleanlinessScore > 0 ? `${selectedClassModal.cleanlinessScore} / 100` : 'Belum dinilai'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium uppercase text-[10px]">Kedisiplinan</p>
                    <p className="text-base font-bold text-[#0F172A] mt-0.5">
                      {selectedClassModal.disciplineScore > 0 ? `${selectedClassModal.disciplineScore} / 100` : 'Belum dinilai'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium uppercase text-[10px]">Akademik / Tahfizh</p>
                    <p className="text-base font-bold text-[#0F172A] mt-0.5">
                      {selectedClassModal.academicScore > 0 ? `${selectedClassModal.academicScore} / 100` : 'Belum dinilai'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Santri Kelas (Unboxed, Scrollable List) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline text-xs">
                    DAFTAR SANTRI KELAS
                  </h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    modalClassSantri.length > 0 ? 'bg-[#059669]/10 text-[#059669]' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}>
                    Total {modalClassSantri.length} Terdaftar
                  </span>
                </div>
                {modalClassSantri.length === 0 ? (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[#64748B] text-center">
                    Belum ada santri yang didaftarkan ke kelas ini.
                  </div>
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

              {/* Rekam Prestasi & Rekam Pelanggaran (2 Kolom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-2 text-xs">
                    REKAM PRESTASI
                  </h4>
                  <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <p className="text-[#64748B] italic">
                      Belum ada riwayat prestasi.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-2 text-xs">
                    REKAM PELANGGARAN
                  </h4>
                  <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <p className="text-[#64748B] italic">
                      Belum ada riwayat pelanggaran.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Modal Fixed Footer */}
            <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-[#E2E8F0] flex items-center justify-end shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedClassModal(null)}
                className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
              >
                Tutup Detail
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
