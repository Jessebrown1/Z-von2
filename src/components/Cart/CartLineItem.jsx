import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/helpers';
import './CartLineItem.css';

export default function CartLineItem({ item, onUpdateQuantity, onRemove, compact = false }) {
  return (
    <div className={`cart-line ${compact ? 'cart-line--compact' : ''}`}>
      <Link to={`/product/${item.slug}`} className="cart-line-image">
        <img src={item.image} alt={item.name} />
      </Link>

      <div className="cart-line-info">
        <Link to={`/product/${item.slug}`} className="cart-line-name">
          {item.name}
        </Link>
        <p className="cart-line-variant">
          {item.color} &middot; {item.size}
        </p>
        <p className="cart-line-price">{formatPrice(item.price, item.currency)}</p>

        <div className="cart-line-controls">
          <div className="cart-line-qty" role="group" aria-label={`Quantity for ${item.name}`}>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span>{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button type="button" className="cart-line-remove" onClick={() => onRemove(item.key)}>
            Remove
          </button>
        </div>
      </div>

      <p className="cart-line-total">{formatPrice(item.price * item.quantity, item.currency)}</p>
    </div>
  );
}
