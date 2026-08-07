import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../hooks/animationHooks';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductsContext';
import { useZevonAI } from '../../context/ZevonAIContext';
import { fetchStyleDna } from '../../utils/styleDnaApi';
import AIChat from './AIChat';
import './ZevonAI.css';

/**
 * Global entry point — a floating trigger present on every page, expanding
 * into the ZÉVON AI panel. Mounted once in App.jsx, inside every provider
 * it needs (auth, products, cart). Open state lives in ZevonAIContext so
 * things like the navbar search bar can open this with a starting message.
 */
export default function ZevonAI() {
  const { isOpen, setIsOpen, pendingMessage, clearPendingMessage } = useZevonAI();
  const [styleDna, setStyleDna] = useState(null);
  const { isAuthenticated } = useAuth();
  const { products, isLoading } = useProducts();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setStyleDna(null);
      return;
    }
    fetchStyleDna()
      .then(setStyleDna)
      .catch(() => setStyleDna(null));
  }, [isAuthenticated]);

  useLayoutEffect(() => {
    if (!panelRef.current) return;
    if (isOpen) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (isLoading) return null;

  return (
    <>
      <button
        type="button"
        className={`zevon-ai-trigger ${isOpen ? 'is-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open ZÉVON AI, your personal stylist"
      >
        <span className="zevon-ai-trigger-glow" aria-hidden="true" />
        <span className="zevon-ai-trigger-dot" aria-hidden="true" />
        <span>Ask ZÉVON</span>
      </button>

      {isOpen && <div className="zevon-ai-scrim" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      <div className={`zevon-ai-panel ${isOpen ? 'is-open' : ''}`} ref={panelRef} role="dialog" aria-label="ZÉVON AI">
        <div className="zevon-ai-panel-header">
          <div>
            <p className="zevon-ai-eyebrow">ZÉVON AI</p>
            <p className="zevon-ai-subtitle">Your personal stylist</p>
          </div>
          <button type="button" className="zevon-ai-close" onClick={() => setIsOpen(false)} aria-label="Close ZÉVON AI">
            &times;
          </button>
        </div>

        <AIChat
          products={products}
          styleDna={styleDna}
          isOpen={isOpen}
          pendingMessage={pendingMessage}
          onConsumePendingMessage={clearPendingMessage}
        />
      </div>
    </>
  );
}
