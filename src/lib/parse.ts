// Natural expression parser for the top search box: "12 km in mi", "5ft to cm",
// "100 f → c", "3.5 cups ml", "km in mi" (value 1), or a bare unit ("psi").
// No external libraries; resolution goes through the unit catalogue's aliases.
import { CATEGORIES } from '../data/units';
import type { Category, Unit } from '../data/units';

export interface ParsedExpression {
  value: number;
  category: Category;
  from: Unit;
  to?: Unit;
}

interface AliasHit {
  category: Category;
  unit: Unit;
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/[.]+$/g, '')
    .replace(/^(degrees?|deg)(?=[cf]$)/, '');

/** alias → candidate units (an alias may exist in several categories, e.g. "ml"). */
const ALIASES: Map<string, AliasHit[]> = (() => {
  const map = new Map<string, AliasHit[]>();
  const add = (alias: string, hit: AliasHit) => {
    const key = norm(alias);
    if (!key) return;
    const list = map.get(key) ?? [];
    if (!list.some((h) => h.category === hit.category && h.unit === hit.unit)) list.push(hit);
    map.set(key, list);
  };
  for (const category of CATEGORIES) {
    for (const unit of category.units) {
      const hit = { category, unit };
      add(unit.id, hit);
      add(unit.name, hit);
      add(unit.plural, hit);
      add(unit.symbol, hit);
      for (const a of unit.aliases ?? []) add(a, hit);
    }
  }
  return map;
})();

function lookup(token: string): AliasHit[] {
  const key = norm(token);
  if (!key) return [];
  const direct = ALIASES.get(key);
  if (direct) return direct;
  // Tolerate a trailing plural "s" the catalogue may not list ("stones", "knots").
  if (key.endsWith('s')) return ALIASES.get(key.slice(0, -1)) ?? [];
  return [];
}

const NUMBER_RE = /^\s*([-+−]?(?:\d[\d,]*\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s*(.*)$/i;
const SEP_RE = /\s+(?:in|to|as|into)\s+|\s*(?:=|→|->|>)\s*/gi;

/** Returns null when the text does not look like a conversion expression.
 *  `preferCategoryId` wins ties when a unit exists in several categories
 *  ("cups" is both Volume and Cooking). */
export function parseExpression(input: string, preferCategoryId?: string): ParsedExpression | null {
  const text = input.trim();
  if (!text) return null;

  let value = 1;
  let rest = text;
  const m = NUMBER_RE.exec(text);
  if (m) {
    const numText = m[1].replace(/−/g, '-');
    const commas = (numText.match(/,/g) ?? []).length;
    const cleaned =
      commas === 1 && !numText.includes('.') ? numText.replace(',', '.') : numText.replace(/,/g, '');
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return null;
    value = n;
    rest = m[2];
  }
  if (!rest.trim()) return null;

  let fromText: string | undefined;
  let toText: string | undefined;
  // Every separator occurrence is a candidate split; "in" is also the inch unit
  // ("12 in to cm", "5 ft in in"), so take the first split where BOTH sides resolve,
  // falling back to the first split whose left side resolves.
  const candidates: [string, string][] = [];
  for (const sm of rest.matchAll(SEP_RE)) {
    if (sm[0].trim() === '' || sm.index === undefined) continue;
    const left = rest.slice(0, sm.index).trim();
    const right = rest.slice(sm.index + sm[0].length).trim();
    if (left && right) candidates.push([left, right]);
  }
  const both = candidates.find(([a, b]) => lookup(a).length && lookup(b).length);
  const leftOnly = candidates.find(([a]) => lookup(a).length);
  if (both) [fromText, toText] = both;
  else if (leftOnly) [fromText, toText] = leftOnly;
  else {
    // No usable separator: try "km mi" (two tokens) via longest-prefix split.
    const words = rest.trim().split(/\s+/);
    if (words.length === 1) {
      fromText = words[0];
    } else {
      for (let i = words.length - 1; i >= 1 && !fromText; i--) {
        const a = words.slice(0, i).join(' ');
        const b = words.slice(i).join(' ');
        if (lookup(a).length && lookup(b).length) [fromText, toText] = [a, b];
      }
      fromText ??= rest.trim();
    }
  }

  const prefer = (hits: AliasHit[]) =>
    preferCategoryId ? [...hits].sort((a, b) => Number(b.category.id === preferCategoryId) - Number(a.category.id === preferCategoryId)) : hits;
  const fromHits = prefer(lookup(fromText));
  if (!fromHits.length) return null;
  if (!toText) {
    const { category, unit } = fromHits[0];
    return { value, category, from: unit };
  }
  const toHits = prefer(lookup(toText));
  if (!toHits.length) {
    const { category, unit } = fromHits[0];
    return { value, category, from: unit };
  }
  // Pick the pair sharing a category (catalogue order breaks ties).
  for (const f of fromHits) {
    const t = toHits.find((h) => h.category === f.category);
    if (t) return { value, category: f.category, from: f.unit, to: t.unit };
  }
  const { category, unit } = fromHits[0];
  return { value, category, from: unit };
}
