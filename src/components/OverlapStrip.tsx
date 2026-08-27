import { wallTime, zonedToUtc, zoneLabel } from '../lib/tz';

interface Props {
  zones: string[];
  reference: string;
  /** Calendar day in the reference zone the strip describes. */
  day: { year: number; month: number; day: number };
  /** Meeting hour (fractional) in the reference zone, or null. */
  meetingHour: number | null;
  workStart: number;
  workEnd: number;
}

const LABEL_W = 92;
const HOUR_W = 22;
const ROW_H = 26;
const HEAD_H = 18;
const PAD = 4;

/** 24-hour strip: one row per zone, each hour of the reference zone's day is
 *  shaded when it falls inside that zone's working hours; columns where every
 *  zone is at work are the overlap. Pure SVG, scrolls horizontally on phones. */
function OverlapStrip({ zones, reference, day, meetingHour, workStart, workEnd }: Props) {
  const width = LABEL_W + 24 * HOUR_W + PAD;
  const height = HEAD_H + zones.length * ROW_H + PAD;
  const inWork = (h: number) => (workStart <= workEnd ? h >= workStart && h < workEnd : h >= workStart || h < workEnd);

  // Wall hour of each zone for every hour of the reference day.
  const grid = zones.map((tz) =>
    Array.from({ length: 24 }, (_, h) => {
      const inst = zonedToUtc({ ...day, hour: h, minute: 0 }, reference);
      const w = wallTime(inst, tz);
      return { hour: w.hour, work: inWork(w.hour) };
    }),
  );
  const overlap = Array.from({ length: 24 }, (_, h) => grid.every((row) => row[h].work));

  return (
    <div className="strip-wrap">
      <svg
        className="strip"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`Working-hours overlap across ${zones.length} zones`}
      >
        {Array.from({ length: 24 }, (_, h) => (
          <g key={h}>
            {overlap[h] && (
              <rect className="strip-overlap" x={LABEL_W + h * HOUR_W} y={0} width={HOUR_W} height={height} rx={3} />
            )}
            {h % 3 === 0 && (
              <text className="strip-head" x={LABEL_W + h * HOUR_W + 2} y={HEAD_H - 6}>
                {String(h).padStart(2, '0')}
              </text>
            )}
          </g>
        ))}
        {zones.map((tz, r) => {
          const y = HEAD_H + r * ROW_H;
          return (
            <g key={tz}>
              <text className={`strip-label${tz === reference ? ' ref' : ''}`} x={LABEL_W - 8} y={y + ROW_H / 2 + 4} textAnchor="end">
                {zoneLabel(tz).city.slice(0, 13)}
              </text>
              {grid[r].map((cell, h) => (
                <g key={h}>
                  <rect
                    className={`strip-cell${cell.work ? ' work' : ''}`}
                    x={LABEL_W + h * HOUR_W + 1}
                    y={y + 3}
                    width={HOUR_W - 2}
                    height={ROW_H - 6}
                    rx={3}
                  />
                  <text className="strip-hour" x={LABEL_W + h * HOUR_W + HOUR_W / 2} y={y + ROW_H / 2 + 3.5} textAnchor="middle">
                    {cell.hour}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
        {meetingHour !== null && (
          <line
            className="strip-meeting"
            x1={LABEL_W + meetingHour * HOUR_W}
            x2={LABEL_W + meetingHour * HOUR_W}
            y1={2}
            y2={height - PAD}
          />
        )}
      </svg>
    </div>
  );
}

export default OverlapStrip;
