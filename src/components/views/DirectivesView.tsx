import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Plus, Send, X } from 'lucide-react';
import { MudirDirective } from '../../types';
import { Button } from '../ui/Button';
import { subscribeToDirectives, addDirectiveRecord } from '../../lib/firestoreService';
import { useLenisModalLock } from '../../lib/lenis';
import { gooeyToast } from '../../lib/toast';
import { RunningText } from '../ui/RunningText';


export const DirectivesView: React.FC = () => {
  const [directives, setDirectives] = useState<MudirDirective[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useLenisModalLock(isModalOpen);
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
      {/* Header (Unboxed, Zero Icon Policy) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-headline tracking-tight">
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
          className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
        >
          + Terbitkan Arahan Mudir
        </Button>
      </div>

      {/* 3 Summary Metrics (Unboxed 1-Row with Dividers) */}
      <div className="grid grid-cols-3 divide-x divide-[#E2E8F0] border-y border-[#E2E8F0] overflow-hidden">
        <div className="p-3 sm:px-5 sm:py-4 first:pl-2 sm:first:pl-4">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Total Instruksi
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline whitespace-nowrap">
              {directives.length}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] font-medium font-body hidden xs:inline">Arahan</span>
          </div>
        </div>

        <div className="p-3 sm:px-5 sm:py-4">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Prioritas Tinggi
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-[#EF4444] tracking-tight font-headline whitespace-nowrap">
              {directives.filter(d => d.priority === 'tinggi').length}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] font-medium font-body hidden xs:inline">Arahan</span>
          </div>
        </div>

        <div className="p-3 sm:px-5 sm:py-4 last:pr-2 sm:last:pr-4">
          <p className="text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px] truncate">
            Instruksi Aktif
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-[#059669] tracking-tight font-headline whitespace-nowrap">
              {directives.filter(d => d.status === 'aktif').length}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] font-medium font-body hidden xs:inline">Aktif</span>
          </div>
        </div>
      </div>

      {/* Popup Modal (Jendela Mengapung / Dialog Overlay) */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            data-modal="true"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden pointer-events-auto font-body"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 cursor-default"
            />

            {/* Sheet Panel (Spring Animation) */}
            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 320,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
              data-bottom-sheet
              className="relative w-full max-w-xl bg-white rounded-t-2xl sm:rounded-xl shadow-[0_-10px_40px_rgba(15,23,42,0.18)] sm:shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] z-10"
            >
              {/* Mobile Top Drag Handle */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#F8FAFC]">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Modal Header (Clean Flat Header, Zero Icon Policy) */}
              <div className="px-6 py-3.5 sm:py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-headline tracking-tight">
                  Penerbitan Instruksi Resmi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5 font-body">
                  Arahan Mudir: K.H. Mulhat Ali Nuh, Lc., M.A.
                </p>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleCreateDirective} className="flex flex-col flex-1 min-h-0">
                <div className="p-6 sm:p-7 space-y-5 overflow-y-auto text-xs flex-1 min-h-0">
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
                      placeholder="Contoh: Keamanan, Pengasuhan..."
                      className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1.5 text-[#0F172A] font-headline">
                      Tingkat Prioritas
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="sedang">Sedang</option>
                      <option value="tinggi">Tinggi (Mendesak)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-[#0F172A] font-headline">
                    Rincian Instruksi / Petunjuk Pelaksanaan *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan butir-butir instruksi, batas waktu, dan teknis implementasi..."
                    className="w-full p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:border-slate-900 focus:outline-none font-body shadow-2xs resize-none"
                  />
                </div>

                </div>
                {/* Modal Actions Footer with Safe Bottom Padding */}
                <div data-sheet-actions className="bg-[#F8FAFC] px-6 pt-4 pb-8 sm:pb-4 border-t border-[#E2E8F0] shrink-0 space-y-1.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                  >
                    {loading ? 'MENYIMPAN...' : 'TERBITKAN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-10 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                  >
                    BATAL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Directives Grid List (2 Cards Per Row) */}
      {directives.length === 0 ? (
        <div className="py-14 text-center space-y-2">
          <ScrollText className="w-10 h-10 text-[#CBD5E1] mx-auto" />
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
