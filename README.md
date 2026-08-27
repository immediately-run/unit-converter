# Convert — units, time zones and a world clock

An [immediately.run](https://immediately.run) app: instant unit conversion, a
searchable world clock with a meeting planner, and a few quick-reference tables.
Everything runs in the browser; there is no server, no account, and no network
call after the app has loaded.

**Try it:** <https://immediately.run/present/github/immediately-run/unit-converter/main/files/src/App.tsx>

## What it does

**Convert** — twelve categories (length, mass, temperature, area, volume, speed,
time, data in SI *and* IEC, energy, pressure, fuel economy, cooking). Type one
value, pick the unit, and every unit in the category is converted at once. Tap a
row to make it the highlighted target, use the swap button to go the other way,
and star any unit to pin it to the favourites row. A precision control sets the
number of significant digits. The box at the top understands natural
expressions — `12 km in mi`, `350 f to c`, `2 cups ml`, `500 GB in GiB`, or a
bare `psi` — with a small hand-written parser (no library).

**Time zones** — a world clock over the full IANA zone list the browser knows
(`Intl.supportedValuesOf('timeZone')`, with a bundled fallback of ~70 major
zones for engines that lack it). Pin zones from the search box; clocks tick live
with day/night, short zone name and UTC offset. The meeting planner takes a
date and time in any pinned zone and shows it in all the others with day-boundary
hints (`+1 day`, `late/early`). A 24-hour SVG strip shades each zone's working
hours and highlights the columns where everyone is at work. All date math uses
`Intl.DateTimeFormat` only.

**Quick refs** — paper sizes (ISO A/B, North American), clothing and shoe size
tables, cooking spoons/cups, oven temperatures and ingredient weights. Data lives
in `src/data/refs.ts`.

## How data is stored

The app keeps a single small preferences file — favourite units, pinned zones,
precision, the last category and working hours — in its **private, per-user
storage** on immediately.run (the app's settings mount, via
`openSettings()` from `@immediately-run/sdk/mounts`). Nothing else is written
and nothing is shared: there is no multi-user mode. If that storage is
unavailable or read-only the header badge says "session only" and everything
still works, just without persistence across reloads. Under local `vite dev`
the same code writes to `./devfs-playground/` (git-ignored).

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
npm run lint     # includes the React Fast Refresh rule immediately.run relies on
```

To run the working tree inside the real host (SDK channel, capability gate,
private storage) without committing:

```bash
npx @immediately-run/cli dev . --origin https://immediately.run
```

Layout: `src/App.tsx` is the entry, components in `src/components/`, unit and
reference data in `src/data/`, conversion / parsing / time-zone logic in
`src/lib/`, hooks in `src/hooks/`. See `CLAUDE.md` for the platform rules.

## License

MIT — see `LICENSE`.
