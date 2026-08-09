import { useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const introRef = useRef(null);
  const { products } = useProducts();
  const items = products.slice(0, 4);

  useGsapContext(
    () => {
      gsap.from('.editorial-parallax-reveal', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: introRef.current, start: 'top 75%' },
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
      <div className="editorial-parallax-text" ref={introRef}>
        <p className="eyebrow editorial-parallax-reveal">No. 001</p>
        <h2 className="serif editorial-parallax-reveal">
          Cut once.
          <br />
          Never repeated.
        </h2>
        <p className="editorial-parallax-copy editorial-parallax-reveal">
          Small batches, hand-finished, numbered for the one person who'll wear it. ZÉVON doesn't
          restock — when a drop is gone, it's gone.
        </p>
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
