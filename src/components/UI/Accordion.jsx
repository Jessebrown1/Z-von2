import { useState } from 'react';
import './Accordion.css';

/** Single expand/collapse panel — animates to its natural height via a CSS grid-rows trick (no JS measuring). */
export default function Accordion({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`accordion ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="accordion-trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M5 12h14" />
          <path className="accordion-plus-v" d="M12 5v14" />
        </svg>
      </button>
      <div className="accordion-panel">
        <div className="accordion-panel-inner">{children}</div>
      </div>
    </div>
  );
}
