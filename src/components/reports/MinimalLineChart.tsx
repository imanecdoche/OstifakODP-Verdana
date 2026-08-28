import React, { useState } from 'react';

export interface LineSeries {
  id: string;
  label: string;
  color: string;
  data: number[];
}

export interface MinimalLineChartProps {
  dataPoints: Array<{ label: string; date?: string }>;
  series: LineSeries[];
  height?: number;
  showLegend?: boolean;
  valueFormatter?: (val: number) => string;
}

export const MinimalLineChart: React.FC<MinimalLineChartProps> = ({
  dataPoints,
  series,
  height = 180,
  showLegend = true,
  valueFormatter = (val) => String(val),
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!dataPoints || dataPoints.length === 0 || !series || series.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 font-body">
        Belum ada data tren yang cukup untuk ditampilkan.
      </div>
    );
  }

  // Chart Dimensions
  const svgWidth = 600;
  const svgHeight = height;
  const padLeft = 35;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 28;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Max value calculation for Y axis
  let maxVal = 0;
  series.forEach((s) => {
    s.data.forEach((v) => {
      if (v > maxVal) maxVal = v;
    });
  });
  if (maxVal === 0) maxVal = 5;
  maxVal = Math.ceil(maxVal * 1.15); // Add 15% headroom

  const numTicksY = 4;
  const yTicks = Array.from({ length: numTicksY }, (_, i) => {
    const val = Math.round((maxVal / (numTicksY - 1)) * i);
    return val;
  });

  const getX = (index: number) => {
    if (dataPoints.length === 1) return padLeft + chartWidth / 2;
    return padLeft + (index * chartWidth) / (dataPoints.length - 1);
  };

  const getY = (val: number) => {
    const ratio = val / maxVal;
    return padTop + chartHeight - ratio * chartHeight;
  };

  return (
    <div className="w-full space-y-2 font-body select-none">
      {/* Legend Header */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 font-medium pb-1 border-b border-[#E2E8F0]">
          {series.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* SVG Flat Vector Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Y Axis Hairline Grids & Labels */}
          {yTicks.map((tickVal) => {
            const y = getY(tickVal);
            return (
              <g key={tickVal}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94A3B8"
                  fontWeight="500"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {dataPoints.map((dp, idx) => {
            const x = getX(idx);
            // Skip labels if data points are too dense
            const skipStep = Math.ceil(dataPoints.length / 10);
            if (idx % skipStep !== 0 && idx !== dataPoints.length - 1) return null;

            return (
              <text
                key={dp.label + idx}
                x={x}
                y={svgHeight - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#64748B"
                fontWeight="500"
              >
                {dp.label}
              </text>
            );
          })}

          {/* Data Line Paths */}
          {series.map((s) => {
            if (s.data.length === 0) return null;

            const pathD = s.data.reduce((acc, val, idx) => {
              const x = getX(idx);
              const y = getY(val);
              return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            }, '');

            return (
              <g key={s.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data Points */}
                {s.data.map((val, idx) => {
                  const cx = getX(idx);
                  const cy = getY(val);
                  const isHovered = hoveredIndex === idx;
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '4' : '2.5'}
                      fill="#FFFFFF"
                      stroke={s.color}
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Hover Crosshair Line */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={padTop}
              x2={getX(hoveredIndex)}
              y2={padTop + chartHeight}
              stroke="#0F172A"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Hover Detection Columns */}
          {dataPoints.map((_, idx) => {
            const x = getX(idx);
            const colWidth = chartWidth / Math.max(1, dataPoints.length - 1);
            return (
              <rect
                key={idx}
                x={x - colWidth / 2}
                y={padTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Minimal Tooltip Overlay */}
        {hoveredIndex !== null && dataPoints[hoveredIndex] && (
          <div
            style={{
              left: `${(getX(hoveredIndex) / svgWidth) * 100}%`,
              transform: 'translateX(-50%)',
            }}
            className="absolute top-1 pointer-events-none bg-[#0F172A] text-white px-2.5 py-1.5 rounded text-[10px] space-y-0.5 z-20 whitespace-nowrap shadow-sm border border-slate-700"
          >
            <p className="font-bold border-b border-slate-700 pb-0.5">
              {dataPoints[hoveredIndex].date || dataPoints[hoveredIndex].label}
            </p>
            {series.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 font-mono">
                <span className="text-slate-300">{s.label}:</span>
                <span className="font-bold" style={{ color: s.color === '#0F172A' ? '#38BDF8' : s.color }}>
                  {valueFormatter(s.data[hoveredIndex] || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
