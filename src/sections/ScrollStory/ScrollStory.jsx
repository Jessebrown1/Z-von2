import { useRef } from 'react';
import { gsap, useGsapContext, ScrollTrigger, useIsMobile } from '../../hooks/animationHooks';
import './ScrollStory.css';

const FRAME_COUNT = 9;
const IMAGES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/images/scroll-story/scroll-${String(i + 1).padStart(2, '0')}.jpg`
);

/**
 * Pins the section and steps through 9 stills as the user scrolls — the
 * product floating, then worn, then the camera pushing into the embroidery.
 * Not a smooth orbit (9 frames can't fake that without looking choppy); each
 * frame is a deliberate beat that crossfades into the next, closer to a
 * cinematic lookbook than a 3D spin.
 */
export default function ScrollStory() {
  const sectionRef = useRef(null);
  const frameRefs = useRef([]);
  const dotRefs = useRef([]);
  const isMobile = useIsMobile();

  useGsapContext(
    () => {
      const frames = frameRefs.current.filter(Boolean);
      if (frames.length === 0) return;

      gsap.set(frames, { opacity: 0, scale: 1.06 });
      gsap.set(frames[0], { opacity: 1, scale: 1 });
      dotRefs.current[0]?.classList.add('is-active');

      let activeIndex = 0;
      const setFrame = (index) => {
        if (index === activeIndex) return;
        const prev = frames[activeIndex];
        const next = frames[index];
        gsap.to(prev, { opacity: 0, scale: 1.06, duration: 0.5, ease: 'power2.inOut', overwrite: true });
        gsap.to(next, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.inOut', overwrite: true });
        dotRefs.current[activeIndex]?.classList.remove('is-active');
        dotRefs.current[index]?.classList.add('is-active');
        activeIndex = index;
      };

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${window.innerHeight * (frames.length - 1) * (isMobile ? 0.7 : 1)}`,
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const index = Math.min(frames.length - 1, Math.round(self.progress * (frames.length - 1)));
          setFrame(index);
        },
      });

      return () => trigger.kill();
    },
    [isMobile],
    sectionRef
  );

  return (
    <section className="scroll-story" ref={sectionRef}>
      <div className="scroll-story-stack">
        {IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? 'ZÉVON hoodie' : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="scroll-story-frame"
            ref={(el) => (frameRefs.current[i] = el)}
          />
        ))}
        <div className="scroll-story-vignette" />
      </div>

      <div className="scroll-story-caption">
        <p className="eyebrow">Crafted, Not Manufactured</p>
        <h2 className="serif">Every stitch, considered.</h2>
      </div>

      <div className="scroll-story-dots" aria-hidden="true">
        {IMAGES.map((_, i) => (
          <span key={i} className="scroll-story-dot" ref={(el) => (dotRefs.current[i] = el)} />
        ))}
      </div>
    </section>
  );
}
