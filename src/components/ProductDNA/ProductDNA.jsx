import { useRef } from 'react';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import DNAMetric from './DNAMetric';
import './ProductDNA.css';

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function explainWeight(gsm, silhouette) {
  if (!gsm) return null;
  const tier = gsm >= 400 ? 'Heavyweight' : gsm >= 250 ? 'Midweight' : 'Lightweight';
  const silhouetteLabel = silhouette ? capitalize(silhouette).toLowerCase() : 'considered';
  return `${gsm} GSM — ${tier.toLowerCase()} construction designed for a ${silhouetteLabel} silhouette.`;
}

/** Presents a product's material/fit/production facts as "DNA" rather than a spec sheet — scroll-revealed, one field at a time. */
export default function ProductDNA({ product }) {
  const sectionRef = useRef(null);

  // Fit/silhouette describe how a garment sits on a body — meaningless for a
  // ring or a tote, so they're a garment-only concept, not a general one.
  const isAccessory = product.category === 'Accessories';

  const metrics = [
    { label: 'Material', value: product.details?.[0] },
    { label: 'Weight', value: product.weightGsm ? `${product.weightGsm} GSM` : null },
    !isAccessory && { label: 'Fit', value: capitalize(product.fit) },
    !isAccessory && { label: 'Silhouette', value: capitalize(product.silhouette) },
    { label: 'Color', value: product.colors?.[0] },
    { label: 'Drop', value: String(product.dropNumber || 1).padStart(3, '0') },
    { label: 'Production', value: product.editionSize ? `${product.editionSize} pieces` : 'Open production' },
  ].filter((metric) => metric && metric.value);

  const weightExplainer = explainWeight(product.weightGsm, product.silhouette);

  useGsapContext(
    () => {
      gsap.from('.dna-metric', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.dna-metric-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.product-dna-callout', {
        opacity: 0,
        y: 16,
        duration: 0.6,
        delay: 0.3,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    },
    [product.id],
    sectionRef
  );

  if (metrics.length === 0) return null;

  return (
    <section className="product-dna" ref={sectionRef}>
      <div className="product-dna-header">
        <p className="eyebrow">Product DNA</p>
        <p className="product-dna-code">ZÉVON / {String(product.dropNumber || 1).padStart(3, '0')}</p>
      </div>

      <div className="dna-metrics-grid">
        {metrics.map((metric) => (
          <DNAMetric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      {weightExplainer && (
        <div className="product-dna-callout">
          <p>{weightExplainer}</p>
        </div>
      )}
    </section>
  );
}
