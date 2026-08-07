import { useMemo } from 'react';
import ProductCard from '../ProductCard';
import { useProducts } from '../../context/ProductsContext';

export default function MoodExperience({ mood, onChangeMood }) {
  const { products } = useProducts();

  const matches = useMemo(
    () => products.filter((p) => p.moodTags?.includes(mood.tag)),
    [products, mood.tag]
  );

  return (
    <div
      className={`mood-experience mood-experience--${mood.slug}`}
      style={{ '--mood-accent': mood.accent, '--mood-glow': mood.glow }}
    >
      <button type="button" className="mood-experience-back" onClick={onChangeMood}>
        &larr; Change Mood
      </button>

      <header className="mood-experience-header">
        <p className="eyebrow">{mood.label}</p>
        <h1 className="serif">{mood.tagline}</h1>

        <div className="mood-ai-note">
          <span className="mood-ai-note-tag">ZÉVON AI</span>
          <p>
            Your style is leaning toward {mood.label.toLowerCase()}. {mood.description}
          </p>
        </div>
      </header>

      {matches.length > 0 ? (
        <div className="mood-experience-grid">
          {matches.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mood-experience-empty">Nothing tagged for this mood yet — check back soon.</p>
      )}
    </div>
  );
}
