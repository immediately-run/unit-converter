import { useMemo, useState } from 'react';
import { allZones, fmtClock, zoneLabel } from '../lib/tz';

interface Props {
  pinned: string[];
  now: Date;
  onAdd: (tz: string) => void;
}

const MAX_RESULTS = 40;

function ZoneSearch({ pinned, now, onAdd }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const zones = useMemo(() => allZones(), []);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, '_');
    const list = needle ? zones.filter((z) => z.toLowerCase().includes(needle)) : zones;
    return list.filter((z) => !pinned.includes(z)).slice(0, MAX_RESULTS);
  }, [q, zones, pinned]);

  return (
    <div className="zsearch">
      <input
        type="search"
        className="zsearch-in"
        placeholder={`Add a city or zone (${zones.length} available)…`}
        aria-label="Search time zones"
        value={q}
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' && results[0]) {
            onAdd(results[0]);
            setQ('');
          }
        }}
      />
      {open && (
        <ul className="zsearch-list" role="listbox" aria-label="Matching zones">
          {results.length === 0 && <li className="zsearch-empty">No zone matches “{q}”.</li>}
          {results.map((z) => {
            const { city, region } = zoneLabel(z);
            return (
              <li key={z}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="zsearch-item"
                  onClick={() => {
                    onAdd(z);
                    setQ('');
                    setOpen(false);
                  }}
                >
                  <span className="zsearch-city">{city}</span>
                  <span className="zsearch-region">{region}</span>
                  <span className="zsearch-time">{fmtClock(now, z, false)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && <button type="button" className="zsearch-close" onClick={() => setOpen(false)}>Done</button>}
    </div>
  );
}

export default ZoneSearch;
