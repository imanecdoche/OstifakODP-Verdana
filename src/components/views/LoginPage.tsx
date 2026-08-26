import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Check
} from 'lucide-react';
import { OFFICIAL_ACCOUNTS, OfficialAccountConfig } from '../../data/mockData';
import { loginWithEmailAndPassword } from '../../lib/firestoreService';
import { UserProfile } from '../../types';
import { GradientWaves } from '../ui/GradientWaves';
import { APP_VERSION_INFO } from '../../config/version';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('mulhatalinuh');
  const [password, setPassword] = useState('ostifak1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mode Fullscreen Pilih Akun (Modal-less & Clean Flat)
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);

  // Normalizer: Jika username diisi nama akun saja ("keamanan"), auto-append "@ostifak.edu"
  const getFullEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    return trimmed.includes('@') ? trimmed : `${trimmed}@ostifak.edu`;
  };

  const performLogin = async (usr: string, pwd: string) => {
    const fullEmail = getFullEmail(usr);
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

  return (
    <div className="fixed inset-0 w-full h-full min-h-[100dvh] bg-[#050D07] flex flex-col justify-center overflow-y-auto overscroll-contain font-body text-white">
      
      {/* Top-Right App Metadata & Developer Info (Clean & Breathable) */}
      <div className="absolute top-6 right-6 z-20 text-right pointer-events-none select-none">
        <p className="text-xs font-mono font-medium text-white/40 tracking-wider">
          {APP_VERSION_INFO.version}
        </p>
        <p className="text-xs text-white/40 tracking-wider mt-0.5">
          {APP_VERSION_INFO.author.name}
        </p>
      </div>

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

      {/* 2. Kondisional: Tampilan Utama Login ATAU Fullscreen Pilih Akun */}
      {!isAccountPickerOpen ? (
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
            
            {/* Input Email dengan Suffix Permanen @ostifak.edu */}
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

            {/* Input Password (Underline, with Toggle Eye Icon on Right) */}
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

            {/* Action Buttons: Solid White Box with Black Text */}
            <div className="flex flex-row items-center gap-3 pt-4">
              {/* Tombol MASUK */}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-white hover:bg-white/90 active:bg-white/80 text-black font-medium rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  'MASUK'
                )}
              </button>

              {/* Tombol PILIH AKUN */}
              <button
                type="button"
                onClick={() => setIsAccountPickerOpen(true)}
                className="flex-1 h-11 bg-white hover:bg-white/90 active:bg-white/80 text-black font-medium rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.98]"
              >
                PILIH AKUN
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Interaksi Fullscreen "Pilih Akun" (Langsung di atas Waves Canvas) */
        <div className="relative z-10 w-full h-full min-h-screen flex flex-col p-4 sm:p-8 animate-in fade-in duration-300">
          
          {/* Top Bar: Tombol Tutup (X) di kiri, Judul di tengah, Tombol MASUK di kanan */}
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 mb-4 sm:mb-6">
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
            <div className="w-full max-w-5xl mx-auto mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="w-full max-w-5xl mx-auto mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Fullscreen Grid List Akun (Clean, Tanpa Card/Modal Pembungkus) */}
          <div className="w-full max-w-5xl mx-auto flex-1 overflow-y-auto pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {OFFICIAL_ACCOUNTS.map((acc) => {
                const currentFull = getFullEmail(username).toLowerCase();
                const isSelected = currentFull === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-4 text-left rounded-xl border transition-all cursor-pointer block active:scale-[0.98] ${
                      isSelected
                        ? 'bg-white/20 border-white text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-white/90 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold truncate font-headline">{acc.name}</p>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-white/60 truncate mb-3">{acc.email}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-[11px] text-emerald-300 font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        {acc.roleTitle}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                        {acc.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
