import { useEffect, useState } from 'react';
import { useFormFactor } from '@immediately-run/sdk/formFactor';

const QUERY = '(max-width: 640px)';

/** True on phone-sized surfaces: the host-reported form factor OR (for plain
 *  `vite dev`, where the SDK reports a desktop default) a viewport media query. */
export function useNarrow(): boolean {
  const ff = useFormFactor();
  const [narrowViewport, setNarrowViewport] = useState(() => {
    try {
      return window.matchMedia(QUERY).matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia(QUERY);
    } catch {
      return;
    }
    const onChange = () => setNarrowViewport(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return ff.class === 'mobile' || narrowViewport;
}
