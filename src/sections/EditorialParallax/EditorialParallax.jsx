import { useRef } from 'react';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './EditorialParallax.css';

/**
 * The heading isn't printed over the photo — the photo IS the heading. The
 * type is a mask (background-clip: text) with the same image showing
 * through it, panning slowly as you scroll. One image, no separate
 * full-bleed background layer, no overlay gradient to fight for contrast.
 */
export default function EditorialParallax() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const textRef = useRef(null);

  useGsapContext(
    () => {
      // The image panning inside the letterforms — the "camera move" that
      // makes the mask feel alive instead of a static cutout.
      gsap.to(headingRef.current, {
        backgroundPosition: '0% 0%, 30% 70%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(textRef.current, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.from('.editorial-parallax-reveal', {
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
      <div className="editorial-parallax-text" ref={textRef}>
        <p className="eyebrow editorial-parallax-reveal">No. 001</p>
        <h2 className="serif editorial-parallax-heading editorial-parallax-reveal" ref={headingRef}>
          Cut once.
          <br />
          Never repeated.
        </h2>
        <p className="editorial-parallax-copy editorial-parallax-reveal">
          Small batches, hand-finished, numbered for the one person who'll wear it. ZÉVON doesn't
          restock — when a drop is gone, it's gone.
        </p>
      </div>
    </section>
  );
}
