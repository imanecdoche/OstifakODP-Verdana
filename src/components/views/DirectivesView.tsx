import React, { useState, useEffect } from 'react';
import { ScrollText, ShieldCheck, Clock, CheckCircle, Plus, Send } from 'lucide-react';
import { MudirDirective } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { subscribeToDirectives, addDirectiveRecord } from '../../lib/firestoreService';
import { gooeyToast } from 'goey-toast';

export const DirectivesView: React.FC = () => {
  const [directives, setDirectives] = useState<MudirDirective[]>([]);
  const [isCreating, setIsCreating] = useState(false);
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
      setIsCreating(false);
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
    <div className="space-y-6">
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
          onClick={() => setIsCreating(!isCreating)}
          icon={<Plus className="w-4 h-4 text-white" />}
        >
          {isCreating ? 'Tutup Form' : 'Terbitkan Arahan Mudir'}
        </Button>
      </div>

      {/* Form */}
      {isCreating && (
        <Card variant="default" className="p-6 border border-[#0F172A] bg-white">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2 font-headline">
            <Send className="w-4 h-4 text-[#0F172A]" /> Form Penerbitan Instruksi Resmi
          </h3>
          <form onSubmit={handleCreateDirective} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-[#0F172A] font-headline">Judul / Perihal Instruksi *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengetatan Disiplin Shalat Shubuh & Halaqah"
                className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-[#0F172A] font-headline">Target Divisi</label>
                <input
                  type="text"
                  value={targetDivision}
                  onChange={(e) => setTargetDivision(e.target.value)}
                  placeholder="Contoh: Divisi Keamanan & Ibadah"
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#0F172A] font-headline">Prioritas Arahan</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
                >
                  <option value="tinggi">Tinggi (Mendesak)</option>
                  <option value="sedang">Sedang</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#0F172A] font-headline">Uraian Petunjuk Teknis *</label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan petunjuk teknis dan batas waktu pelaksanaan instruksi..."
                className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Kirim Instruksi'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Directives List */}
      {directives.length === 0 ? (
        <Card variant="default" className="p-8 text-center bg-white border border-[#E2E8F0] space-y-2">
          <ScrollText className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-bold text-[#0F172A] font-headline">Belum Ada Instruksi Mudir</h3>
          <p className="text-xs text-[#64748B] font-body">
            Klik tombol "Terbitkan Arahan Mudir" di atas untuk menambahkan instruksi pertama.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {directives.map((dir) => (
            <Card key={dir.id} variant="default" className="p-6 space-y-4 border-l-4 border-l-[#0F172A]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={dir.priority === 'tinggi' ? 'danger' : 'warning'}>
                    PRIORITAS {dir.priority}
                  </Badge>
                  <span className="text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] px-2.5 py-0.5 rounded-[4px] border border-[#E2E8F0]">
                    Target: {dir.targetDivision}
                  </span>
                </div>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {dir.issuedDate}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0F172A] font-headline">{dir.title}</h2>
                <p className="text-xs text-[#0F172A] leading-relaxed mt-2 bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0] font-body">
                  "{dir.content}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                <span className="text-[#64748B] flex items-center gap-1 font-body">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" /> Penerbit: <strong>K.H. Mulhat Ali Nuh, Lc., M.A. (Mudir)</strong>
                </span>
                <Badge variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                  Aktif
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
