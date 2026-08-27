import { useMemo, useState } from 'react';
import { useNow } from '../hooks/useNow';
import type { Prefs } from '../lib/prefs';
import { isValidZone, isoDate, localZone, wallTime } from '../lib/tz';
import MeetingPlanner from './MeetingPlanner';
import OverlapStrip from './OverlapStrip';
import ZoneClock from './ZoneClock';
import ZoneSearch from './ZoneSearch';

interface Props {
  prefs: Prefs;
  update: (patch: Partial<Prefs> | ((p: Prefs) => Partial<Prefs>)) => void;
}

const MAX_PINNED = 12;

function TimeZonesTab({ prefs, update }: Props) {
  const now = useNow(1000);
  const local = useMemo(() => localZone(), []);
  const zones = useMemo(() => {
    const seen = new Set<string>([local]);
    const list = [local];
    for (const z of prefs.pinnedZones) {
      if (!seen.has(z) && isValidZone(z)) {
        seen.add(z);
        list.push(z);
      }
    }
    return list.slice(0, MAX_PINNED);
  }, [prefs.pinnedZones, local]);

  const [reference, setReference] = useState(local);
  const ref = zones.includes(reference) ? reference : local;
  const [date, setDate] = useState(() => isoDate(wallTime(new Date(), local)));
  const [time, setTime] = useState(() => {
    const w = wallTime(new Date(), local);
    return `${String(w.hour).padStart(2, '0')}:00`;
  });

  const addZone = (tz: string) => update((p) => ({ pinnedZones: p.pinnedZones.includes(tz) ? p.pinnedZones : [...p.pinnedZones, tz] }));
  const removeZone = (tz: string) => update((p) => ({ pinnedZones: p.pinnedZones.filter((z) => z !== tz) }));
  const setNow = () => {
    const w = wallTime(new Date(), ref);
    setDate(isoDate(w));
    setTime(`${String(w.hour).padStart(2, '0')}:${String(w.minute).padStart(2, '0')}`);
  };

  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{1,2}):(\d{2})/.exec(time);
  const day = dm ? { year: +dm[1], month: +dm[2], day: +dm[3] } : wallTime(now, ref);
  const meetingHour = tm ? +tm[1] + +tm[2] / 60 : null;

  return (
    <section className="zones" aria-label="Time zones">
      <ZoneSearch pinned={zones} now={now} onAdd={addZone} />
      {zones.length >= MAX_PINNED && <p className="expr-hint">Up to {MAX_PINNED} pinned zones — unpin one to add another.</p>}

      <ul className="zone-grid" aria-label="World clock">
        {zones.map((z) => (
          <ZoneClock
            key={z}
            tz={z}
            now={now}
            isLocal={z === local}
            isReference={z === ref}
            onRemove={z === local ? undefined : () => removeZone(z)}
            onMakeReference={() => setReference(z)}
          />
        ))}
      </ul>

      <h2 className="h2">Meeting planner.</h2>
      <MeetingPlanner
        zones={zones}
        reference={ref}
        date={date}
        time={time}
        onReference={setReference}
        onDate={setDate}
        onTime={setTime}
        onNow={setNow}
      />

      <div className="strip-head-row">
        <h2 className="h2">Working-hours overlap.</h2>
        <div className="hours" role="group" aria-label="Working hours">
          <label>
            from
            <input type="number" min={0} max={23} value={prefs.workStart} onChange={(e) => update({ workStart: Math.min(23, Math.max(0, Number(e.target.value) || 0)) })} aria-label="Work day start hour" />
          </label>
          <label>
            to
            <input type="number" min={1} max={24} value={prefs.workEnd} onChange={(e) => update({ workEnd: Math.min(24, Math.max(1, Number(e.target.value) || 0)) })} aria-label="Work day end hour" />
          </label>
        </div>
      </div>
      <OverlapStrip zones={zones} reference={ref} day={day} meetingHour={meetingHour} workStart={prefs.workStart} workEnd={prefs.workEnd} />
      <p className="foot-note">Hours along the top are in the reference zone; shaded cells are that zone's working hours, highlighted columns are when everyone is at work. The line marks the meeting.</p>
    </section>
  );
}

export default TimeZonesTab;
