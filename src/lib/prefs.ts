// User preferences: persisted to the app's private store (one file), with an
// in-memory fallback so the app is fully usable when persistence is unavailable.
import { DEFAULT_SIG } from './convert';
import { DEFAULT_PINNED_ZONES } from '../data/zones';
import { openPrivateStore, readJson, writeJson } from './store';
import type { Store } from './store';

export interface Prefs {
  /** `<categoryId>:<unitId>` keys. */
  favourites: string[];
  pinnedZones: string[];
  precision: number;
  lastCategory: string;
  /** Working-hours window for the overlap strip (local hours, 0-24). */
  workStart: number;
  workEnd: number;
}

export const DEFAULT_PREFS: Prefs = {
  favourites: ['length:km', 'length:mi', 'mass:kg', 'mass:lb', 'temperature:c', 'temperature:f'],
  pinnedZones: DEFAULT_PINNED_ZONES,
  precision: DEFAULT_SIG,
  lastCategory: 'length',
  workStart: 9,
  workEnd: 17,
};

const FILE = 'prefs.json';

export type PersistenceState = 'loading' | 'persisted' | 'memory';

export interface PrefsBackend {
  state: PersistenceState;
  load: () => Promise<Partial<Prefs>>;
  save: (p: Prefs) => Promise<void>;
}

function sanitize(raw: unknown): Partial<Prefs> {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const out: Partial<Prefs> = {};
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined);
  const fav = strs(r.favourites);
  if (fav) out.favourites = fav;
  const zones = strs(r.pinnedZones);
  if (zones) out.pinnedZones = zones;
  if (typeof r.precision === 'number') out.precision = r.precision;
  if (typeof r.lastCategory === 'string') out.lastCategory = r.lastCategory;
  if (typeof r.workStart === 'number') out.workStart = r.workStart;
  if (typeof r.workEnd === 'number') out.workEnd = r.workEnd;
  return out;
}

/** Opens the private store. Resolves to a memory-only backend when the host has
 *  no settings mount (or it is read-only) — never throws. */
export async function openPrefsBackend(): Promise<PrefsBackend> {
  let store: Store | null = null;
  try {
    store = await openPrivateStore('data');
  } catch {
    store = null;
  }
  if (!store) {
    return { state: 'memory', load: async () => ({}), save: async () => {} };
  }
  const path = `${store.root}/${FILE}`;
  const writable = store.mode === 'rw';
  return {
    state: writable ? 'persisted' : 'memory',
    load: async () => sanitize(await readJson<unknown>(path, null)),
    save: async (p) => {
      if (!writable) return;
      await writeJson(path, p);
    },
  };
}
