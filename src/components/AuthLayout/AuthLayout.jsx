import { useMemo, useRef } from 'react';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './AuthLayout.css';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: 4 + ((i * 37) % 92),
  top: 6 + ((i * 53) % 90),
  size: 2 + (i % 3),
  duration: 6 + (i % 5),
  delay: -(i % 6),
}));

/**
 * Shared cinematic shell for /login and /signup: a full-height split screen —
 * a brand panel with drifting gold particles and the shimmering ZÉVON
 * wordmark on one side, the form on the other — rather than a small card
 * floating alone on an empty page.
 */
export default function AuthLayout({ eyebrow, title, children }) {
  const sectionRef = useRef(null);
  const particlesRef = useRef(null);
  const cardRef = useRef(null);
  const particles = useMemo(() => PARTICLES, []);

  useGsapContext(
    () => {
      const letters = gsap.utils.toArray('.auth-wordmark span');

      gsap.set(letters, { opacity: 0, y: 26, filter: 'blur(6px)' });
      gsap.set(particlesRef.current, { opacity: 0 });
      gsap.set('.auth-brand-tagline', { opacity: 0, y: 12 });
      gsap.set('.auth-frag', { opacity: 0 });
      gsap.set(cardRef.current, { opacity: 0, y: 24 });
      gsap.set('.auth-card > *', { opacity: 0, y: 12 });

      gsap
        .timeline({ delay: 0.15 })
        .to(particlesRef.current, { opacity: 0.6, duration: 1.3, ease: 'power2.out' })
        .to(
          letters,
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.06 },
          '-=1.05'
        )
        .to('.auth-frag', { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08 }, '-=0.9')
        .to('.auth-brand-tagline', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
        .to(cardRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.7')
        .to('.auth-card > *', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08 }, '-=0.4');
    },
    [],
    sectionRef
  );

  return (
    <div className="auth-page" ref={sectionRef}>
      <div className="auth-brand-panel">
        <div className="auth-particles" ref={particlesRef}>
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

        <span className="auth-frag auth-frag-1" aria-hidden="true" />
        <span className="auth-frag auth-frag-2" aria-hidden="true" />
        <span className="auth-frag auth-frag-3 metallic-gold-text" aria-hidden="true">
          No. 001
        </span>

        <div className="auth-brand-content">
          <h1 className="auth-wordmark" aria-label="ZÉVON">
            {['Z', 'É', 'V', 'O', 'N'].map((letter, i) => (
              <span key={i} className="metallic-gold-text">
                {letter}
              </span>
            ))}
          </h1>
          <p className="auth-brand-tagline">Crafted for the fearless.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card" ref={cardRef}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="serif">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
