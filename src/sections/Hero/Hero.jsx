import { useMemo, useRef } from 'react';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './Hero.css';

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  top: 10 + ((i * 53) % 80),
  size: 2 + (i % 3),
  duration: 6 + (i % 5),
  delay: -(i % 6),
}));

const LETTERS = ['Z', 'É', 'V', 'O', 'N'];

/**
 * The ZÉVON wordmark: materializes out of the drifting gold dust on load,
 * then — as the section scrolls out — comes apart letter by letter back
 * into that same dust, rather than just sliding off flat. Previously the
 * opening beat of a much longer scroll-pinned sequence (CinematicIntro);
 * that sequence is gone, but the reveal itself lives on here, reworked.
 */
export default function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const particlesRef = useRef(null);
  const manifestoRef = useRef(null);
  const bgRef = useRef(null);
  const particles = useMemo(() => PARTICLES, []);

  useGsapContext(
    () => {
      const letters = gsap.utils.toArray('.hero-logo span');

      gsap.set(letters, { opacity: 0, y: 26, scale: 1.08, filter: 'blur(14px)' });
      gsap.set(particlesRef.current, { opacity: 0 });
      gsap.set(manifestoRef.current, { opacity: 0, y: 14 });

      // Materialize in — the wordmark condenses out of the ambient dust
      // rather than just fading up flat.
      const entrance = gsap
        .timeline({ delay: 0.3 })
        .to(particlesRef.current, { opacity: 0.85, duration: 1.2, ease: 'power2.out' })
        .to(
          letters,
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out', stagger: 0.09 },
          0.15
        )
        .to(manifestoRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0.95);

      // Depth exit — the whole wordmark recedes and tilts back in 3D space
      // as the section scrolls out. Scrubbed to scroll position, no pin.
      // Safe to wire up immediately — contentRef's transform is untouched
      // by the entrance timeline above, so there's nothing to race with.
      gsap.to(contentRef.current, {
        scale: 0.82,
        y: -60,
        rotateX: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Everything below shares properties (opacity/y/scale/filter) with the
      // entrance timeline on the same elements — created immediately, GSAP's
      // default overwrite would kill the entrance tween the instant these
      // ScrollTriggers first evaluate (which happens right away, since the
      // hero fills the viewport on load and the trigger is already "active").
      // Wiring them up only once the entrance finishes avoids that fight.
      entrance.eventCallback('onComplete', () => {
        // Disintegrate — each letter scatters on its own path and dissolves
        // into blur rather than the whole wordmark fading as one flat block.
        letters.forEach((letter, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          gsap.to(letter, {
            x: dir * (26 + i * 16),
            y: -50 - i * 20,
            rotate: dir * (14 + i * 5),
            scale: 0.7,
            opacity: 0,
            filter: 'blur(16px)',
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        });

        gsap.to(manifestoRef.current, {
          y: -30,
          opacity: 0,
          filter: 'blur(8px)',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '60% top',
            scrub: true,
          },
        });

        // The dust the letters are dissolving into — it flares brighter and
        // wider right as the wordmark comes apart, then fades with the rest.
        gsap.to(particlesRef.current, {
          opacity: 0,
          scale: 1.4,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.to(bgRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '70% top',
          scrub: true,
        },
      });

      gsap.to('.scroll-cue', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '20% top',
          scrub: true,
        },
      });
    },
    [],
    sectionRef
  );

  return (
    <section id="hero" className="section hero" ref={sectionRef}>
      <div className="hero-bg" ref={bgRef} />

      <div className="hero-particles" ref={particlesRef}>
        {particles.map((particle, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-content" ref={contentRef}>
        <h1 className="hero-logo" aria-label="ZÉVON">
          {LETTERS.map((letter, i) => (
            <span key={i} className="metallic-gold-text">
              {letter}
            </span>
          ))}
        </h1>

        <p className="hero-manifesto serif" ref={manifestoRef}>
          Nothing loud. Everything intentional.
        </p>
      </div>

      <div className="scroll-cue">
        <span />
        <p>Scroll</p>
      </div>
    </section>
  );
}
