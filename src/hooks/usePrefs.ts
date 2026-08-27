import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PREFS, openPrefsBackend } from '../lib/prefs';
import type { Prefs, PrefsBackend, PersistenceState } from '../lib/prefs';

/** Preferences with best-effort persistence to the private store. The app never
 *  waits on the store: defaults render immediately, persisted values merge in. */
export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [state, setState] = useState<PersistenceState>('loading');
  const backend = useRef<PrefsBackend | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const be = await openPrefsBackend();
      if (cancelled) return;
      let loaded: Partial<Prefs> = {};
      try {
        loaded = await be.load();
      } catch {
        loaded = {};
      }
      if (cancelled) return;
      backend.current = be;
      // Keep any edits the user made while the store was still opening.
      setPrefs((cur) => (dirty.current ? cur : { ...DEFAULT_PREFS, ...loaded }));
      setState(be.state);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dirty.current || !backend.current) return;
    if (timer.current) clearTimeout(timer.current);
    const be = backend.current;
    const snapshot = prefs;
    timer.current = setTimeout(() => {
      be.save(snapshot).catch(() => setState('memory'));
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [prefs]);

  const update = useCallback((patch: Partial<Prefs> | ((p: Prefs) => Partial<Prefs>)) => {
    dirty.current = true;
    setPrefs((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) }));
  }, []);

  return { prefs, update, state };
}
