import type { Category } from '../data/units';
import { convertAll, favKey } from '../lib/convert';

interface Props {
  category: Category;
  value: number;
  fromId: string;
  toId: string;
  precision: number;
  favourites: string[];
  onSelect: (unitId: string) => void;
  onToggleFavourite: (key: string) => void;
}

function ResultsList({ category, value, fromId, toId, precision, favourites, onSelect, onToggleFavourite }: Props) {
  const rows = convertAll(category, value, fromId, precision);
  return (
    <ul className="results" aria-label="Conversions">
      {rows.map(({ unit, text }) => {
        const key = favKey(category.id, unit.id);
        const fav = favourites.includes(key);
        const isFrom = unit.id === fromId;
        const isTo = unit.id === toId;
        return (
          <li key={unit.id} className={`row${isTo ? ' is-to' : ''}${isFrom ? ' is-from' : ''}`}>
            <button
              type="button"
              className="row-main"
              onClick={() => onSelect(unit.id)}
              title={isFrom ? 'Current input unit' : `Convert to ${unit.plural}`}
            >
              <span className="row-val">{text}</span>
              <span className="row-sym">{unit.symbol}</span>
              <span className="row-name">{unit.plural}</span>
            </button>
            <button
              type="button"
              className={`row-star${fav ? ' on' : ''}`}
              aria-pressed={fav}
              aria-label={fav ? `Unpin ${unit.name}` : `Pin ${unit.name}`}
              onClick={() => onToggleFavourite(key)}
            >
              {fav ? '★' : '☆'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ResultsList;
