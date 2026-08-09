import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './FeaturedCarousel.css';

/**
 * Replaces the old editorial-block + product-grid pair with one section: a
 * horizontal, scroll-snapped carousel of the catalog's leads. Luxury sites
 * rarely show a dense grid on the homepage — a handful of pieces, one at a
 * time, reads considered rather than "browse everything."
 */
export default function FeaturedCarousel() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const { products } = useProducts();
  const featured = products.slice(0, 6);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft >= max - 4);
    if (progressRef.current) {
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      progressRef.current.style.transform = `scaleX(${Math.max(0.06, ratio)})`;
    }
  }, []);

  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.featured-carousel-item');
    const amount = card ? card.getBoundingClientRect().width + 24 : 360;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  useGsapContext(
    () => {
      if (featured.length === 0) return;

      gsap.from('.featured-carousel-head > *', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });

      gsap.from('.featured-carousel-item', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.featured-carousel-track', start: 'top 85%' },
      });
    },
    [featured.length],
    sectionRef
  );

  if (featured.length === 0) return null;

  return (
    <section className="section featured-carousel" ref={sectionRef}>
      <div className="featured-carousel-head">
        <div>
          <p className="eyebrow">No. 001 — The Edit</p>
          <h2 className="serif">Cut once. Never repeated.</h2>
        </div>

        <div className="featured-carousel-controls">
          <Link to="/collection" className="featured-carousel-viewall">
            View All &rarr;
          </Link>
          <div className="featured-carousel-arrows">
            <button
              type="button"
              aria-label="Previous"
              disabled={atStart}
              onClick={() => scrollByCard(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" aria-label="Next" disabled={atEnd} onClick={() => scrollByCard(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="featured-carousel-track" ref={trackRef} onScroll={updateEdges}>
        {featured.map((product) => (
          <div className="featured-carousel-item" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="featured-carousel-progress">
        <div className="featured-carousel-progress-fill" ref={progressRef} />
      </div>
    </section>
  );
}
