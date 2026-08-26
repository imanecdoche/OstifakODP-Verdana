import React from 'react';
import { Settings } from 'lucide-react';
import { DivisionId, ViolationRecord, WorkProgram } from '../../types';
import { mockDivisions } from '../../data/mockData';

interface DivisionDetailViewProps {
  divisionId?: DivisionId | null;
  violations?: ViolationRecord[];
  workPrograms?: WorkProgram[];
  onOpenNewViolationModal?: () => void;
  onOpenNewProgramModal?: () => void;
}

export const DivisionDetailView: React.FC<DivisionDetailViewProps> = ({ divisionId }) => {
  const division = mockDivisions.find((d) => d.id === divisionId);
  const divisionName = division ? division.name : 'Divisi OSTIFAK';

  return (
    <div className="w-full min-h-[68vh] flex flex-col items-center justify-center text-center px-4 py-12 select-none animate-in fade-in duration-300">
      {/* 1. Ikon Roda Gigi (Gear) dengan Animasi Putar Halus */}
      <div className="relative mb-6 flex items-center justify-center">
        <Settings 
          className="w-16 h-16 sm:w-20 sm:h-20 text-[#0F172A] stroke-[1.5] animate-spin" 
          style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}
        />
      </div>

      {/* 2. Teks Keterangan Minimalis */}
      <div className="max-w-md space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-headline tracking-tight">
          {divisionName}
        </h2>
        <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed font-body">
          Modul Divisi Sedang Dalam Pengembangan
        </p>
      </div>
    </div>
  );
};
