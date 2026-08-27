import { fmtClock, fmtDay, fmtZoneName, isDaytime, offsetLabel, wallTime, zoneLabel } from '../lib/tz';

interface Props {
  tz: string;
  now: Date;
  isLocal: boolean;
  isReference: boolean;
  onRemove?: () => void;
  onMakeReference: () => void;
}

function ZoneClock({ tz, now, isLocal, isReference, onRemove, onMakeReference }: Props) {
  const { city, region } = zoneLabel(tz);
  const w = wallTime(now, tz);
  const day = isDaytime(w.hour);
  return (
    <li className={`zone${isReference ? ' is-ref' : ''}${day ? ' day' : ' night'}`}>
      <button type="button" className="zone-main" onClick={onMakeReference} title="Use as the meeting reference zone">
        <span className="zone-city">
          <span className="zone-sun" aria-hidden="true">{day ? '☀' : '☾'}</span>
          {city}
          {isLocal && <span className="zone-tag">local</span>}
          {isReference && <span className="zone-tag ref">reference</span>}
        </span>
        <span className="zone-region">{region || 'Coordinated'} · {fmtZoneName(now, tz)} · {offsetLabel(now, tz)}</span>
        <span className="zone-time">{fmtClock(now, tz)}</span>
        <span className="zone-date">{fmtDay(now, tz)}</span>
      </button>
      {onRemove && (
        <button type="button" className="zone-x" aria-label={`Unpin ${city}`} onClick={onRemove}>
          ✕
        </button>
      )}
    </li>
  );
}

export default ZoneClock;
