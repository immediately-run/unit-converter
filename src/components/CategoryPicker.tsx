import { CATEGORIES } from '../data/units';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

function CategoryPicker({ value, onChange }: Props) {
  return (
    <div className="catrow" role="tablist" aria-label="Category">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={c.id === value}
          className={`chip${c.id === value ? ' active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryPicker;
