import React from 'react';

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export interface HighDensityTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
}

export function HighDensityTable<T = any>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'Tidak ada data untuk ditampilkan.',
}: HighDensityTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[#64748B] font-body border-t border-b border-[#E2E8F0]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto font-body select-none">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#0F172A] text-[10px] uppercase font-bold text-[#475569] font-headline tracking-wider">
            {columns.map((col) => (
              <th key={col.key} className={`py-2 px-2.5 font-bold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.map((item, idx) => (
            <tr key={keyExtractor(item, idx)} className="hover:bg-[#F8FAFC] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`py-2 px-2.5 text-[#0F172A] ${col.className || ''}`}>
                  {col.render(item, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
