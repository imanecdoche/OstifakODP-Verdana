import type { SeverityLevel } from '../types';

/**
 * Centralized severity classification based on violation point ranges.
 *
 * Ranges (pesantren standard):
 *   1–12  → Ringan
 *  13–25  → Sedang
 *  26–38  → Berat
 *  39–50  → Sangat Berat
 */
export interface SeverityInfo {
  label: string;
  severity: SeverityLevel;
  colorClass: string;
  accentColor: string;
}

export const getSeverityInfo = (pts: number): SeverityInfo => {
  if (pts <= 12) {
    return {
      label: 'Ringan',
      severity: 'ringan',
      colorClass: 'text-emerald-700',
      accentColor: '#059669',
    };
  }
  if (pts <= 25) {
    return {
      label: 'Sedang',
      severity: 'sedang',
      colorClass: 'text-amber-700',
      accentColor: '#D97706',
    };
  }
  if (pts <= 38) {
    return {
      label: 'Berat',
      severity: 'berat',
      colorClass: 'text-rose-600',
      accentColor: '#E11D48',
    };
  }
  return {
    label: 'Sangat Berat',
    severity: 'sangat_berat',
    colorClass: 'text-red-700',
    accentColor: '#DC2626',
  };
};

/** Slider fill percentage (for 1–50 range). */
export const sliderFillPercent = (pts: number): number =>
  ((pts - 1) / 49) * 100;
