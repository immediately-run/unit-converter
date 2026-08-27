import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../data/units';
import { clampSig, convert, exactNumber, formatNumber, getCategory, getUnit, parseInputNumber, MAX_SIG, MIN_SIG } from '../lib/convert';
import { parseExpression } from '../lib/parse';
import type { Prefs } from '../lib/prefs';
import CategoryPicker from './CategoryPicker';
import FavouritesRow from './FavouritesRow';
import ResultsList from './ResultsList';

interface Props {
  prefs: Prefs;
  update: (patch: Partial<Prefs> | ((p: Prefs) => Partial<Prefs>)) => void;
}

function ConvertTab({ prefs, update }: Props) {
  const [catId, setCatId] = useState(() => getCategory(prefs.lastCategory).id);
  const category = getCategory(catId);
  const [fromId, setFromId] = useState(category.defaultFrom);
  const [toId, setToId] = useState(category.defaultTo);
  const [input, setInput] = useState('1');
  const [expr, setExpr] = useState('');
  const [exprState, setExprState] = useState<'idle' | 'ok' | 'bad'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  // Adopt the persisted category once the store has loaded (only if untouched).
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current && prefs.lastCategory !== catId) {
      const c = getCategory(prefs.lastCategory);
      setCatId(c.id);
      setFromId(c.defaultFrom);
      setToId(c.defaultTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.lastCategory]);

  const value = parseInputNumber(input);
  const precision = clampSig(prefs.precision);
  const from = getUnit(category, fromId) ?? category.units[0];
  const to = getUnit(category, toId) ?? category.units[1] ?? category.units[0];
  const answer = convert(category, value, from.id, to.id);

  const selectCategory = (id: string) => {
    touched.current = true;
    const c = getCategory(id);
    setCatId(c.id);
    setFromId(c.defaultFrom);
    setToId(c.defaultTo);
    update({ lastCategory: c.id });
  };

  const selectTarget = (unitId: string) => {
    if (unitId === from.id) return;
    setToId(unitId);
  };

  const swap = () => {
    const v = answer;
    setFromId(to.id);
    setToId(from.id);
    if (Number.isFinite(v)) setInput(exactNumber(v));
  };

  const changeFrom = (unitId: string) => {
    if (unitId === toId) setToId(fromId);
    setFromId(unitId);
  };

  const toggleFavourite = (key: string) =>
    update((p) => ({
      favourites: p.favourites.includes(key) ? p.favourites.filter((k) => k !== key) : [...p.favourites, key],
    }));

  const setPrecision = (n: number) => update({ precision: clampSig(n) });

  const applyExpression = (text: string) => {
    setExpr(text);
    if (!text.trim()) {
      setExprState('idle');
      return;
    }
    const parsed = parseExpression(text, catId);
    if (!parsed) {
      setExprState('bad');
      return;
    }
    touched.current = true;
    setExprState('ok');
    setCatId(parsed.category.id);
    setFromId(parsed.from.id);
    if (parsed.to) setToId(parsed.to.id);
    else if (parsed.from.id === toId || parsed.category.id !== catId) {
      const other = parsed.category.units.find((u) => u.id !== parsed.from.id);
      setToId(parsed.category.defaultTo === parsed.from.id ? (other?.id ?? parsed.from.id) : parsed.category.defaultTo);
    }
    setInput(exactNumber(parsed.value));
    if (parsed.category.id !== prefs.lastCategory) update({ lastCategory: parsed.category.id });
  };

  return (
    <section className="convert" aria-label="Convert">
      <div className="exprbox">
        <span className="exprbox-ic" aria-hidden="true">›</span>
        <input
          type="text"
          className={`expr expr-${exprState}`}
          value={expr}
          placeholder="Try “12 km in mi”, “350 f to c”, “2 cups ml”"
          aria-label="Conversion expression"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => applyExpression(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') inputRef.current?.focus();
            if (e.key === 'Escape') applyExpression('');
          }}
        />
        {expr && (
          <button type="button" className="expr-clear" aria-label="Clear expression" onClick={() => applyExpression('')}>
            ✕
          </button>
        )}
      </div>
      {exprState === 'bad' && <p className="expr-hint">Not recognised — try “value unit in unit”, e.g. “5 ft in cm”.</p>}

      <CategoryPicker value={category.id} onChange={selectCategory} />

      <div className="io">
        <div className="io-from">
          <input
            ref={inputRef}
            className="bigval"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label="Value to convert"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
          <select className="unitsel" aria-label="From unit" value={from.id} onChange={(e) => changeFrom(e.target.value)}>
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.symbol} — {u.plural}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="swap" onClick={swap} aria-label="Swap units" title="Swap units">
          ⇄
        </button>
        <div className="io-to">
          <div className="answer" aria-live="polite">
            <span className="answer-val">{formatNumber(answer, precision)}</span>
            <span className="answer-sym">{to.symbol}</span>
          </div>
          <select className="unitsel" aria-label="To unit" value={to.id} onChange={(e) => selectTarget(e.target.value)}>
            {category.units.map((u) => (
              <option key={u.id} value={u.id} disabled={u.id === from.id}>
                {u.symbol} — {u.plural}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="toolbar">
        <span className="tool-label">{category.name} · {category.hint}</span>
        <div className="precision" role="group" aria-label="Precision">
          <button type="button" onClick={() => setPrecision(precision - 1)} disabled={precision <= MIN_SIG} aria-label="Fewer digits">−</button>
          <span className="precision-n">{precision} sig. digits</span>
          <button type="button" onClick={() => setPrecision(precision + 1)} disabled={precision >= MAX_SIG} aria-label="More digits">+</button>
        </div>
      </div>

      <FavouritesRow
        category={category}
        favourites={prefs.favourites}
        value={value}
        fromId={from.id}
        toId={to.id}
        precision={precision}
        onPick={selectTarget}
      />

      <ResultsList
        category={category}
        value={value}
        fromId={from.id}
        toId={to.id}
        precision={precision}
        favourites={prefs.favourites}
        onSelect={selectTarget}
        onToggleFavourite={toggleFavourite}
      />
      <p className="foot-note">
        {CATEGORIES.length} categories · tap a row to make it the target · ★ pins it to the favourites row.
      </p>
    </section>
  );
}

export default ConvertTab;
