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

/**
 * The ZÉVON wordmark reveal — plays once on load, then scrolls away with
 * the rest of the page like any other section. Previously the opening beat
 * of a much longer scroll-pinned sequence (CinematicIntro); that sequence
 * is gone, but the reveal itself — the part actually being kept — lives on
 * here unchanged.
 */
export default function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const particlesRef = useRef(null);
  const manifestoRef = useRef(null);
  const particles = useMemo(() => PARTICLES, []);

  useGsapContext(
    () => {
      const letters = gsap.utils.toArray('.hero-logo span');

      gsap.set(letters, { opacity: 0, y: 26 });
      gsap.set(particlesRef.current, { opacity: 0 });
      gsap.set(manifestoRef.current, { opacity: 0, y: 14 });

      gsap
        .timeline({ delay: 0.3 })
        .to(particlesRef.current, { opacity: 0.85, duration: 1.2, ease: 'power2.out' })
        .to(letters, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', stagger: 0.09 }, 0.15)
        .to(manifestoRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0.9);

      // Depth exit — as the hero scrolls out, the wordmark recedes and
      // tilts back in 3D space instead of just sliding off flat. Scrubbed
      // to scroll position, no pin: the section still scrolls normally.
      gsap.to(contentRef.current, {
        scale: 0.82,
        y: -60,
        rotateX: 14,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(particlesRef.current, {
        opacity: 0,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    [],
    sectionRef
  );

  return (
    <section id="hero" className="section hero" ref={sectionRef}>
      <div className="hero-bg" />

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
          {['Z', 'É', 'V', 'O', 'N'].map((letter, i) => (
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
