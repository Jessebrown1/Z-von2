import './SelectorGroup.css';

/** Pill-style selector used for product size/color choices. */
export default function SelectorGroup({ label, options, value, onChange }) {
  return (
    <div className="selector-group">
      <span className="selector-group-label">{label}</span>
      <div className="selector-group-options" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            className={`selector-pill ${value === option ? 'is-active' : ''}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
