import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../utils/helpers';
import { gsap, useGsapContext, useIsMobile } from '../../hooks/animationHooks';
import './CinematicIntro.css';

const FRAME_COUNT = 90;
const framePath = (i) => `/frames/orbit/frame_${String(i + 1).padStart(3, '0')}.jpg`;

const FRAGMENT_START = [
  { x: -260, y: -160, rot: -18 },
  { x: -300, y: 220, rot: 24 },
  { x: 280, y: -200, rot: 14 },
  { x: 320, y: 180, rot: -20 },
  { x: -340, y: 20, rot: 8 },
  { x: 300, y: -40, rot: -10 },
];

const CALLOUTS = [
  { index: '01', title: 'Premium Materials', copy: 'Sourced, not settled for.', range: [0.56, 0.68] },
  { index: '02', title: 'Limited Production', copy: 'Few pieces. No repeats.', range: [0.68, 0.79] },
  { index: '03', title: 'Handcrafted Details', copy: 'Made by hand, worn with intent.', range: [0.79, 0.905] },
];

const RAIL_STEPS = [
  { label: 'Reveal', at: 0 },
  { label: 'Form', at: 0.28 },
  { label: 'Rotate', at: 0.56 },
  { label: 'Detail', at: 0.79 },
  { label: 'Shop', at: 0.9 },
];

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  top: 10 + ((i * 53) % 80),
  size: 2 + (i % 3),
  duration: 6 + (i % 5),
  delay: -(i % 6),
}));

