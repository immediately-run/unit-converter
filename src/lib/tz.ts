// Time-zone helpers built on Intl.DateTimeFormat only (no libraries).
import { FALLBACK_ZONES, LEGACY_ZONE_NAMES } from '../data/zones';

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

export interface WallTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Wall-clock fields of an instant in a zone. */
export function wallTime(date: Date, tz: string): WallTime {
  const parts = partsFormatter(tz).formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  };
}

/** Offset of `tz` from UTC at `date`, in minutes (east positive). */
export function offsetMinutes(date: Date, tz: string): number {
  const w = wallTime(date, tz);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** "UTC+5:30" style label. */
export function offsetLabel(date: Date, tz: string): string {
  const m = offsetMinutes(date, tz);
  if (m === 0) return 'UTC';
  const sign = m < 0 ? '−' : '+';
  const abs = Math.abs(m);
  const h = Math.floor(abs / 60);
  const mm = abs % 60;
  return `UTC${sign}${h}${mm ? ':' + String(mm).padStart(2, '0') : ''}`;
}

/** The instant whose wall clock in `tz` reads the given fields (DST-aware,
 *  two-pass fixed point; for a non-existent local time it lands after the gap). */
export function zonedToUtc(w: Omit<WallTime, 'second'>, tz: string): Date {
  const naive = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, 0);
  let guess = naive - offsetMinutes(new Date(naive), tz) * 60000;
  guess = naive - offsetMinutes(new Date(guess), tz) * 60000;
  return new Date(guess);
}

export const isoDate = (w: { year: number; month: number; day: number }): string =>
  `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`;

/** Days from date A to date B by calendar day (−1, 0, +1 …). */
export function dayDelta(from: { year: number; month: number; day: number }, to: { year: number; month: number; day: number }): number {
  const a = Date.UTC(from.year, from.month - 1, from.day);
  const b = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((b - a) / 86400000);
}

export function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

let zoneList: string[] | null = null;
/** All IANA zones the engine knows, else the bundled fallback. Always includes the local zone. */
export function allZones(): string[] {
  if (zoneList) return zoneList;
  let list: string[] = [];
  try {
    const sv = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (typeof sv === 'function') list = sv.call(Intl, 'timeZone');
  } catch {
    list = [];
  }
  if (!list.length) list = [...FALLBACK_ZONES];
  // Prefer current names over the legacy ids some engines still report.
  list = list.map((z) => {
    const modern = LEGACY_ZONE_NAMES[z];
    return modern && isValidZone(modern) ? modern : z;
  });
  list = [...new Set(list)].sort();
  const local = localZone();
  if (!list.includes(local)) list.unshift(local);
  if (!list.includes('UTC')) list.unshift('UTC');
  zoneList = list;
  return list;
}

export function isValidZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "America/Argentina/Buenos_Aires" → { city: "Buenos Aires", region: "America / Argentina" } */
export function zoneLabel(tz: string): { city: string; region: string } {
  const parts = tz.split('/');
  const city = (parts[parts.length - 1] ?? tz).replace(/_/g, ' ');
  const region = parts.slice(0, -1).join(' / ').replace(/_/g, ' ');
  return { city, region };
}

const timeFmtCache = new Map<string, Intl.DateTimeFormat>();
function cached(key: string, make: () => Intl.DateTimeFormat): Intl.DateTimeFormat {
  let f = timeFmtCache.get(key);
  if (!f) {
    f = make();
    timeFmtCache.set(key, f);
  }
  return f;
}

export function fmtClock(date: Date, tz: string, seconds = true): string {
  return cached(`clock:${tz}:${seconds}`, () =>
    new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: seconds ? '2-digit' : undefined,
    }),
  ).format(date);
}

export function fmtDay(date: Date, tz: string): string {
  return cached(`day:${tz}`, () =>
    new Intl.DateTimeFormat(undefined, { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }),
  ).format(date);
}

/** Short zone name at that instant, e.g. "PDT", "GMT+2". */
export function fmtZoneName(date: Date, tz: string): string {
  try {
    const parts = cached(`name:${tz}`, () =>
      new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }),
    ).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

export const isDaytime = (hour: number): boolean => hour >= 7 && hour < 19;
