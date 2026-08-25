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
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);

  const getFullEmail = (userVal: string) => {
    const clean = userVal.trim();
    if (!clean) return '';
    return clean.includes('@') ? clean : `${clean}@ostifak.edu`;
  };

  const performLogin = async (targetEmail: string, targetPass: string) => {
    const cleanEmail = getFullEmail(targetEmail);
    if (!cleanEmail || !targetPass) return;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const user = await loginWithEmailAndPassword(cleanEmail, targetPass);
      if (user) {
        setSuccessMessage(`Berhasil masuk sebagai ${user.name}`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 400);
      } else {
        setErrorMessage('Gagal masuk. Periksa kembali email dan password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const officialMatch = OFFICIAL_ACCOUNTS.find(a => a.email.toLowerCase() === cleanEmail.toLowerCase());
      if (officialMatch && targetPass === 'ostifak1234') {
        const fallbackUser: UserProfile = {
          id: officialMatch.email.replace(/[^a-zA-Z0-9]/g, '_'),
          name: officialMatch.name,
          role: officialMatch.role,
          roleLevel: officialMatch.roleLevel,
          roleTitle: officialMatch.roleTitle,
          division: officialMatch.divisionId || undefined,
          avatar: officialMatch.avatar,
        };
        setSuccessMessage(`Berhasil masuk sebagai ${fallbackUser.name}`);
        setTimeout(() => {
          onLoginSuccess(fallbackUser);
        }, 400);
      } else {
        setErrorMessage(err.message || 'Gagal autentikasi. Silakan periksa kembali email & password.');
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
          
          {/* Header Aplikasi (Logo, Nama & Tagline) */}
          <div className="text-center mb-8 flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Logo OSTIFAK"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] select-none"
            />
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-headline leading-tight drop-shadow-md select-none">
              OSDIGI
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wide mt-2">
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

          {/* Footer Info / Default Password Helper */}
          <p className="mt-8 text-center text-xs text-white/40 font-medium">
            Password Default Semua Akun: <span className="text-emerald-400 font-semibold">ostifak1234</span>
          </p>
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
