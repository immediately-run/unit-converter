import { CATEGORY_BY_ID, CATEGORIES } from '../data/units';
import type { Category, Unit } from '../data/units';

export const MIN_SIG = 2;
export const MAX_SIG = 12;
export const DEFAULT_SIG = 6;

export const clampSig = (n: number): number =>
  Math.min(MAX_SIG, Math.max(MIN_SIG, Math.round(Number.isFinite(n) ? n : DEFAULT_SIG)));

export function getCategory(id: string): Category {
  return CATEGORY_BY_ID[id] ?? CATEGORIES[0];
}

export function getUnit(cat: Category, unitId: string): Unit | undefined {
  return cat.units.find((u) => u.id === unitId);
}

/** Convert `value` from one unit to another within a category. */
export function convert(cat: Category, value: number, fromId: string, toId: string): number {
  const from = getUnit(cat, fromId);
  const to = getUnit(cat, toId);
  if (!from || !to) return NaN;
  if (fromId === toId) return value;
  return to.fromBase(from.toBase(value));
}

export interface ConversionRow {
  unit: Unit;
  value: number;
  text: string;
}

/** Every unit of the category, with `value` (in `fromId`) converted. */
export function convertAll(cat: Category, value: number, fromId: string, sig: number): ConversionRow[] {
  return cat.units.map((unit) => {
    const v = convert(cat, value, fromId, unit.id);
    return { unit, value: v, text: formatNumber(v, sig) };
  });
}

/** Parse the number typed into the main input. Accepts `1,5` (decimal comma),
 *  `1,000.5` (thousands separator), exponents, a leading `-`. NaN when empty/bad. */
export function parseInputNumber(raw: string): number {
  let s = raw.trim().replace(/\s+/g, '').replace(/−/g, '-');
  if (!s) return NaN;
  const commas = (s.match(/,/g) ?? []).length;
  if (commas === 1 && !s.includes('.')) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
  return Number(s);
}

/** Format with `sig` significant digits; exponent form for very large/small values. */
export function formatNumber(v: number, sig: number): string {
  const s = clampSig(sig);
  if (Number.isNaN(v)) return '–';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e15 || abs < 1e-7) {
    return v.toExponential(s - 1).replace(/\.?0+e/, 'e').replace('e+', 'e');
  }
  // Round to `s` significant digits first, then group with the user's locale.
  const rounded = Number(v.toPrecision(s));
  try {
    return new Intl.NumberFormat(undefined, {
      maximumSignificantDigits: s,
      useGrouping: true,
    }).format(rounded);
  } catch {
    return String(rounded);
  }
}

/** Full-precision (15 significant digits) rendering for round-tripping a value
 *  back into the input without accumulating display rounding. */
export function exactNumber(v: number): string {
  if (!Number.isFinite(v)) return '';
  return String(Number(v.toPrecision(15)));
}

export const favKey = (catId: string, unitId: string): string => `${catId}:${unitId}`;
