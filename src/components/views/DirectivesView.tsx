import React, { useState, useEffect, useRef } from 'react';
import { ScrollText, Plus, Send, X } from 'lucide-react';
import { MudirDirective } from '../../types';
import { Button } from '../ui/Button';
import { subscribeToDirectives, addDirectiveRecord } from '../../lib/firestoreService';
import { gooeyToast } from 'goey-toast';

const RunningText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        if (contentWidth > containerWidth + 2) {
          setIsOverflowing(true);
          setOverflowDistance(contentWidth - containerWidth + 16);
        } else {
          setIsOverflowing(false);
          setOverflowDistance(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const duration = Math.max(4, Math.min(12, overflowDistance / 15));

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap min-w-0 flex-1 ${className}`}
      title={text}
    >
      <span
        ref={contentRef}
        style={
          isOverflowing
            ? ({
                '--scroll-offset': `-${overflowDistance}px`,
                animation: `running-ticker ${duration}s ease-in-out infinite alternate`,
              } as React.CSSProperties)
            : undefined
        }
        className={`inline-block whitespace-nowrap ${isOverflowing ? 'will-change-transform' : ''}`}
      >
        {text}
      </span>
    </div>
  );
};

export const DirectivesView: React.FC = () => {
  const [directives, setDirectives] = useState<MudirDirective[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDivision, setTargetDivision] = useState('Semua Divisi');
  const [priority, setPriority] = useState<'tinggi' | 'sedang' | 'normal'>('tinggi');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToDirectives((data) => {
      setDirectives(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsModalOpen(false);
      }
    };
    const handleCustomEscape = () => {
      setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ostifak-escape-pressed', handleCustomEscape);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ostifak-escape-pressed', handleCustomEscape);
    };
  }, [isModalOpen]);

  const handleCreateDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      await addDirectiveRecord({
        title,
        targetDivision,
        issuedDate: 'Hari ini, ' + new Date().toLocaleDateString('id-ID'),
        priority,
        status: 'aktif',
        content,
      });
      setTitle('');
      setContent('');
      setIsModalOpen(false);
      gooeyToast.info('Instruksi Mudir Diterbitkan', {
        description: `${title} (Target: ${targetDivision})`,
      });
    } catch (err) {
      console.error('Gagal menyimpan instruksi:', err);
      gooeyToast.error('Gagal Menyimpan Instruksi', {
        description: 'Terjadi kendala saat menerbitkan instruksi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header (Unboxed) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 font-headline tracking-tight text-[#0F172A]">
            <ScrollText className="w-7 h-7 text-[#0F172A]" />
            Instruksi Top-Down & Arahan Mudir
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl font-body">
            Kanal resmi K.H. Mulhat Ali Nuh, Lc., M.A. kepada seluruh jajaran Pengurus OSTIFAK dan Pembina.
          </p>
        </div>

        <Button
          variant="sage"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-white" />}
        >
          Terbitkan Arahan Mudir
        </Button>
      </div>

      {/* Popup Modal (Jendela Mengapung / Dialog Overlay) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 font-body"
        >
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A] font-headline tracking-tight">
                    Penerbitan Instruksi Resmi
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Arahan Mudir: K.H. Mulhat Ali Nuh, Lc., M.A.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCreateDirective} className="p-6 sm:p-7 space-y-5 overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold mb-1.5 text-[#0F172A] font-headline">
                  Judul / Perihal Instruksi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pengetatan Disiplin Shalat Shubuh & Halaqah"
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1.5 text-[#0F172A] font-headline">
                    Target Divisi
                  </label>
                  <input
                    type="text"
                    value={targetDivision}
                    onChange={(e) => setTargetDivision(e.target.value)}
                    placeholder="Contoh: Divisi Keamanan & Ibadah"
                    className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[#0F172A] font-headline">
                    Prioritas Arahan
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs cursor-pointer font-medium"
                  >
                    <option value="tinggi">Tinggi (Mendesak)</option>
                    <option value="sedang">Sedang</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-[#0F172A] font-headline">
                  Uraian Petunjuk Teknis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan petunjuk teknis dan batas waktu pelaksanaan instruksi..."
                  className="w-full p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {loading ? 'Menyimpan...' : 'Terbitkan Instruksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directives Grid List (2 Cards Per Row) */}
      {directives.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-[#E2E8F0] space-y-2">
          <ScrollText className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-bold text-[#0F172A] font-headline">Belum Ada Instruksi Mudir</h3>
          <p className="text-xs text-[#64748B] font-body">
            Klik tombol "Terbitkan Arahan Mudir" di atas untuk menambahkan instruksi pertama.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {directives.map((dir) => {
            const priorityLabel =
              dir.priority === 'tinggi'
                ? 'Prioritas Tinggi'
                : dir.priority === 'sedang'
                ? 'Prioritas Sedang'
                : 'Prioritas Normal';

            const statusLabel =
              dir.status === 'aktif'
                ? 'Aktif'
                : dir.status === 'selesai'
                ? 'Selesai'
                : 'Arsip';

            return (
              <div
                key={dir.id}
                className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* 1. Baris Judul & Tanggal (Atas) */}
                <div className="flex items-baseline justify-between gap-4">
                  <RunningText
                    text={dir.title}
                    className="text-base font-bold text-[#0F172A] font-headline tracking-tight"
                  />
                  <span className="text-xs text-[#64748B] shrink-0 font-medium font-body">
                    {dir.issuedDate}
                  </span>
                </div>

                {/* 2. Deskripsi Instruksi */}
                <p className="text-xs text-[#334155] leading-relaxed font-body">
                  {dir.content}
                </p>

                {/* Bottom Metadata */}
                <div className="pt-3 border-t border-[#F1F5F9] space-y-2 text-xs">
                  {/* 3. Prioritas & Divisi (Baris Bawah 1) */}
                  <div className="flex items-center gap-2 text-xs font-body">
                    <span className="font-bold text-[#0F172A]">
                      {priorityLabel}
                    </span>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="text-[#475569] font-medium">
                      {dir.targetDivision}
                    </span>
                  </div>

                  {/* 4. Penerbit & Status (Baris Bawah 2) */}
                  <div className="flex items-center justify-between text-xs font-body">
                    <span className="text-[#64748B]">
                      K.H. Mulhat Ali Nuh, Lc., M.A. (Mudir)
                    </span>
                    <span className="text-[#059669] font-semibold">
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
