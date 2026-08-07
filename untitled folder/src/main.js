import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ---------- Lenis smooth scroll ---------- */
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ---------- Hero frame-sequence preload ---------- */
const FRAME_COUNT = 90;
const framePaths = Array.from({ length: FRAME_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(3, '0');
  return `/frames/orbit/frame_${n}.jpg`;
});

const images = new Array(FRAME_COUNT);
const preloaderFill = document.querySelector('.preloader-bar-fill');
const preloader = document.getElementById('preloader');

let loadedCount = 0;
function updateProgress() {
  loadedCount++;
  const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
  if (preloaderFill) preloaderFill.style.width = pct + '%';
  if (loadedCount === FRAME_COUNT) onAllLoaded();
}

function loadImages() {
  return new Promise((resolve) => {
    framePaths.forEach((src, i) => {
      const img = new Image();
      img.onload = () => { updateProgress(); checkDone(); };
      img.onerror = () => { updateProgress(); checkDone(); };
      img.src = src;
      images[i] = img;
    });
    function checkDone() {
      if (loadedCount >= FRAME_COUNT) resolve();
    }
  });
}

/* ---------- Hero canvas render ---------- */
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let frameIndex = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || window.innerWidth;
  const h = rect.height || window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(frameIndex);
}

function drawFrame(index) {
  const img = images[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function onAllLoaded() {
  gsap.to(preloader, {
    opacity: 0,
    duration: 0.9,
    delay: 0.2,
    onComplete: () => preloader.classList.add('hidden'),
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizeCanvas();
      drawFrame(0);
    });
  });
  initHeroTimeline();
  initAllScrollTriggers();
  ScrollTrigger.refresh();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

/* ---------- Hero pinned scroll-scrub ---------- */
function initHeroTimeline() {
  const frameProxy = { frame: 0 };

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '+=180%',
    pin: true,
    scrub: 0.4,
    onUpdate: (self) => {
      const idx = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * (FRAME_COUNT - 1)));
      if (idx !== frameProxy.frame) {
        frameProxy.frame = idx;
        frameIndex = idx;
        drawFrame(idx);
      }
    },
  });

  // brand mark tracking-in + subtitle + scroll cue
  const tl = gsap.timeline({ delay: 0.4 });
  tl.to('.hero-mark span', {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.07,
  })
    .to('.hero-sub', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.5')
    .to('.scroll-cue', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4');

  // fade hero text + cue out as user starts scrolling into the pin
  gsap.to(['.hero-content', '.scroll-cue'], {
    opacity: 0,
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '35% top',
      scrub: true,
    },
  });
}

/* ---------- Story section: line-by-line reveal ---------- */
function initStory() {
  const line = document.querySelector('.story-line');
  gsap.from('.story-eyebrow', {
    opacity: 0,
    y: 16,
    duration: 0.8,
    scrollTrigger: { trigger: '#story', start: 'top 60%' },
  });
  gsap.fromTo(
    line,
    { opacity: 0.15 },
    {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#story',
        start: 'top 70%',
        end: 'center center',
        scrub: true,
      },
    }
  );
  gsap.fromTo(
    line,
    { letterSpacing: '0.02em' },
    {
      letterSpacing: '0em',
      scrollTrigger: {
        trigger: '#story',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

/* ---------- Macro video: scroll-scrub currentTime + callouts ---------- */
function initMacro() {
  const video = document.getElementById('macro-video');
  const callouts = gsap.utils.toArray('.callout');

  const setVideoTime = (progress) => {
    if (!isFinite(video.duration) || video.duration === 0) return;
    video.currentTime = progress * video.duration;
  };

  const ready = () => {
    ScrollTrigger.create({
      trigger: '#macro',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (self) => setVideoTime(self.progress),
    });

    callouts.forEach((el) => {
      const [start, end] = el.dataset.range.split(',').map(Number);
      ScrollTrigger.create({
        trigger: '#macro',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const inRange = self.progress >= start && self.progress <= end;
          gsap.to(el, { opacity: inRange ? 1 : 0, y: inRange ? 0 : 16, duration: 0.4, overwrite: 'auto' });
        },
      });
    });
  };

  if (video.readyState >= 1) ready();
  else video.addEventListener('loadedmetadata', ready, { once: true });
}

/* ---------- Craft: sequential feature callouts ---------- */
function initCraft() {
  gsap.to('.craft-eyebrow', {
    opacity: 1,
    duration: 0.8,
    scrollTrigger: { trigger: '#craft', start: 'top 70%' },
  });
  gsap.to('.craft-bg', {
    scale: 1,
    scrollTrigger: {
      trigger: '#craft',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  const items = gsap.utils.toArray('.craft-item');
  const step = 1 / items.length;
  items.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: '#craft',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const active = self.progress >= i * step && self.progress < (i + 1) * step + (i === items.length - 1 ? 1 : 0);
        item.classList.toggle('is-active', active);
      },
    });
  });
}

/* ---------- Exploded assembly ---------- */
function initAssembly() {
  const frags = gsap.utils.toArray('.assembly-frag');
  const startPositions = [
    { x: -260, y: -160, rot: -18 },
    { x: -300, y: 220, rot: 24 },
    { x: 280, y: -200, rot: 14 },
    { x: 320, y: 180, rot: -20 },
    { x: -340, y: 20, rot: 8 },
    { x: 300, y: -40, rot: -10 },
  ];

  gsap.set(frags, {
    x: (i) => startPositions[i].x,
    y: (i) => startPositions[i].y,
    rotate: (i) => startPositions[i].rot,
    opacity: 0.9,
  });

  gsap.set('.assembly-final', { opacity: 0, scale: 0.94 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#assembly',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
    },
  });

  tl.to(frags, {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 0,
    ease: 'none',
    stagger: 0.03,
  }, 0)
    .to('.assembly-final', { opacity: 1, scale: 1, ease: 'none' }, 0)
    .to('.assembly-eyebrow', { opacity: 1, ease: 'none' }, 0.15)
    .to('.assembly-text h2', { opacity: 1, ease: 'none' }, 0.3);
}

/* ---------- Edition counter ---------- */
function initEdition() {
  const numEl = document.getElementById('edition-num');
  const counter = { val: 1 };
  gsap.to(counter, {
    val: 500,
    duration: 1.4,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#edition', start: 'top 65%' },
    onUpdate: () => {
      numEl.textContent = String(Math.floor(counter.val)).padStart(3, '0');
    },
  });
  gsap.from('#edition .edition-eyebrow, #edition h2, #edition .edition-count', {
    opacity: 0,
    y: 24,
    stagger: 0.12,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#edition', start: 'top 70%' },
  });
}

/* ---------- CTA reveal ---------- */
function initCTA() {
  gsap.from('.cta-eyebrow, .cta-inner h2, .cta-button', {
    opacity: 0,
    y: 30,
    stagger: 0.12,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#cta', start: 'top 65%' },
  });
  gsap.from('.site-footer', {
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: '#cta', start: 'top 40%' },
  });
}

function initAllScrollTriggers() {
  initStory();
  initMacro();
  initCraft();
  initAssembly();
  initEdition();
  initCTA();
}

/* ---------- Boot ---------- */
loadImages();
resizeCanvas();
