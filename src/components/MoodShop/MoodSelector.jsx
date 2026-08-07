import { useMemo } from 'react';
import { moods } from '../../data/moods';
import { useProducts } from '../../context/ProductsContext';

/** The clearest photo of what a mood actually looks like — the piece in the catalog most tagged with it. */
function pickMoodImage(products, tag) {
  const withTag = products.filter((p) => p.moodTags?.includes(tag) && p.images?.[0]);
  if (withTag.length === 0) return products.find((p) => p.images?.[0])?.images?.[0] || null;
  // Prefer whichever tagged product has the fewest other mood tags — the
  // one that reads as most "purely" this mood rather than a blend.
  withTag.sort((a, b) => a.moodTags.length - b.moodTags.length);
  return withTag[0].images[0];
}

export default function MoodSelector({ onSelect }) {
  const { products } = useProducts();
  const moodImages = useMemo(
    () => Object.fromEntries(moods.map((mood) => [mood.tag, pickMoodImage(products, mood.tag)])),
    [products]
  );

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
            {moodImages[mood.tag] && (
              <img className="mood-tile-image" src={moodImages[mood.tag]} alt="" aria-hidden="true" />
            )}
            <span className="mood-tile-scrim" aria-hidden="true" />
            <span className="mood-tile-label">{mood.label}</span>
            <span className="mood-tile-tagline">{mood.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
