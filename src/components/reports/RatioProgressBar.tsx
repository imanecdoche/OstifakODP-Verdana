import React from 'react';

export interface RatioSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface RatioProgressBarProps {
  segments: RatioSegment[];
  height?: number;
  title?: string;
  subtitle?: string;
  showValues?: boolean;
}

export const RatioProgressBar: React.FC<RatioProgressBarProps> = ({
  segments,
  height = 8,
  title,
  subtitle,
  showValues = true,
}) => {
  const totalValue = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0);

  return (
    <div className="w-full space-y-1.5 font-body">
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="flex items-baseline justify-between text-xs">
          {title && <span className="font-bold text-[#0F172A] font-headline">{title}</span>}
          {subtitle && <span className="text-[11px] text-[#64748B]">{subtitle}</span>}
        </div>
      )}

      {/* Thin Flat Stacked Bar */}
      <div 
        style={{ height: `${height}px` }} 
        className="w-full bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden flex"
      >
        {totalValue > 0 ? (
          segments.map((seg) => {
            const pct = (Math.max(0, seg.value) / totalValue) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={seg.id}
                style={{
                  width: `${pct}%`,
                  backgroundColor: seg.color,
                }}
                className="h-full transition-all duration-300 relative group"
                title={`${seg.label}: ${seg.value} (${Math.round(pct)}%)`}
              />
            );
          })
        ) : (
          <div className="w-full h-full bg-[#E2E8F0]" />
        )}
      </div>

      {/* Clean Percentage Breakdown Below Bar */}
      {showValues && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#64748B] pt-0.5">
          {segments.map((seg) => {
            const pct = totalValue > 0 ? Math.round((Math.max(0, seg.value) / totalValue) * 100) : 0;
            return (
              <div key={seg.id} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="truncate">{seg.label}:</span>
                <strong className="text-[#0F172A] font-mono shrink-0">
                  {seg.value} ({pct}%)
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
