import { moods } from '../../data/moods';

export default function MoodSelector({ onSelect }) {
  return (
    <div className="mood-selector">
      <p className="eyebrow">Shop By Mood</p>
      <h1 className="serif mood-selector-heading">What Are You Feeling?</h1>
      <p className="mood-selector-sub">Not a category. A feeling — we'll find the pieces that match it.</p>

      <div className="mood-grid">
        {moods.map((mood) => (
          <button
            type="button"
            key={mood.slug}
            className={`mood-tile mood-tile--${mood.slug}`}
            style={{ '--mood-accent': mood.accent, '--mood-glow': mood.glow }}
            onClick={() => onSelect(mood)}
          >
            <span className="mood-tile-label">{mood.label}</span>
            <span className="mood-tile-tagline">{mood.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
