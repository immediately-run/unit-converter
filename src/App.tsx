// Root component — immediately.run renders the default export of THIS file.
// Global CSS is imported here (not in main.tsx) because immediately.run's
// runtime never loads main.tsx; anything the rendered tree needs must be
// reachable from App.tsx.
import './index.css';
import './App.css';
import { useState } from 'react';
import ConvertTab from './components/ConvertTab';
import QuickRefsTab from './components/QuickRefsTab';
import TabBar from './components/TabBar';
import type { TabId } from './components/TabBar';
import ThemeSwitch from './components/ThemeSwitch';
import TimeZonesTab from './components/TimeZonesTab';
import { useNarrow } from './hooks/useNarrow';
import { usePrefs } from './hooks/usePrefs';

function App() {
  const [tab, setTab] = useState<TabId>('convert');
  const narrow = useNarrow();
  const { prefs, update, state } = usePrefs();

  return (
    <div className={`app${narrow ? ' narrow' : ''}`}>
      <header className="top">
        <div className="logo">
          <span className="mark" aria-hidden="true" />
          <span>
            Convert<span className="grad-text">.</span>
          </span>
        </div>
        {!narrow && <TabBar active={tab} onSelect={setTab} position="top" />}
        <div className="cta">
          <span
            className={`persist persist-${state}`}
            title={
              state === 'persisted'
                ? 'Favourites, pinned zones and precision are saved to your private app storage.'
                : state === 'memory'
                  ? 'No private storage available here — settings last for this session only.'
                  : 'Opening private storage…'
            }
          >
            <span className="persist-dot" aria-hidden="true">●</span>
            {state === 'persisted' ? 'saved' : state === 'memory' ? 'session only' : 'loading'}
          </span>
          <ThemeSwitch />
        </div>
      </header>

      <main className="wrap">
        {tab === 'convert' && <ConvertTab prefs={prefs} update={update} />}
        {tab === 'zones' && <TimeZonesTab prefs={prefs} update={update} />}
        {tab === 'refs' && <QuickRefsTab />}
      </main>

      {narrow && <TabBar active={tab} onSelect={setTab} position="bottom" />}
    </div>
  );
}

export default App;
