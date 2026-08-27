import type { Category } from '../data/units';
import { convert, favKey, formatNumber } from '../lib/convert';

interface Props {
  category: Category;
  favourites: string[];
  value: number;
  fromId: string;
  toId: string;
  precision: number;
  onPick: (unitId: string) => void;
}

/** Pinned units of the current category, each showing the live converted value. */
function FavouritesRow({ category, favourites, value, fromId, toId, precision, onPick }: Props) {
  const units = category.units.filter((u) => favourites.includes(favKey(category.id, u.id)));
  if (!units.length) {
    return <p className="favs-empty">Star a result below to pin it here.</p>;
  }
  return (
    <div className="favs" aria-label="Favourite units">
      {units.map((u) => (
        <button
          key={u.id}
          type="button"
          className={`fav${u.id === toId ? ' active' : ''}`}
          onClick={() => onPick(u.id)}
          title={`Show ${u.plural}`}
        >
          <span className="fav-star" aria-hidden="true">★</span>
          <span className="fav-val">{Number.isNaN(value) ? '–' : formatNumber(convert(category, value, fromId, u.id), precision)}</span>
          <span className="fav-unit">{u.symbol}</span>
        </button>
      ))}
    </div>
  );
}

export default FavouritesRow;
