import { useRef } from 'react';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './ScrollStory.css';

const FRAME_COUNT = 9;
const IMAGES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/images/scroll-story/scroll-${String(i + 1).padStart(2, '0')}.png`
);
const ROWS = [IMAGES.slice(0, 3), IMAGES.slice(3, 6), IMAGES.slice(6, 9)];

/**
 * The product cutouts (transparent PNGs — no baked-in backdrop) sit directly
 * on the section's own background, so they pick up var(--bg-primary) same
 * as everything else: dark in dark mode, light in light mode, no separate
 * theming needed. Each tile tilts and rises into place as it scrolls
 * through view — scrubbed to scroll position like Hero/EditorialParallax,
 * not pinned, so the page never scroll-jacks.
 */
export default function ScrollStory() {
  const sectionRef = useRef(null);

  useGsapContext(
    () => {
      gsap.from('.scroll-story-heading > *', {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });

      gsap.utils.toArray('.scroll-story-row').forEach((row, rowIndex) => {
        const tiles = row.querySelectorAll('.scroll-story-tile');
        gsap.fromTo(
          tiles,
          { opacity: 0, y: 60, rotateX: 18, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            ease: 'power2.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: row,
              start: 'top 88%',
              end: 'top 45%',
              scrub: 0.6,
            },
          }
        );

        // Depth drift while the row is in view — alternates direction per
        // row so the sequence doesn't feel mechanically repetitive.
        const direction = rowIndex % 2 === 0 ? 1 : -1;
        gsap.to(row, {
          yPercent: 6 * direction,
          ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    },
    [],
    sectionRef
  );

  return (
    <section className="scroll-story" ref={sectionRef}>
      <div className="scroll-story-heading">
        <p className="eyebrow">Crafted, Not Manufactured</p>
        <h2 className="serif">Every stitch, considered.</h2>
      </div>

      {ROWS.map((row, rowIndex) => (
        <div className="scroll-story-row" key={rowIndex}>
          {row.map((src) => (
            <div className="scroll-story-tile" key={src}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
