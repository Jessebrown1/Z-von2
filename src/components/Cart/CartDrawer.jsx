import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import CartLineItem from './CartLineItem';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div className={`cart-drawer-root ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="cart-drawer-backdrop" onClick={onClose} />

      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <header className="cart-drawer-header">
          <h2>Cart {items.length > 0 && <span>({items.length})</span>}</h2>
          <button type="button" className="cart-drawer-close" onClick={onClose} aria-label="Close cart">
            &times;
          </button>
        </header>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <p className="cart-drawer-empty">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <CartLineItem
                key={item.key}
                item={item}
                compact
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="cart-drawer-subtotal">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link to="/cart" className="cart-drawer-btn cart-drawer-btn--outline" onClick={onClose}>
              View Cart
            </Link>
            <Link to="/checkout" className="cart-drawer-btn cart-drawer-btn--solid" onClick={onClose}>
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
