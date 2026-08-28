import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WorkProgram, DivisionId } from '../../types';
import { createLocalId } from '../../lib/firestoreService';
import { mockDivisions } from '../../data/mockData';

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProgram: (program: WorkProgram) => void;
}

export const NewProgramModal: React.FC<NewProgramModalProps> = ({
  isOpen,
  onClose,
  onAddProgram,
}) => {
  const [title, setTitle] = useState('');
  const [divisionId, setDivisionId] = useState<DivisionId>('keamanan');
  const [targetDate, setTargetDate] = useState('20 Agu 2026');
  const [budget, setBudget] = useState('Rp 1.500.000');
  const [pic, setPic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pic) return;

    const div = mockDivisions.find((d) => d.id === divisionId);

    const newProgram: WorkProgram = {
      id: createLocalId('wp'),
      title,
      divisionId,
      divisionName: div ? div.name : 'Divisi OSTIFAK',
      status: 'menunggu_persetujuan',
      progress: 0,
      targetDate,
      budget,
      pic,
    };

    onAddProgram(newProgram);
    onClose();
    setTitle('');
    setPic('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengajuan Proposal & Program Kerja Baru"
      subtitle="Pengajuan program divisi untuk peninjauan BPH dan persetujuan Pembina"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
            Judul Proposal / Kegiatan *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Lomba Kebersihan Kamar Antar Gedung"
            className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
              Divisi Pengaju
            </label>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value as DivisionId)}
              className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
            >
              {mockDivisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
              Target Tanggal Pelaksanaan
            </label>
            <input
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="Contoh: 15 Agu 2026"
              className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
              Estimasi Anggaran Kas (Rp)
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Contoh: Rp 2.500.000"
              className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1 font-headline">
              Penanggung Jawab (PIC) *
            </label>
            <input
              type="text"
              required
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="Contoh: Muhammad Rizky"
              className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
            />
          </div>
        </div>

        <div data-sheet-actions className="space-y-1.5 pt-4 border-t border-[#E2E8F0] pb-2">
          <Button type="submit" variant="primary" size="lg" className="w-full">
            KIRIM PROPOSAL
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            BATAL
          </button>
        </div>
      </form>
    </Modal>
  );
};
