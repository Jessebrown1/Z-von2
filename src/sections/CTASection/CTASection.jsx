import { useRef } from 'react';
import { Button } from '../../components/UI';
import { gsap, useGsapContext } from '../../hooks/animationHooks';
import './CTASection.css';

export default function CTASection() {
  const sectionRef = useRef(null);
  const numRef = useRef(null);

  useGsapContext(
    () => {
      const counter = { val: 1 };
      gsap.to(counter, {
        val: 500,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.edition', start: 'top 65%' },
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = String(Math.floor(counter.val)).padStart(3, '0');
        },
      });

      gsap.from('.edition-eyebrow, .edition-content h2, .edition-count', {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.edition', start: 'top 70%' },
      });

      gsap.from('.cta-eyebrow, .cta-inner h2, .cta-inner .btn', {
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.cta', start: 'top 65%' },
      });
    },
    [],
    sectionRef
  );

  return (
    <section id="cta-section" className="section cta-section" ref={sectionRef}>
      <div className="edition">
        <div className="edition-image">
          <img src="/hero.png" alt="ZÉVON limited edition piece" />
        </div>
        <div className="edition-content">
          <div className="edition-panel glass">
            <p className="edition-eyebrow eyebrow">Limited Edition</p>
            <h2 className="serif">
              The Fearless
              <br />
              Collection.
            </h2>
            <p className="edition-count">
              <span ref={numRef}>001</span> / 500
            </p>
          </div>
        </div>
      </div>

      <div className="cta">
        <div className="cta-inner glass">
          <p className="cta-eyebrow eyebrow">By Invitation</p>
          <h2 className="serif">
            Enter the
            <br />
            Collection.
          </h2>
          <Button to="/collection" variant="glass">
            Shop the Collection
          </Button>
        </div>
      </div>
    </section>
  );
}
