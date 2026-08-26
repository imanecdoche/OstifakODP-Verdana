import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  BedDouble, 
  ChevronRight,
  X,
  UserCheck,
  Trophy,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { 
  Dormitory, 
  DormitoryRoom, 
  OFFICIAL_DORMITORIES, 
  ALL_OFFICIAL_ROOMS,
  SantriRecord,
  subscribeToSantri
} from '../../lib/firestoreService';
import { useLenisModalLock } from '../../lib/lenis';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PillTabs, TabOption } from '../ui/PillTabs';
import { ScrollArea } from '../ui/ScrollArea';
import { StudentDetailModal } from '../modals/StudentDetailModal';

interface DormitoryViewProps {
  dormitories?: Dormitory[];
  rooms?: DormitoryRoom[];
  students?: SantriRecord[];
}

export const DormitoryView: React.FC<DormitoryViewProps> = ({ 
  dormitories = OFFICIAL_DORMITORIES,
  rooms = ALL_OFFICIAL_ROOMS,
  students: propStudents
}) => {
  const [localStudents, setLocalStudents] = useState<SantriRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDormFilter, setSelectedDormFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('ostifak_dorm_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ostifak_dorm_filter', selectedDormFilter);
    } catch (e) {
      console.error('Error saving dorm filter:', e);
    }
  }, [selectedDormFilter]);

  const [hideFullRooms, setHideFullRooms] = useState(false);
  const [selectedRoomModal, setSelectedRoomModal] = useState<DormitoryRoom | null>(null);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<SantriRecord | null>(null);
  useLenisModalLock(!!selectedRoomModal || !!selectedDetailStudent);

  // Sticky floating segmented bar: detect when original filter bar leaves viewport (top)
  const [isSticky, setIsSticky] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Global Escape Key Listener for DormitoryView
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDetailStudent) {
          setSelectedDetailStudent(null);
          return;
        }
        if (selectedRoomModal) {
          setSelectedRoomModal(null);
          return;
        }
      }
    };

    const handleCustomEscape = () => {
      setSelectedDetailStudent(null);
      setSelectedRoomModal(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ostifak-escape-pressed', handleCustomEscape);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [selectedDetailStudent, selectedRoomModal]);

  // Subscribe to realtime students if not passed as prop or to ensure reactivity
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

  const activeStudents = propStudents && propStudents.length > 0 ? propStudents : localStudents;

  // Map room name -> array of SantriRecord
  const roomSantriMap = useMemo(() => {
    const map = new Map<string, SantriRecord[]>();
    for (const s of activeStudents) {
      if (!s.kamar) continue;
      const normalizedKamar = s.kamar.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!map.has(normalizedKamar)) {
        map.set(normalizedKamar, []);
      }
      map.get(normalizedKamar)!.push(s);
    }
    return map;
  }, [activeStudents]);

  // Enrich dormitories and rooms with realtime occupancy & residents
  const enrichedDormitories = useMemo(() => {
    return dormitories.map((dorm) => {
      const enrichedRooms = dorm.rooms.map((room) => {
        const normalized = room.roomName.toLowerCase().replace(/\s+/g, ' ').trim();
        const matchingSantri = roomSantriMap.get(normalized) || [];
        return {
          ...room,
          occupiedCount: matchingSantri.length,
          residents: matchingSantri.map((s) => s.studentName),
        };
      });

      return {
        ...dorm,
        rooms: enrichedRooms,
      };
    });
  }, [dormitories, roomSantriMap]);

  // Filter Tabs: Semua Asrama + 8 Nama Asrama (tanpa count badge)
  const filterTabs: TabOption<string>[] = [
    { id: 'all', label: 'Semua Asrama' },
    ...dormitories.map((d) => ({
      id: d.id,
      label: d.name.replace('Asrama ', ''),
    })),
  ];

  // Filtered Dormitories and Rooms (with hideFullRooms logic)
  const filteredDormitories = enrichedDormitories
    .map((dorm) => {
      let matchingRooms = dorm.rooms;
      if (hideFullRooms) {
        matchingRooms = matchingRooms.filter((r) => r.occupiedCount < r.capacity);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDorm = dorm.name.toLowerCase().includes(term);
        if (!matchesDorm) {
          matchingRooms = matchingRooms.filter((r) => r.roomName.toLowerCase().includes(term));
        }
      }
      return {
        ...dorm,
        rooms: matchingRooms,
      };
    })
    .filter((dorm) => {
      if (selectedDormFilter !== 'all' && dorm.id !== selectedDormFilter) {
        return false;
      }
      return dorm.rooms.length > 0;
    });

  const totalDorms = dormitories.length;
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = activeStudents.filter((s) => s.kamar && s.kamar !== '-').length;

  // Realtime students for modal
  const modalRoomSantri = useMemo(() => {
    if (!selectedRoomModal) return [];
    const normalized = selectedRoomModal.roomName.toLowerCase().replace(/\s+/g, ' ').trim();
    return roomSantriMap.get(normalized) || [];
  }, [selectedRoomModal, roomSantriMap]);

  return (
    <div className="space-y-8">
      {/* Header (Unboxed, Zero Icon Policy) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
            Sistem & Manajemen Per-asramaan
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">
            Acuan utama 8 Asrama dan 24 Kamar santri untuk data kedisiplinan, prestasi (kebersihan, kerapihan, keindahan), dan profil santri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Asrama atau Kamar..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] font-body"
            />
          </div>
        </div>
      </div>

      {/* 4 Summary Metrics (Unboxed 1-Row with Dividers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E2E8F0] py-3.5 border-y border-[#E2E8F0]">
        <div className="px-3 sm:px-6 first:pl-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Asrama Terdaftar
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {totalDorms}
            </span>
          </div>
        </div>

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Total Kamar
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {totalRooms}
            </span>
          </div>
        </div>

        <div className="px-3 sm:px-6">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Total Kapasitas
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline">
              {totalCapacity}
            </span>
          </div>
        </div>

        <div className="px-3 sm:px-6 last:pr-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]">
            Santri Menghuni
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight font-headline">
              {totalOccupied}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Navigation & Hide Full Checkbox (Clean Single Line Layout) */}
      <div ref={filterBarRef} className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs
          tabs={filterTabs}
          activeTab={selectedDormFilter}
          onChange={(tab) => setSelectedDormFilter(tab)}
        />

        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm hover:bg-slate-50 cursor-pointer transition-colors select-none shrink-0">
          <input
            type="checkbox"
            checked={hideFullRooms}
            onChange={(e) => setHideFullRooms(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] focus:ring-offset-0 cursor-pointer accent-[#0F172A]"
          />
          <span>Sembunyikan Kamar Penuh</span>
        </label>
      </div>

      {/* Dormitories Hierarchical Sections (divider-separated, unboxed) */}
      {filteredDormitories.length === 0 ? (
        <div className="p-8 bg-white border border-[#E2E8F0] rounded-xl text-center space-y-2">
          <p className="font-bold text-sm text-[#0F172A]">Tidak Ada Kamar yang Sesuai</p>
          <p className="text-xs text-[#64748B]">
            {hideFullRooms
              ? 'Semua kamar di filter ini saat ini sudah penuh terisi.'
              : 'Tidak ditemukan asrama atau kamar yang cocok dengan kriteria pencarian.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredDormitories.map((dorm) => (
            <div key={dorm.id} className="space-y-4">
              {/* Unboxed Dormitory Header with Clean Single Top Divider */}
              <div className="border-t border-[#E2E8F0] pt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="text-4xl font-black text-[#0F172A] font-headline tracking-tight">
                {dorm.name}
              </h2>
              <span className="text-xs font-semibold text-[#059669] bg-[#059669]/10 px-2.5 py-0.5 rounded-full">
                {dorm.roomCount} Kamar
              </span>
              <span className="text-xs text-[#64748B]">
                • Kapasitas Maksimal: <strong className="text-[#0F172A]">{dorm.id === 'asrama-indonesia' ? '12 Orang / Kamar' : '7 Orang / Kamar'}</strong>
              </span>
            </div>

            {/* Rooms Grid: Exactly 2 Columns per Row for visual breathing space */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dorm.rooms.map((room) => {
                const occupancyRate = room.capacity > 0 ? Math.round((room.occupiedCount / room.capacity) * 100) : 0;
                return (
                  <Card 
                    key={room.id} 
                    variant="default" 
                    className="p-6 space-y-5 hoverable cursor-pointer transition-all border border-[#E2E8F0]"
                    onClick={() => setSelectedRoomModal(room)}
                  >
                    {/* Room Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#0F172A] font-headline tracking-tight">{room.roomName}</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{dorm.name} • Kapasitas {room.capacity} Santri</p>
                      </div>
                      <span className="text-xs font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-[4px]">
                        {room.occupiedCount}/{room.capacity} Santri
                      </span>
                    </div>

                    {/* Unboxed 3 Aspect Stats (Bersih, Rapi, Indah) */}
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#E2E8F0]">
                      <div>
                        <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Bersih</p>
                        <p className="text-lg font-bold text-[#0F172A] mt-0.5">
                          {room.cleanlinessScore > 0 ? `${room.cleanlinessScore} Pts` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Rapi</p>
                        <p className="text-lg font-bold text-[#0F172A] mt-0.5">
                          {room.neatnessScore > 0 ? `${room.neatnessScore} Pts` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#64748B] uppercase font-semibold tracking-wide">Indah</p>
                        <p className="text-lg font-bold text-[#0F172A] mt-0.5">
                          {room.aestheticScore > 0 ? `${room.aestheticScore} Pts` : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Occupancy Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs text-[#64748B]">
                        <span>Okupansi Kamar</span>
                        <span className="font-medium text-[#0F172A]">{room.occupiedCount} dari {room.capacity} Terisi</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#059669] h-full rounded-full transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Detail Link */}
                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Data santri & inspeksi</span>
                      <span className="text-[#0F172A] font-semibold hover:underline flex items-center gap-1">
                        Buka Detail <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Floating Sticky Segmented Bar (right of 260px sidebar, below sticky header) */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-20 left-6 lg:left-[280px] z-40 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-full p-1.5 flex items-center gap-2 max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-340px)]"
          >
            <PillTabs
              tabs={filterTabs}
              activeTab={selectedDormFilter}
              onChange={(tab) => setSelectedDormFilter(tab)}
            />
            <label className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs hover:bg-slate-50 cursor-pointer transition-colors select-none shrink-0 mr-1">
              <input
                type="checkbox"
                checked={hideFullRooms}
                onChange={(e) => setHideFullRooms(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] focus:ring-offset-0 cursor-pointer accent-[#0F172A]"
              />
              <span>Sembunyikan Kamar Penuh</span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Detail Modal Dialog */}
      {selectedRoomModal && !selectedDetailStudent && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain font-body">
          <div className="bg-[#FFFFFF] w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-lg shadow-[0_8px_32px_rgba(15,23,42,0.15)] border border-[#E2E8F0] overflow-hidden my-auto">
            
            {/* Modal Header (Clean Flat Header, Zero Icon Policy) */}
            <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A]">
                Kamar {selectedRoomModal.roomName}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-body">
                {selectedRoomModal.dormitoryName} • Kapasitas Maksimal {selectedRoomModal.capacity} Santri
              </p>
            </div>

            {/* Modal Body - Scrollable */}
            <ScrollArea
              className="flex-1 min-h-0"
              viewportClassName="p-4 sm:p-6 space-y-6 text-xs pb-12 sm:pb-6"
              topOffset="top-4"
              bottomOffset="bottom-4"
            >
              {/* Matriks Penilaian Kamar */}
              <div>
                <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline mb-3 text-xs">
                  MATRIKS PENILAIAN KAMAR
                </h4>
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <div>
                    <p className="text-[#64748B] font-medium uppercase text-[10px]">Kebersihan</p>
                    <p className="text-base font-bold text-[#0F172A] mt-0.5">
                      {selectedRoomModal.cleanlinessScore > 0 ? `${selectedRoomModal.cleanlinessScore} / 100` : 'Belum dinilai'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium uppercase text-[10px]">Kerapihan</p>
                    <p className="text-base font-bold text-[#0F172A] mt-0.5">
                      {selectedRoomModal.neatnessScore > 0 ? `${selectedRoomModal.neatnessScore} / 100` : 'Belum dinilai'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium uppercase text-[10px]">Keindahan</p>
                    <p className="text-base font-bold text-[#0F172A] mt-0.5">
                      {selectedRoomModal.aestheticScore > 0 ? `${selectedRoomModal.aestheticScore} / 100` : 'Belum dinilai'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Santri Penghuni (Unboxed Scrollable List) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#0F172A] uppercase tracking-[0.5px] font-headline text-xs">
                    DAFTAR SANTRI PENGHUNI
                  </h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    modalRoomSantri.length > 0 ? 'bg-[#059669]/10 text-[#059669]' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}>
                    Okupansi {selectedRoomModal.capacity > 0 ? Math.round((modalRoomSantri.length / selectedRoomModal.capacity) * 100) : 0}% ({modalRoomSantri.length}/{selectedRoomModal.capacity})
                  </span>
                </div>
                {modalRoomSantri.length === 0 ? (
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[#64748B] text-center">
                    Belum ada santri yang didaftarkan ke kamar ini.
                  </div>
                ) : (
                  <ScrollArea
                    className="max-h-60"
                    viewportClassName="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1"
                    topOffset="top-1"
                    bottomOffset="bottom-1"
                  >
                    {modalRoomSantri.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => setSelectedDetailStudent(res)}
                        className="flex flex-col p-3 bg-white rounded-xl border border-slate-200/80 hover:bg-slate-50/80 shadow-2xs transition-all relative overflow-hidden group cursor-pointer"
                      >
                        {/* Overlay Shutter Shortcut */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailStudent(res);
                          }}
                          className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto flex items-center justify-center z-10 cursor-pointer"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetailStudent(res);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#142A18] font-bold text-[11px] shadow-lg hover:bg-emerald-50 hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95"
                          >
                            <span>Buka Detail Santri</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#059669]" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="font-bold text-[#0F172A] text-xs truncate">{res.studentName}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#F1F5F9] text-[#475569] rounded shrink-0">
                            {res.kelas}
                          </span>
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
                onClick={() => setSelectedRoomModal(null)}
                className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
              >
                Tutup Detail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal Detail Santri (Seamless Sub-Modal Flow) */}
      <StudentDetailModal
        student={selectedDetailStudent}
        dormitories={dormitories}
        rooms={rooms}
        onClose={() => setSelectedDetailStudent(null)}
        onStudentUpdated={(updatedStudent) => {
          setLocalStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
          setSelectedDetailStudent(updatedStudent);
        }}
      />
    </div>
  );
};
