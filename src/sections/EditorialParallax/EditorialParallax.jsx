import { useRef } from 'react';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './EditorialParallax.css';

/**
 * Replaces the old scroll-scrubbed orbit-frame "video" with something far
 * lighter: a single image drifting at a different rate than the page
 * (classic editorial parallax) behind a line of brand copy that fades in
 * as it enters view. No pinning, no per-frame canvas drawing — one tween.
 */
export default function EditorialParallax() {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);

  useGsapContext(
    () => {
      gsap.to(imgRef.current, {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.from('.editorial-parallax-text > *', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      });
    },
    [],
    sectionRef
  );

  return (
    <section className="section editorial-parallax" ref={sectionRef}>
      <div className="editorial-parallax-media">
        <img ref={imgRef} src="/hero.png" alt="" className="editorial-parallax-img" />
        <div className="editorial-parallax-overlay" />
      </div>

      <div className="editorial-parallax-text">
        <p className="eyebrow">No. 001</p>
        <h2 className="serif">
          Every piece is deliberate.
          <br />
          Nothing is accidental.
        </h2>
        <p className="editorial-parallax-copy">
          Cut in small batches, finished by hand, numbered for the one person who'll wear it —
          this isn't fast fashion dressed up. It's the alternative to it.
        </p>
      </div>
    </section>
  );
}
