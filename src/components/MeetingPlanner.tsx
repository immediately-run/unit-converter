import { dayDelta, fmtClock, fmtDay, isoDate, wallTime, zonedToUtc, zoneLabel } from '../lib/tz';
import type { WallTime } from '../lib/tz';

interface Props {
  zones: string[];
  reference: string;
  date: string; // YYYY-MM-DD in the reference zone
  time: string; // HH:MM in the reference zone
  onReference: (tz: string) => void;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
  onNow: () => void;
}

function parseFields(date: string, time: string): Omit<WallTime, 'second'> | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!dm || !tm) return null;
  return { year: +dm[1], month: +dm[2], day: +dm[3], hour: +tm[1], minute: +tm[2] };
}

function MeetingPlanner({ zones, reference, date, time, onReference, onDate, onTime, onNow }: Props) {
  const fields = parseFields(date, time);
  const instant = fields ? zonedToUtc(fields, reference) : null;
  const refDay = fields ? { year: fields.year, month: fields.month, day: fields.day } : null;

  return (
    <div className="planner">
      <div className="planner-form">
        <label className="planner-field">
          <span>In</span>
          <select value={reference} onChange={(e) => onReference(e.target.value)} aria-label="Reference zone">
            {zones.map((z) => (
              <option key={z} value={z}>
                {zoneLabel(z).city}
              </option>
            ))}
          </select>
        </label>
        <label className="planner-field">
          <span>on</span>
          <input type="date" value={date} onChange={(e) => onDate(e.target.value)} aria-label="Meeting date" />
        </label>
        <label className="planner-field">
          <span>at</span>
          <input type="time" value={time} onChange={(e) => onTime(e.target.value)} aria-label="Meeting time" />
        </label>
        <button type="button" className="btn btn-ghost small" onClick={onNow}>
          Now
        </button>
      </div>
      {instant && refDay ? (
        <ul className="planner-rows" aria-label="Meeting time across zones">
          {zones.map((z) => {
            const w = wallTime(instant, z);
            const delta = dayDelta(refDay, w);
            const hint = delta === 0 ? 'same day' : delta > 0 ? `+${delta} day${delta > 1 ? 's' : ''}` : `${delta} day${delta < -1 ? 's' : ''}`;
            const off = w.hour < 7 || w.hour >= 22;
            return (
              <li key={z} className={`planner-row${z === reference ? ' ref' : ''}${off ? ' off' : ''}`}>
                <span className="planner-city">{zoneLabel(z).city}</span>
                <span className="planner-time">{fmtClock(instant, z, false)}</span>
                <span className="planner-day">{fmtDay(instant, z)}</span>
                <span className={`planner-hint${delta !== 0 ? ' warn' : ''}`}>{hint}{off ? ' · late/early' : ''}</span>
                <span className="planner-iso">{isoDate(w)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="planner-empty">Pick a date and time to see it everywhere.</p>
      )}
    </div>
  );
}

export default MeetingPlanner;
