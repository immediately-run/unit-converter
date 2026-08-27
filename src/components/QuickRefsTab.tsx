import { useState } from 'react';
import { REF_GROUPS } from '../data/refs';
import RefTable from './RefTable';

function QuickRefsTab() {
  const [groupId, setGroupId] = useState(REF_GROUPS[0].id);
  const group = REF_GROUPS.find((g) => g.id === groupId) ?? REF_GROUPS[0];
  return (
    <section className="refs" aria-label="Quick references">
      <div className="catrow" role="tablist" aria-label="Reference group">
        {REF_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === group.id}
            className={`chip${g.id === group.id ? ' active' : ''}`}
            onClick={() => setGroupId(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>
      <div className="ref-grid">
        {group.tables.map((t) => (
          <RefTable key={t.id} table={t} />
        ))}
      </div>
    </section>
  );
}

export default QuickRefsTab;
