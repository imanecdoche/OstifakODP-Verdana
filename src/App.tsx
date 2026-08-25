import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { mockNotifications } from './data/mockData';
import { UserProfile, DivisionId, ViolationRecord, WorkProgram } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RightPanel } from './components/layout/RightPanel';
import { DashboardView } from './components/views/DashboardView';
import { ViolationsView } from './components/views/ViolationsView';
import { WorkProgramsView } from './components/views/WorkProgramsView';
import { StudentsView } from './components/views/StudentsView';
import { DormitoryView } from './components/views/DormitoryView';
import { ClassesView } from './components/views/ClassesView';
import { DirectivesView } from './components/views/DirectivesView';
import { DivisionDetailView } from './components/views/DivisionDetailView';
import { LoginPage } from './components/views/LoginPage';
import { PageTransition } from './components/ui/PageTransition';
import { NewViolationModal } from './components/modals/NewViolationModal';
import { NewProgramModal } from './components/modals/NewProgramModal';
import { useLenisSmoothScroll } from './lib/lenis';
import { 
  subscribeToPelanggaran, 
  subscribeToProposals, 
  subscribeToSantri,
  subscribeToDormitories,
  subscribeToClasses,
  SchoolClass,
  OFFICIAL_CLASSES,
  SantriRecord,
  Dormitory,
  DormitoryRoom,
  OFFICIAL_DORMITORIES,
  ALL_OFFICIAL_ROOMS,
  addPelanggaranRecord, 
  addProposalRecord,
  updateSantriRecord,
  deriveViolationsFromSantri,
  violationIdentity,
  getDeletedViolationIds,
  logoutUser
} from './lib/firestoreService';
import { GooeyToaster, gooeyToast } from 'goey-toast';
import 'goey-toast/styles.css';
import { 
  recordLoginSession, 
  recordLogoutSession, 
  recordSessionAction,
  getStoredSessionRecords 
} from './lib/sessionLogService';

