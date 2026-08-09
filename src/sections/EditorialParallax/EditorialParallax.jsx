import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/UI';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../utils/helpers';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './EditorialParallax.css';

/**
 * A genuine 3D scroll, not a flat parallax: each piece rotates in out of
 * perspective space, settles flat as it crosses center, then rotates back
 * out the far side as you keep scrolling. No pin — every card moves within
 * normal document flow, driven entirely by scrub'd scroll position.
 */
export default function EditorialParallax() {
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const { products } = useProducts();
  const items = products.slice(0, 4);
  const spotlight = items.find((p) => p.isLimited) || items[0];

  useGsapContext(
    () => {
      // The whole image+text moment fades and rises in as it enters view,
      // then fades and rises back out as you scroll past it — it's a beat,
      // not a static block that just sits there once revealed.
      gsap.fromTo(
        '.editorial-hero-reveal',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          stagger: 0.06,
          scrollTrigger: { trigger: heroRef.current, start: 'top 88%', end: 'top 55%', scrub: true },
        }
      );

      gsap.to('.editorial-hero-reveal', {
        opacity: 0,
        y: -44,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: { trigger: heroRef.current, start: 'top 25%', end: 'top -25%', scrub: true },
      });

      gsap.to('.editorial-hero-bg', {
        yPercent: 12,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.utils.toArray('.editorial-3d-card').forEach((card, i) => {
        const fromSide = i % 2 === 0 ? 1 : -1;

        // Rotate in from perspective, settle flat as the card nears center.
        gsap.fromTo(
          card,
          { rotateY: fromSide * 55, z: -260, opacity: 0.25, scale: 0.86 },
          {
            rotateY: 0,
            z: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 42%', scrub: true },
          }
        );

        // Then tumble back out the opposite side as it exits.
        gsap.to(card, {
          rotateY: fromSide * -55,
          z: -260,
          opacity: 0.25,
          scale: 0.86,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top 38%', end: 'top -25%', scrub: true },
        });
      });
    },
    [items.length],
    sectionRef
  );

  return (
    <section className="section editorial-parallax" ref={sectionRef}>
      <div className="editorial-hero" ref={heroRef}>
        {spotlight && (
          <div
            className="editorial-hero-bg"
            style={{ backgroundImage: `url(${spotlight.images[0]})` }}
            aria-hidden="true"
          />
        )}
        <div className="editorial-hero-overlay" aria-hidden="true" />

        <div className="editorial-hero-content">
          <p className="eyebrow editorial-hero-reveal">No. 001</p>
          <h2 className="serif editorial-hero-reveal">
            Cut once.
            <br />
            Never repeated.
          </h2>
          <p className="editorial-hero-copy editorial-hero-reveal">
            Small batches, hand-finished, numbered for the one person who'll wear it. ZÉVON doesn't
            restock — when a drop is gone, it's gone.
          </p>

          {spotlight && (
            <div className="editorial-hero-spotlight glass editorial-hero-reveal">
              <Link to={`/product/${spotlight.slug}`} className="editorial-hero-spotlight-media">
                <img src={spotlight.images[0]} alt={spotlight.name} />
              </Link>
              <div className="editorial-hero-spotlight-info">
                <p className="serif">{spotlight.name}</p>
                <p>{formatPrice(spotlight.price, spotlight.currency)}</p>
                <Button to={`/product/${spotlight.slug}`} variant="glass" className="editorial-hero-cta">
                  Shop Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="editorial-3d-stack">
        {items.map((product) => (
          <Link to={`/product/${product.slug}`} key={product.id} className="editorial-3d-card">
            <div className="editorial-3d-card-media">
              <img src={product.images[0]} alt={product.name} />
            </div>
            <div className="editorial-3d-card-caption">
              <p className="serif">{product.name}</p>
              <p>{formatPrice(product.price, product.currency)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
