import { formatPrice } from '../../utils/helpers';
import './OrderSummary.css';

// Kept in sync with the same constants in server/src/routes/payments.js,
// which is the authoritative total actually charged — this is display-only.
const SHIPPING_FLAT_RATE = 270;
const TAX_RATE = 0.08;

export function calculateTotals(subtotal) {
  const shipping = subtotal > 0 ? SHIPPING_FLAT_RATE : 0;
  const tax = subtotal * TAX_RATE;
  return { shipping, tax, total: subtotal + shipping + tax };
}

export default function OrderSummary({ items, subtotal }) {
  const { shipping, tax, total } = calculateTotals(subtotal);

  return (
    <aside className="order-summary">
      <h3>Order Summary</h3>

      <ul className="order-summary-items">
        {items.map((item) => (
          <li key={item.key}>
            <div className="order-summary-thumb">
              <img src={item.image} alt={item.name} />
              <span>{item.quantity}</span>
            </div>
            <div className="order-summary-item-info">
              <p>{item.name}</p>
              <p>
                {item.color} &middot; {item.size}
              </p>
            </div>
            <p className="order-summary-item-price">{formatPrice(item.price * item.quantity, item.currency)}</p>
          </li>
        ))}
      </ul>

      <div className="order-summary-totals">
        <div>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div>
          <span>Shipping</span>
          <span>{formatPrice(shipping)}</span>
        </div>
        <div>
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="order-summary-total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </aside>
  );
}
