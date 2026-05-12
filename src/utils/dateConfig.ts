/**
 * Shared date configuration — single source of truth.
 * Import from here instead of re-declaring in each component.
 */

export const APP_START_YEAR = 2025;

export const CURRENT_YEAR = new Date().getFullYear();

export const CURRENT_MONTH_INDEX = new Date().getMonth(); // 0-based

/** Sorted ascending: [2026, 2027, ...currentYear] */
export const YEAR_OPTIONS = Array.from(
  { length: Math.max(1, CURRENT_YEAR - APP_START_YEAR + 1) },
  (_, i) => APP_START_YEAR + i,
);

/** Full month labels (index 0 = Tháng 1) */
export const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

/** Short month labels used in charts (index 0 = T1) */
export const MONTH_SHORT_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];