export default function App() {
  // Activate Lenis Smooth Scroll
  useLenisSmoothScroll(true);

  // Persisted Auth User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ostifak_auth_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          if (parsed.role === 'mudir') {
            parsed.roleTitle = 'Mudir';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing auth user from localStorage:', e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ostifak_auth_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        return !!(parsed && typeof parsed === 'object' && parsed.name);
      }
    } catch {}
    return false;
  });

  // Navigation State with localStorage Persistence
  const [activeView, setActiveView] = useState<string>(() => {
    const VALID_VIEWS = ['dashboard', 'students', 'dormitory', 'classes', 'violations', 'programs', 'directives'];
    try {
      const savedView = localStorage.getItem('ostifak_active_view');
      if (savedView && VALID_VIEWS.includes(savedView)) return savedView;
    } catch (e) {
      console.error('Error reading ostifak_active_view:', e);
    }
    return 'dashboard';
  });

  const [selectedDivision, setSelectedDivision] = useState<DivisionId | null>(() => {
    const VALID_DIVISIONS = ['keamanan', 'ibadah', 'tahfizh', 'bahasa', 'kebersihan', 'kesehatan', 'bph', 'saran'];
    try {
      const savedDiv = localStorage.getItem('ostifak_selected_division');
      if (savedDiv && VALID_DIVISIONS.includes(savedDiv)) return savedDiv as DivisionId;
    } catch (e) {
      console.error('Error reading ostifak_selected_division:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (activeView) {
        localStorage.setItem('ostifak_active_view', activeView);
      }
    } catch (e) {
      console.error('Error writing activeView to localStorage:', e);
    }
  }, [activeView]);

  useEffect(() => {
    try {
      if (selectedDivision) {
        localStorage.setItem('ostifak_selected_division', selectedDivision);
      } else {
        localStorage.removeItem('ostifak_selected_division');
      }
    } catch (e) {
      console.error('Error writing selectedDivision to localStorage:', e);
    }
  }, [selectedDivision]);

  // Global Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // UI Panels Toggles
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // Modals
  const [isNewViolationModalOpen, setIsNewViolationModalOpen] = useState(false);
  const [isNewProgramModalOpen, setIsNewProgramModalOpen] = useState(false);

  // Live Collections Data
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [workPrograms, setWorkPrograms] = useState<WorkProgram[]>([]);
  const [students, setStudents] = useState<SantriRecord[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>(OFFICIAL_DORMITORIES);
  const [rooms, setRooms] = useState<DormitoryRoom[]>(ALL_OFFICIAL_ROOMS);
  const [classes, setClasses] = useState<SchoolClass[]>(OFFICIAL_CLASSES);

  // Subscribe to Live Collections
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubViolations = subscribeToPelanggaran((list) => {
      setViolations(list);
    });

    const unsubProposals = subscribeToProposals((list) => {
      setWorkPrograms(list);
    });

    const unsubSantri = subscribeToSantri((list) => {
      setStudents(list);
    });

    const unsubClasses = subscribeToClasses((classList) => {
      setClasses(classList);
    });

    const unsubDorms = subscribeToDormitories((dormList, roomList) => {
      setDormitories(dormList);
      setRooms(roomList);
    });

    return () => {
      unsubViolations();
      unsubProposals();
      unsubSantri();
      unsubDorms();
      unsubClasses();
    };
  }, [isLoggedIn]);

  // Unified violation recap: remote `pelanggaran` collection + local-first santri history.
  // Orphan rows (santri tidak terdaftar) disaring agar rekap selalu sinkron dengan database santri.
  const mergedViolations = React.useMemo(() => {
    const deletedIds = getDeletedViolationIds();
    const seen = new Set<string>();
    const registered = new Set(students.map((s) => s.studentName.trim().toLowerCase()));
    const out: ViolationRecord[] = [];
    const push = (v: ViolationRecord) => {
      if (deletedIds.has(v.id) || deletedIds.has(violationIdentity(v))) return;
      if (students.length > 0 && !registered.has(v.studentName.trim().toLowerCase())) return;
      const key = violationIdentity(v);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(v);
      }
    };
    [...violations, ...deriveViolationsFromSantri(students)].forEach(push);
    return out;
  }, [violations, students]);

  // Ensure active session exists in storage when user is logged in
  useEffect(() => {
    if (currentUser && isLoggedIn) {
      const records = getStoredSessionRecords();
      const activeId = localStorage.getItem('ostifak_active_session_id');
      const hasActive = records.some((r) => r.id === activeId && r.isActive);
      if (!hasActive) {
        recordLoginSession(currentUser);
      }
    }
  }, [currentUser, isLoggedIn]);

  // Log page navigation actions automatically
  useEffect(() => {
    if (isLoggedIn && activeView) {
      const viewNames: Record<string, string> = {
        dashboard: 'Dashboard Eksekutif',
        students: 'Direktori & Biodata Santri',
        dormitory: 'Daftar Asrama & Kebersihan',
        classes: 'Daftar Kelas & Akademik',
        violations: 'Kedisiplinan & Mahkamah',
        programs: 'Program Kerja & Proposal',
        directives: 'Instruksi Mudir',
      };
      const title = viewNames[activeView] || activeView;
      recordSessionAction(title, 'Navigasi Halaman', `Membuka halaman ${title}`);
    }
  }, [activeView, isLoggedIn]);

  // Log division switches automatically
  useEffect(() => {
    if (isLoggedIn && selectedDivision) {
      recordSessionAction('Detail Divisi', 'Buka Divisi', `Membuka modul operasional Divisi ${selectedDivision.toUpperCase()}`);
    }
  }, [selectedDivision, isLoggedIn]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    if (user.role === 'mudir') {
      user.roleTitle = 'Mudir';
    }
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('ostifak_auth_user', JSON.stringify(user));
    recordLoginSession(user);
    gooeyToast.success(`Selamat Datang, ${user.name}`, {
      description: `Masuk sebagai ${user.roleTitle}`,
    });
  };

  const handleLogout = async () => {
    recordLogoutSession();
    await logoutUser();
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('ostifak_auth_user');
    localStorage.removeItem('ostifak_active_view');
    localStorage.removeItem('ostifak_selected_division');
    setActiveView('dashboard');
    setSelectedDivision(null);
    gooeyToast.info('Sesi Diakhiri', {
      description: 'Anda telah keluar dari akun.',
    });
  };

  // Add violation handler (mirrors case into the santri record to keep points in sync)
  const handleAddViolation = async (record: Omit<ViolationRecord, 'id'>) => {
    await addPelanggaranRecord(record);
    recordSessionAction(
      'Kedisiplinan & Mahkamah',
      'Pencatatan Pelanggaran',
      `Mencatat pelanggaran santri ${record.studentName} (+${record.points} Pts): ${record.violation}`
    );
    const target = students.find(
      (s) => s.studentName.trim().toLowerCase() === record.studentName.trim().toLowerCase()
    );
    if (target) {
      const entry = {
        id: `vio-${Date.now()}`,
        title: record.violation,
        date: record.date,
        points: record.points,
        penalty: record.penaltyDescription,
      };
      await updateSantriRecord(target.id, {
        poinPelanggaran: (target.poinPelanggaran || 0) + record.points,
        violationsHistory: [entry, ...(target.violationsHistory || [])],
      });
    }
    gooeyToast.warning('Pelanggaran Berhasil Dicatat', {
      description: `${record.studentName} • ${record.violation} (+${record.points} Pts)`,
    });
  };

  // Add proposal handler
  const handleAddProgram = async (prog: Omit<WorkProgram, 'id'>) => {
    await addProposalRecord(prog);
    recordSessionAction(
      'Program Kerja & Proposal',
      'Pengajuan Proposal',
      `Mengajukan program kerja: ${prog.title} (Divisi: ${prog.divisionId})`
    );
    gooeyToast.success('Program Kerja Berhasil Diajukan', {
      description: `${prog.title} telah tersimpan.`,
    });
  };

  // Mobile touch gestures: swipe right -> open sidebar / close rightbar; swipe left -> open rightbar / close sidebar
  // Disabled when any modal, popup, or overlay is open
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const isAnyModalActive = (): boolean => {
      if (typeof document === 'undefined') return false;

      // 1. Direct state checks
      if (isNewViolationModalOpen || isNewProgramModalOpen) return true;

      // 2. Check for active dialog/modal DOM elements outside sidebar/rightpanel
      const modalElements = document.querySelectorAll<HTMLElement>(
        '[role="dialog"], [data-modal="true"], [data-lenis-prevent], [aria-modal="true"]'
      );
      for (let i = 0; i < modalElements.length; i++) {
        const el = modalElements[i];
        if (el.closest('[data-sidebar="true"]') || el.closest('[data-rightpanel="true"]')) {
          continue;
        }
        // If element is attached and visible
        if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) {
          return true;
        }
      }

      // 3. Check for fixed overlays with high z-index (modal backdrop)
      const fixedOverlays = document.querySelectorAll<HTMLElement>('.fixed.inset-0.z-50, .fixed.inset-0.z-\\[50\\]');
      for (let i = 0; i < fixedOverlays.length; i++) {
        const el = fixedOverlays[i];
        if (!el.closest('[data-sidebar="true"]') && !el.closest('[data-rightpanel="true"]')) {
          return true;
        }
      }

      return false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      // If any modal/popup is open, completely disable touch swipe gesture
      if (isAnyModalActive()) {
        touchStartTime = 0;
        return;
      }
      
      const target = e.target as HTMLElement | null;
      // Do not trigger swipe on form elements, buttons, or scrollable inputs/modal areas
      if (target && target.closest('input, textarea, select, button, [data-prevent-swipe="true"], [role="dialog"], [data-modal="true"], [data-lenis-prevent]')) {
        touchStartTime = 0;
        return;
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartTime || e.changedTouches.length !== 1) return;

      // If any modal/popup is active at touch end, cancel gesture
      if (isAnyModalActive()) {
        touchStartTime = 0;
        return;
      }

      // Only active on mobile / tablet viewport (< 1024px)
      if (window.innerWidth >= 1024) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      touchStartTime = 0;

      // Ensure clear horizontal swipe (distance > 45px, duration < 500ms, predominantly horizontal)
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && deltaTime < 500) {
        if (deltaX > 0) {
          // Swipe Right (geser layar ke kanan)
          if (isRightPanelOpen) {
            setIsRightPanelOpen(false);
          } else if (!isMobileSidebarOpen) {
            setIsMobileSidebarOpen(true);
          }
        } else {
          // Swipe Left (geser layar ke kiri)
          if (isMobileSidebarOpen) {
            setIsMobileSidebarOpen(false);
          } else if (!isRightPanelOpen) {
            setIsRightPanelOpen(true);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobileSidebarOpen, isRightPanelOpen, isNewViolationModalOpen, isNewProgramModalOpen]);

  // If not logged in, render LoginPage
  if (!isLoggedIn || !currentUser) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <GooeyToaster position="bottom-right" duration={3500} closeButton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:pl-[260px] relative font-body selection:bg-[#0F172A] selection:text-white">
      {/* Primary Sidebar (Fixed Left 260px) */}
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setSelectedDivision(null);
        }}
        selectedDivision={selectedDivision}
        onSelectDivision={(divId) => setSelectedDivision(divId)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header Topbar */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          activeView={activeView}
          selectedDivision={selectedDivision}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNewModal={() => setIsNewViolationModalOpen(true)}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          unreadCount={mockNotifications.length}
        />

        {/* Content Canvas */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {selectedDivision ? (
              <PageTransition key={`division-${selectedDivision}`}>
                <DivisionDetailView
                  divisionId={selectedDivision}
                  violations={mergedViolations}
                  workPrograms={workPrograms}
                  onOpenNewViolationModal={() => setIsNewViolationModalOpen(true)}
                  onOpenNewProgramModal={() => setIsNewProgramModalOpen(true)}
                />
              </PageTransition>
            ) : activeView === 'students' ? (
              <PageTransition key="students">
                <StudentsView
                  dormitories={dormitories}
                  rooms={rooms}
                  classes={classes}
                  students={students}
                />
              </PageTransition>
            ) : activeView === 'dormitory' ? (
              <PageTransition key="dormitory">
                <DormitoryView dormitories={dormitories} rooms={rooms} students={students} />
              </PageTransition>
            ) : activeView === 'classes' ? (
              <PageTransition key="classes">
                <ClassesView classes={classes} students={students} />
              </PageTransition>
            ) : activeView === 'violations' ? (
              <PageTransition key="violations">
                <ViolationsView
                  violations={mergedViolations}
                  students={students}
                  onOpenNewViolationModal={() => setIsNewViolationModalOpen(true)}
                />
              </PageTransition>
            ) : activeView === 'programs' ? (
              <PageTransition key="programs">
                <WorkProgramsView
                  workPrograms={workPrograms}
                  onOpenNewProgramModal={() => setIsNewProgramModalOpen(true)}
                />
              </PageTransition>
            ) : activeView === 'directives' ? (
              <PageTransition key="directives">
                <DirectivesView />
              </PageTransition>
            ) : (
              <PageTransition key="dashboard">
                <DashboardView
                  currentUser={currentUser}
                  kpiMetrics={[]}
                  violations={mergedViolations}
                  workPrograms={workPrograms}
                  students={students}
                  dormitoriesCount={dormitories.length}
                  roomsCount={rooms.length}
                  onOpenNewViolationModal={() => setIsNewViolationModalOpen(true)}
                  onOpenNewProgramModal={() => setIsNewProgramModalOpen(true)}
                  onSelectView={(view) => setActiveView(view)}
                />
              </PageTransition>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Slide-over Overlay Info Panel with Framer Motion */}
      <RightPanel
        isOpen={isRightPanelOpen}
        onClose={() => setIsRightPanelOpen(false)}
        onOpenDirectivesView={() => {
          setActiveView('directives');
          setSelectedDivision(null);
        }}
        rooms={rooms}
      />

      {/* Interactive Form Modals */}
      <NewViolationModal
        isOpen={isNewViolationModalOpen}
        onClose={() => setIsNewViolationModalOpen(false)}
        onAddViolation={handleAddViolation}
        rooms={rooms}
        students={students}
      />

      <NewProgramModal
        isOpen={isNewProgramModalOpen}
        onClose={() => setIsNewProgramModalOpen(false)}
        onAddProgram={handleAddProgram}
      />

      {/* Global Gooey Toast Notifications */}
      <GooeyToaster position="bottom-right" duration={3500} closeButton />
    </div>
  );
}
