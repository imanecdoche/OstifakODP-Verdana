import { useLenisModalLock } from '../../lib/lenis';
import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Sparkles,
  Loader2
} from 'lucide-react';
import { OFFICIAL_ACCOUNTS, OfficialAccountConfig } from '../../data/mockData';
import { loginWithEmailAndPassword, initializeOfficialAccountsInFirebase } from '../../lib/firestoreService';
import { UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('mulhatalinuh@ostifak.edu');
  const [password, setPassword] = useState('ostifak1234');
  const [loading, setLoading] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useLenisModalLock(isOpen);

  if (!isOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const user = await loginWithEmailAndPassword(email, password);
      if (user) {
        setSuccessMessage(`Berhasil masuk sebagai ${user.name}`);
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 500);
      } else {
        setErrorMessage('Gagal masuk. Periksa email dan password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const officialMatch = OFFICIAL_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (officialMatch && password === 'ostifak1234') {
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
          onClose();
        }, 500);
      } else {
        setErrorMessage(err.message || 'Gagal autentikasi. Silakan periksa kembali email & password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (acc: OfficialAccountConfig) => {
    setEmail(acc.email);
    setPassword('ostifak1234');
  };

  const handleSeedAccounts = async () => {
    setSeedingLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await initializeOfficialAccountsInFirebase();
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
    setSeedingLoading(false);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-lg shadow-[0_8px_32px_rgba(15,23,42,0.15)] border border-[#E2E8F0] overflow-hidden my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col font-body">
        
        {/* Header Modal (Clean Flat Header, Zero Icon Policy) */}
        <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
          <h3 className="text-base sm:text-lg font-bold font-headline tracking-tight text-[#0F172A]">Autentikasi Akun Resmi</h3>
          <p className="text-xs text-[#64748B] mt-0.5 font-body">
            Masuk dengan email & password resmi pengurus divisi
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 pb-12 sm:pb-6">

          {/* Messages Alert */}
          {errorMessage && (
            <div className="p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#DC2626] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Login Direct */}
          <form onSubmit={handleManualLogin} className="space-y-4 bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                <Key className="w-3.5 h-3.5 text-[#059669]" /> Login Email & Password
              </span>
              <span className="text-[11px] text-[#64748B] font-medium bg-white px-2 py-0.5 rounded-[4px] border border-[#E2E8F0]">
                Default: <code className="text-[#059669] font-bold">ostifak1234</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Email Akun Resmi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@ostifak.edu"
                    className="w-full h-10 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1 font-headline">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ostifak1234"
                    className="w-full h-10 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading}
                icon={loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <UserCheck className="w-4 h-4 text-white" />}
              >
                Masuk Sekarang
              </Button>
            </div>
          </form>

          {/* Quick Account Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.5px] flex items-center gap-1.5 font-headline">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" /> Pilih Akun Pesantren / Divisi
              </label>
              <span className="text-[10px] text-[#64748B]">
                Klik untuk mengisi otomatis
              </span>
            </div>

            <ScrollArea
              className="max-h-56"
              viewportClassName="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1"
              topOffset="top-1"
              bottomOffset="bottom-1"
            >
              {OFFICIAL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className={`p-2.5 text-left rounded-md border transition-all cursor-pointer flex items-center gap-2.5 active:scale-[0.97] ${
                    email === acc.email
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A]'
                  }`}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate font-headline">{acc.name}</p>
                    <p className={`text-[11px] truncate ${email === acc.email ? 'text-white/80' : 'text-[#64748B]'}`}>{acc.email}</p>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Database Setup & Close Button */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Tutup
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSeedAccounts}
              disabled={seedingLoading}
            >
              {seedingLoading ? 'Menginisialisasi...' : 'Inisialisasi Data Akun'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
