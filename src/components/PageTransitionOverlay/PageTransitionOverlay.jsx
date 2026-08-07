import { useEffect, useRef } from 'react';
import { gsap } from '../../hooks/animationHooks';
import './PageTransitionOverlay.css';

let overlayEl = null;
let sheenEl = null;

/**
 * Plays the liquid-glass shutter used for route changes and theme swaps:
 * the pane blurs in, a gold sheen sweeps across, `onCovered` runs while the
 * screen is fully hidden, then the pane clears. Falls back to calling
 * `onCovered` immediately if the overlay hasn't mounted yet.
 *
 * Pass `{ quick: true }` for lighter-weight swaps (e.g. the theme toggle)
 * where the full route-change timing would feel sluggish.
 */
export function runTransition(onCovered, { quick = false } = {}) {
  if (!overlayEl) {
    onCovered?.();
    return;
  }

  const scale = quick ? 0.55 : 1;
  const tl = gsap.timeline();
  tl.set(overlayEl, { pointerEvents: 'auto' })
    .to(overlayEl, { opacity: 1, duration: 0.36 * scale, ease: 'power2.inOut' })
    .fromTo(sheenEl, { xPercent: -130 }, { xPercent: 130, duration: 0.65 * scale, ease: 'power2.inOut' }, '<')
    .call(() => onCovered?.())
    .to(overlayEl, { opacity: 0, duration: 0.5 * scale, ease: 'power2.out', delay: 0.08 * scale })
    .set(overlayEl, { pointerEvents: 'none' });
}

export default function PageTransitionOverlay() {
  const ref = useRef(null);
  const sheenRef = useRef(null);

  useEffect(() => {
    overlayEl = ref.current;
    sheenEl = sheenRef.current;
    return () => {
      overlayEl = null;
      sheenEl = null;
    };
  }, []);

  return (
    <div className="page-transition-overlay glass" ref={ref} aria-hidden="true">
      <div className="page-transition-sheen" ref={sheenRef} />
    </div>
  );
}
