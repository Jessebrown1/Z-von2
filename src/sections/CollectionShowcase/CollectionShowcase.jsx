import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './CollectionShowcase.css';

export default function CollectionShowcase() {
  const sectionRef = useRef(null);
  const { products } = useProducts();
  const featured = products.slice(0, 4);

  useGsapContext(
    () => {
      if (featured.length === 0) return;

      gsap.from('.collection-showcase-head > *', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });

      gsap.from('.collection-showcase-grid .product-card', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.collection-showcase-grid', start: 'top 85%' },
      });
    },
    // Products load async — re-run once real cards exist so ScrollTrigger
    // actually has elements to attach to (see useGsapContext's cleanup for
    // why this is safe to re-run: it reverts the previous pass first).
    [featured.length],
    sectionRef
  );

  return (
    <section id="collection-showcase" className="section collection-showcase" ref={sectionRef}>
      <div className="collection-showcase-head">
        <p className="eyebrow">No. 001 &mdash; Fearless Collection</p>
        <h2 className="serif">Shop the Drop.</h2>
      </div>

      <div className="collection-showcase-grid">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Link to="/collection" className="collection-showcase-link">
        View Full Collection &rarr;
      </Link>
    </section>
  );
}
