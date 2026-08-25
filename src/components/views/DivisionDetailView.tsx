import React from 'react';
import { DivisionId, ViolationRecord, WorkProgram } from '../../types';
import { mockDivisions } from '../../data/mockData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Plus, FileText } from 'lucide-react';

interface DivisionDetailViewProps {
  divisionId: DivisionId;
  violations: ViolationRecord[];
  workPrograms: WorkProgram[];
  onOpenNewViolationModal: () => void;
  onOpenNewProgramModal: () => void;
}

export const DivisionDetailView: React.FC<DivisionDetailViewProps> = ({
  divisionId,
  violations,
  workPrograms,
  onOpenNewViolationModal,
  onOpenNewProgramModal,
}) => {
  const division = mockDivisions.find((d) => d.id === divisionId) || mockDivisions[0];
  const divisionPrograms = workPrograms.filter((p) => p.divisionId === divisionId);

  return (
    <div className="space-y-6">
      {/* Header (Unboxed) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-headline tracking-tight">{division.name}</h1>
          <p className="text-xs text-[#64748B] mt-1 font-body">{division.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {divisionId === 'keamanan' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onOpenNewViolationModal}
              icon={<Plus className="w-4 h-4 text-white" />}
            >
              Catat Pelanggaran
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewProgramModal}
            icon={<Plus className="w-4 h-4 text-white" />}
          >
            Proposal Program
          </Button>
        </div>
      </div>

      {/* Programs */}
      <Card variant="default" className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-headline">
          <FileText className="w-4 h-4 text-[#0F172A]" />
          Program Kerja & Agenda Divisi
        </h3>

        {divisionPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {divisionPrograms.map((p) => (
              <div key={p.id} className="p-4 rounded-md border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#0F172A] font-headline">{p.title}</h4>
                  <Badge variant="success">{p.status}</Badge>
                </div>
                <p className="text-[11px] text-[#64748B] mt-2 ">Target Selesai: {p.targetDate}</p>
                <div className="mt-2 w-full bg-white h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-[#059669] h-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#64748B] font-body">
            Belum ada proposal program spesifik untuk divisi ini. Silakan klik "Proposal Program" untuk mengajukan.
          </div>
        )}
      </Card>
    </div>
  );
};
