import { useRef } from 'react';
import './Tabs.css';

/**
 * Accessible tab list (WAI-ARIA tabs pattern: arrow keys, Home/End, roving
 * tabindex). The page renders the active panel with role="tabpanel",
 * id `${idPrefix}-panel-${tab}` and aria-labelledby `${idPrefix}-tab-${tab}`.
 * tabs: [{ id, label, marker?, count? }]
 */
export default function Tabs({ idPrefix, label, tabs, value, onChange }) {
  const refs = useRef({});

  function handleKeyDown(event, index) {
    const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) {
      return;
    }
    event.preventDefault();
    const next = tabs[(keys[event.key] + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  }

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              refs.current[tab.id] = element;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className="tabs__tab"
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.marker ? (
              <span className="tabs__marker" aria-hidden="true">
                {tab.marker}
              </span>
            ) : null}
            <span>{tab.label}</span>
            {tab.count ? <span className="tabs__count">{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