const remap = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export default function CinematicIntro() {
  const sectionRef = useRef(null);
  const bgStudioRef = useRef(null);
  const particlesRef = useRef(null);
  const logoRef = useRef(null);
  const productWrapRef = useRef(null);
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const manifestoRef = useRef(null);
  const calloutRefs = useRef([]);
  const finaleRef = useRef(null);
  const railDotsRef = useRef([]);
  const framesRef = useRef([]);
  const frameIndexRef = useRef(-1);

  const isMobile = useIsMobile();
  const { products } = useProducts();
  const featured = products[0];

  const particles = useMemo(() => PARTICLES, []);

  // Preload the orbit frame sequence once; drawing happens as scroll progresses.
  useEffect(() => {
    framesRef.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image();
      img.src = framePath(i);
      return img;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawFrame = (index) => {
      const img = framesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(Math.max(frameIndexRef.current, 0));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    canvas.__drawFrame = drawFrame;
    return () => ro.disconnect();
  }, []);

  useGsapContext(
    () => {
      const letters = gsap.utils.toArray('.cinematic-logo span');
      const frags = gsap.utils.toArray('.cinematic-frag');

      gsap.set(frags, {
        x: (i) => FRAGMENT_START[i].x,
        y: (i) => FRAGMENT_START[i].y,
        rotate: (i) => FRAGMENT_START[i].rot,
        opacity: 0.9,
      });

      const setStudio = gsap.quickSetter(bgStudioRef.current, 'opacity');
      const setParticles = gsap.quickSetter(particlesRef.current, 'opacity');
      // quickSetter doesn't expand the 'scale' alias to scaleX/scaleY the way
      // gsap.set() does — on some WebKit builds that alias reaches
      // setAttribute('scaleX,scaleY', ...) as a literal (invalid) attribute
      // name and throws, so scaleX/scaleY are set separately here instead.
      const setProductScaleX = gsap.quickSetter(productWrapRef.current, 'scaleX');
      const setProductScaleY = gsap.quickSetter(productWrapRef.current, 'scaleY');
      const setFrameOpacity = gsap.quickSetter(frameRef.current, 'opacity');
      const setImgOpacity = gsap.quickSetter(imgRef.current, 'opacity');
      const setImgScaleX = gsap.quickSetter(imgRef.current, 'scaleX');
      const setImgScaleY = gsap.quickSetter(imgRef.current, 'scaleY');
      const setCanvasOpacity = gsap.quickSetter(canvasRef.current, 'opacity');
      const setManifesto = gsap.quickSetter(manifestoRef.current, 'opacity');
      const setManifestoY = gsap.quickSetter(manifestoRef.current, 'y', 'px');
      const setFinale = gsap.quickSetter(finaleRef.current, 'opacity');
      const setFinaleY = gsap.quickSetter(finaleRef.current, 'y', 'px');

      // Real-time entrance (plays once on load, independent of scroll): the
      // logo settles in and particles drift up to full brightness. Scroll only
      // takes over afterwards, to dissolve the logo away as Act 1 begins.
      let entranceDone = false;
      gsap.set(letters, { opacity: 0, y: 26, filter: 'blur(0px)' });
      gsap.set(particlesRef.current, { opacity: 0 });
      gsap
        .timeline({ delay: 0.3, onComplete: () => (entranceDone = true) })
        .to(particlesRef.current, { opacity: 0.85, duration: 1.2, ease: 'power2.out' })
        .to(letters, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', stagger: 0.09 }, 0.15);

      const applyProgress = (p) => {
        // Logo dissolve — only once the entrance has finished, so scroll
        // never fights the on-load reveal.
        if (entranceDone) {
          letters.forEach((_, i) => {
            const outA = i * 0.012;
            const outB = 0.14 + i * 0.012;
            const outLocal = remap(p, outA, outB);
            gsap.set(letters[i], {
              opacity: 1 - outLocal,
              y: -outLocal * 22,
              filter: `blur(${outLocal * 6}px)`,
            });
          });

          // Ambient particles: fade down as the logo dissolves, settle low, fade for finale.
          const particleOpacity =
            p < 0.16 ? gsap.utils.mapRange(0, 0.16, 0.85, 0.3, p) : p < 0.9 ? 0.3 : gsap.utils.mapRange(0.9, 1, 0.3, 0, p);
          setParticles(particleOpacity);
        }

        // Void → studio environment.
        setStudio(remap(p, 0.1, 0.34));

        // Product emerges from darkness, camera dollies in.
        const imageIn = remap(p, 0.12, 0.34);
        setImgOpacity(imageIn * (1 - remap(p, 0.54, 0.6)));
        const imgScale = 1.32 - imageIn * 0.32;
        setImgScaleX(imgScale);
        setImgScaleY(imgScale);
        const productScale = 1 + remap(p, 0.18, 0.3) * 0.12 - remap(p, 0.9, 1) * 0.07;
        setProductScaleX(productScale);
        setProductScaleY(productScale);

        // The glass stage card behind the photography — frames the (always
        // dark-backed) product shot so it reads as a deliberate card rather
        // than a floating black rectangle, especially in light mode.
        setFrameOpacity(remap(p, 0.1, 0.2) * (1 - remap(p, 0.94, 1)));

        // Manifesto line — brief brand statement between beats.
        const mIn = remap(p, 0.2, 0.26);
        const mOut = remap(p, 0.29, 0.35);
        setManifesto(mIn * (1 - mOut));
        setManifestoY((1 - mIn) * 14);

        // Assembly — fragments converge into the formed garment.
        const assembly = remap(p, 0.28, 0.56);
        frags.forEach((frag, i) => {
          const start = FRAGMENT_START[i];
          gsap.set(frag, {
            x: start.x * (1 - assembly),
            y: start.y * (1 - assembly),
            rotate: start.rot * (1 - assembly),
            opacity: 0.9 * (1 - assembly),
          });
        });

        // Crossfade the static image into the live rotation canvas.
        const canvasIn = remap(p, 0.54, 0.6);
        setCanvasOpacity(canvasIn * (1 - remap(p, 0.94, 1)));

        // Rotation — scrub the orbit frame sequence.
        const rotation = remap(p, 0.56, 0.9);
        const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(rotation * (FRAME_COUNT - 1)));
        if (frameIndex !== frameIndexRef.current && canvasRef.current?.__drawFrame) {
          frameIndexRef.current = frameIndex;
          canvasRef.current.__drawFrame(frameIndex);
        }

        // Detail callouts, one per rotation third.
        CALLOUTS.forEach((c, i) => {
          const el = calloutRefs.current[i];
          if (!el) return;
          const active = p >= c.range[0] && p < c.range[1];
          gsap.to(el, { opacity: active ? 1 : 0, y: active ? 0 : 16, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        });

        // Finale — brand line + shop CTA before releasing the pin.
        const finaleIn = remap(p, 0.9, 0.98);
        setFinale(finaleIn);
        setFinaleY((1 - finaleIn) * 22);

        // Progress rail.
        railDotsRef.current.forEach((dot, i) => {
          if (!dot) return;
          const next = RAIL_STEPS[i + 1]?.at ?? 1.001;
          const active = p >= RAIL_STEPS[i].at && p < next;
          dot.classList.toggle('is-active', active);
        });
      };

      applyProgress(0);

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: isMobile ? 0.15 : 0.35,
          onUpdate: (self) => applyProgress(self.progress),
        },
      });
    },
    [isMobile],
    sectionRef
  );

  return (
    <section id="cinematic-intro" className="section cinematic-intro" ref={sectionRef}>
      <div className="cinematic-stage">
        <div className="cinematic-bg cinematic-bg-void" />
        <div className="cinematic-bg cinematic-bg-studio" ref={bgStudioRef} />

        <div className="cinematic-particles" ref={particlesRef}>
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

        <h1 className="cinematic-logo" aria-label="ZÉVON">
          {['Z', 'É', 'V', 'O', 'N'].map((letter, i) => (
            <span key={i} className="metallic-gold-text">
              {letter}
            </span>
          ))}
        </h1>

        <p className="cinematic-manifesto serif" ref={manifestoRef}>
          Nothing loud. Everything intentional.
        </p>

        <div className="cinematic-product" ref={productWrapRef}>
          <div className="cinematic-product-frame glass" ref={frameRef} />
          <img ref={imgRef} className="cinematic-product-img" src="/hero.png" alt="ZÉVON garment" />
          <canvas ref={canvasRef} className="cinematic-product-canvas" />

          <div className="cinematic-frag frag-1" />
          <div className="cinematic-frag frag-2" />
          <div className="cinematic-frag frag-3" />
          <div className="cinematic-frag frag-4" />
          <div className="cinematic-frag frag-5" />
          <div className="cinematic-frag frag-6 label-frag serif">ZÉVON</div>
        </div>

        <div className="cinematic-callouts">
          {CALLOUTS.map((c, i) => (
            <div className="cinematic-callout glass" key={c.index} ref={(el) => (calloutRefs.current[i] = el)}>
              <span className="callout-index serif">{c.index}</span>
              <h3 className="serif">{c.title}</h3>
              <p>{c.copy}</p>
            </div>
          ))}
        </div>

        <div className="cinematic-finale" ref={finaleRef}>
          <p className="eyebrow">Construction</p>
          <h2 className="serif">
            Built in layers.
            <br />
            Worn as one.
          </h2>
          {featured && (
            <Link to={`/product/${featured.slug}`} className="btn btn--glass cinematic-cta">
              Shop the {featured.name} &mdash; {formatPrice(featured.price)}
            </Link>
          )}
        </div>

        <div className="cinematic-rail" aria-hidden="true">
          {RAIL_STEPS.map((step, i) => (
            <div className="cinematic-rail-step" key={step.label} ref={(el) => (railDotsRef.current[i] = el)}>
              <span className="cinematic-rail-dot" />
              <span className="cinematic-rail-label">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="scroll-cue">
          <span />
          <p>Scroll</p>
        </div>
      </div>
    </section>
  );
}
