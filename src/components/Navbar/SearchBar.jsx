import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { useZevonAI } from '../../context/ZevonAIContext';
import { searchProducts } from '../ZevonAI/aiEngine';
import { formatPrice } from '../../utils/helpers';

/** Understands both plain keywords ("hoodie") and natural language ("black oversized hoodie for a night out"), same scoring engine as ZÉVON AI. */
export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const { openWithMessage } = useZevonAI();
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const results = query.trim() ? searchProducts(query, products, 5) : [];

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleAskAI = () => {
    const message = query.trim();
    setIsOpen(false);
    setQuery('');
    openWithMessage(message);
  };

  return (
    <div className="navbar-search" ref={rootRef}>
      <button
        type="button"
        className="navbar-search-btn"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Search"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>

      <div className={`navbar-search-panel glass ${isOpen ? 'is-open' : ''}`}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Looking for something specific?"
          aria-label="Search products"
        />

        {query.trim() && (
          <div className="navbar-search-results">
            {results.length > 0 ? (
              results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="navbar-search-result"
                  onClick={() => setIsOpen(false)}
                >
                  <img src={product.images?.[0]} alt={product.name} />
                  <div>
                    <p>{product.name}</p>
                    <span>{formatPrice(product.price, product.currency)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="navbar-search-empty">Nothing matches that exactly.</p>
            )}

            <button type="button" className="navbar-search-ask-ai" onClick={handleAskAI}>
              <span className="navbar-search-ask-ai-label">Ask ZÉVON</span>
              <span className="navbar-search-ask-ai-query">"{query}"</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
