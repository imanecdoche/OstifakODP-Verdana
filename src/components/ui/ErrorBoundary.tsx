import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // @ts-ignore
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ostifak_active_view');
      localStorage.removeItem('ostifak_selected_division');
    } catch {}
    window.location.reload();
  };

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#050D07] text-white flex flex-col items-center justify-center p-6 text-center font-body">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2 font-headline">
            Terjadi Kesalahan pada Aplikasi
          </h1>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            {/* @ts-ignore */}
            {this.state.error?.message || 'Sistem mendeteksi kendala saat memuat komponen antarmuka.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#142A18] hover:bg-[#2E5B37] text-white rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-500/30 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Bersihkan Cache & Reset
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
