import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Check,
  WifiOff,
  HardDrive,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { OFFICIAL_ACCOUNTS, OfficialAccountConfig } from '../../data/mockData';
import { loginWithEmailAndPassword } from '../../lib/firestoreService';
import { UserProfile } from '../../types';
import { GradientWaves } from '../ui/GradientWaves';
import { enableOfflineMode, OFFLINE_STORAGE_QUOTA_LABEL } from '../../lib/offlineManager';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // 1. Form Input Kosong Secara Default Saat Dimuat
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mode Fullscreen Pilih Akun (Modal-less & Clean Flat)
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);

  // Dialog Konfirmasi Mode Offline (Center Fullscreen, Unboxed, Anti-Gravity UI)
  const [isOfflineDialogOpen, setIsOfflineDialogOpen] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);

  // Normalizer: Jika username diisi nama akun saja ("keamanan"), auto-append "@ostifak.edu"
  const getFullEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    return trimmed.includes('@') ? trimmed : `${trimmed}@ostifak.edu`;
  };

  const performLogin = async (usr: string, pwd: string) => {
    const fullEmail = getFullEmail(usr);
    if (!fullEmail) {
      setErrorMessage('Silakan masukkan email atau pilih akun.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const user = await loginWithEmailAndPassword(fullEmail, pwd);
      setSuccessMessage(`Selamat datang, ${user.name}`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Username/Email atau kata sandi tidak sesuai.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak percobaan masuk gagal. Coba lagi beberapa saat.');
      } else {
        setErrorMessage(err.message || 'Gagal masuk ke sistem.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(username, password);
  };

  const handleSelectAccount = (acc: OfficialAccountConfig) => {
    setUsername(acc.email.split('@')[0]);
    setPassword('ostifak1234');
  };

  const handleFullscreenLogin = async () => {
    await performLogin(username, password);
  };

  const handleConfirmOfflineMode = () => {
    setOfflineLoading(true);
    setTimeout(() => {
      // Find selected account profile if any, or default offline operator
      const currentFull = getFullEmail(username).toLowerCase();
      const matchedAccount = OFFICIAL_ACCOUNTS.find(a => a.email.toLowerCase() === currentFull);
      
      const offlineProfile: UserProfile = matchedAccount ? {
        id: `off_${matchedAccount.email.split('@')[0]}`,
        name: `${matchedAccount.name} (Offline)`,
        email: matchedAccount.email,
        role: matchedAccount.role,
        roleLevel: matchedAccount.roleLevel,
        roleTitle: `${matchedAccount.roleTitle} (Mode Offline)`,
        division: matchedAccount.divisionId,
        avatar: matchedAccount.avatar,
      } : {
        id: 'offline_operator',
        name: 'Petugas Lapangan',
        email: 'offline@ostifak.edu',
        role: 'admin',
        roleLevel: 2,
        roleTitle: 'Administrator Mode Offline',
        division: 'keamanan',
        assignedDivision: 'keamanan',
      };

      const user = enableOfflineMode(offlineProfile);
      setOfflineLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div className="fixed inset-0 w-full h-full min-h-[100dvh] bg-[#050D07] flex flex-col justify-center overflow-y-auto overscroll-contain font-body text-white">
      
      {/* 1. Full Viewport Interactive Animated Gradient Waves Backdrop */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 bg-[#050D07]">
        <GradientWaves
          horizonColor="#071A0E"
          waveColor="#143D20"
          crestColor="#34D399"
          speed={0.35}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={30}
          turbulence={20}
          tilt={1.1}
          zoom={1.0}
          height={5.5}
          fogDepth={18}
          detail="medium"
          brightness={1.1}
          opacity={1.0}
          grain={true}
          grainIntensity={0.03}
          mouseInteraction={true}
          parallaxStrength={0.5}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* 2. Kondisional: Dialog Konfirmasi Mode Offline ATAU Form Login ATAU Fullscreen Pilih Akun */}
      {isOfflineDialogOpen ? (
        /* Dialog Konfirmasi Mode Offline Unboxed (Menyembunyikan Form Login & Logo) */
        <div className="relative z-20 w-full max-w-lg mx-auto my-auto p-6 sm:p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-250 font-body">
          
          {/* Ikon Wi-Fi Disilang Merah Terisolasi */}
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400">
            <WifiOff className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-headline tracking-tight">
            Konfirmasi Masuk Mode Offline
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-md font-body leading-relaxed">
            Aplikasi akan berjalan dalam isolasi penuh dari jaringan internet. Semua data dialihkan ke penyimpanan lokal peramban perangkat.
          </p>

          {/* Rincian Izin & Alokasi Penyimpanan 100 MB (Unboxed dengan Garis Pemisah Tipis) */}
          <div className="w-full my-6 divide-y divide-white/10 border-y border-white/10 text-left text-xs font-body">
            <div className="py-3 flex items-start gap-3">
              <HardDrive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Alokasi Penyimpanan Lokal: {OFFLINE_STORAGE_QUOTA_LABEL}</p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Kapasitas dialokasikan penuh di localStorage untuk database santri, catatan pelanggaran, prestasi, asrama, & kelas.
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Isolasi Total Jaringan (100% Offline)</p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Nol data dikirim atau diambil dari server database cloud selama mode offline aktif.
                </p>
              </div>
            </div>

            <div className="py-3 flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Akses & Manajemen Berkas Penuh</p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Semua fungsi pencatatan setoran hafalan, mutabaah, mahkamah, dan prestasi beroperasi normal secara instan.
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Dialog Konfirmasi Mode Offline */}
          <div className="w-full space-y-3 pt-1">
            <button
              type="button"
              onClick={handleConfirmOfflineMode}
              disabled={offlineLoading}
              className="w-full h-11 bg-white hover:bg-white/90 active:bg-white/80 text-black font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {offlineLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-rose-600" />
                  <span>SETUJUI & MASUK MODE OFFLINE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsOfflineDialogOpen(false)}
              disabled={offlineLoading}
              className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer tracking-wider uppercase font-medium active:scale-95 py-2 px-4 hover:underline"
            >
              Batal / Kembali ke Login
            </button>
          </div>

        </div>
      ) : !isAccountPickerOpen ? (
        /* Tampilan Utama Login (Floating Centered) */
        <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto my-auto p-4 flex flex-col items-center animate-in fade-in duration-300">
          
          {/* Header Aplikasi (Logo SVG Putih Bersih 2x, Tanpa Teks OSDIGI, Tanpa Glow, Tanpa Kontainer) */}
          <div className="text-center mb-8 flex flex-col items-center">
            <img
              src="/logo.svg"
              alt="Logo OSTIFAK"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain brightness-0 invert opacity-90 select-none mb-3 transition-transform duration-500 hover:scale-105"
            />
            <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wide">
              Portal Manajemen Santri & Divisi OSTIFAK
            </p>
          </div>

          {/* Status Alerts */}
          {errorMessage && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="w-full mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Clean Minimalist Form */}
          <form onSubmit={handleLogin} className="w-full space-y-6">
            
            {/* Input Email dengan Suffix Permanen @ostifak.edu (Kosong Secara Default) */}
            <div className="relative flex items-center border-b border-white/30 focus-within:border-white transition-colors">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/@ostifak\.edu$/i, '');
                  setUsername(val);
                }}
                placeholder="nama.divisi"
                className="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 rounded-none px-0 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none"
              />
              <span className="text-white/50 text-sm select-none shrink-0 font-medium pl-1.5 pr-0 py-3.5">
                @ostifak.edu
              </span>
            </div>

            {/* Input Password (Underline, with Toggle Eye Icon on Right, Kosong Secara Default) */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                className="w-full bg-transparent border-0 border-b border-white/30 focus:border-white focus:ring-0 rounded-none pl-0 pr-10 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer p-1.5 active:scale-95"
                title={showPassword ? 'Sembunyikan Sandi' : 'Lihat Sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Tombol Utama: Solid White Box MASUK */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white hover:bg-white/90 active:bg-white/80 text-black font-medium rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  'MASUK'
                )}
              </button>
            </div>
          </form>

          {/* Tombol Pilih Akun: Secondary Button Berupa Teks Bersih Tanpa Box di Bagian Bawah */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsAccountPickerOpen(true)}
              className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer tracking-wider uppercase font-medium active:scale-95 py-2 px-4 hover:underline"
            >
              Pilih Akun
            </button>
          </div>

        </div>
      ) : (
        /* Interaksi Fullscreen "Pilih Akun" (Tanpa Kontainer Box & Menggunakan Pemisah Divider Tipis) */
        <div className="relative z-10 w-full h-full min-h-screen flex flex-col p-4 sm:p-8 animate-in fade-in duration-300">
          
          {/* Top Bar: Tombol Tutup (X) di kiri, Judul di tengah, Tombol MASUK di kanan */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 mb-4 sm:mb-6 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setIsAccountPickerOpen(false)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
              title="Kembali ke Form Login"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h2 className="text-base sm:text-xl font-bold text-white font-headline tracking-tight">
                Pilih Akun Resmi
              </h2>
              <p className="text-[11px] sm:text-xs text-white/60">
                Pilih akun divisi yang ingin digunakan
              </p>
            </div>

            <button
              type="button"
              onClick={handleFullscreenLogin}
              disabled={loading}
              className="h-10 px-5 bg-white hover:bg-white/90 active:bg-white/80 text-black font-medium rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                'MASUK'
              )}
            </button>
          </div>

          {/* Alerts in Fullscreen Mode */}
          {errorMessage && (
            <div className="w-full max-w-4xl mx-auto mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="w-full max-w-4xl mx-auto mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Fullscreen List Akun Bersih Tanpa Box Container (Hanya Nama Akun, Email, Checkmark, & Divider Tipis) */}
          <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto pb-12">
            <div className="divide-y divide-white/10 border-y border-white/10">
              {OFFICIAL_ACCOUNTS.map((acc) => {
                const currentFull = getFullEmail(username).toLowerCase();
                const isSelected = currentFull === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full py-4 px-3 sm:px-4 text-left transition-colors cursor-pointer flex items-center justify-between gap-4 hover:bg-white/[0.04] active:bg-white/[0.08] ${
                      isSelected ? 'bg-white/[0.07]' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white font-headline truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-white/50 font-body truncate mt-0.5">
                        {acc.email}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. Icon Button Pojok Kanan Bawah: Wi-Fi Disilang / Mode Offline */}
      {!isOfflineDialogOpen && (
        <button
          type="button"
          onClick={() => setIsOfflineDialogOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/70 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
          title="Masuk Mode Offline (Isolasi Lokal 100 MB)"
          aria-label="Mode Offline"
        >
          <WifiOff className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
        </button>
      )}

    </div>
  );
};
