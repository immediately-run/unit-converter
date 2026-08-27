export type TabId = 'convert' | 'zones' | 'refs';

interface Props {
  active: TabId;
  onSelect: (t: TabId) => void;
  position: 'top' | 'bottom';
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'convert', label: 'Convert', icon: '⇄' },
  { id: 'zones', label: 'Time zones', icon: '◷' },
  { id: 'refs', label: 'Quick refs', icon: '≡' },
];

function TabBar({ active, onSelect, position }: Props) {
  return (
    <nav className={`tabbar tabbar-${position}`} aria-label="Sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab${active === t.id ? ' active' : ''}`}
          aria-current={active === t.id ? 'page' : undefined}
          onClick={() => onSelect(t.id)}
        >
          <span className="tab-ic" aria-hidden="true">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default TabBar;
