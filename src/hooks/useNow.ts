import { useEffect, useState } from 'react';

/** The current time, re-rendering every `everyMs` (aligned to the wall clock). */
export function useNow(everyMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(tick, everyMs - (d.getTime() % everyMs));
    };
    timer = setTimeout(tick, everyMs - (Date.now() % everyMs));
    return () => clearTimeout(timer);
  }, [everyMs]);
  return now;
}
