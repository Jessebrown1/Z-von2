import { Link } from 'react-router-dom';
import CartLineItem from '../components/Cart/CartLineItem';
import { Button } from '../components/UI';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import './CartPage.css';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page cart-page--empty">
        <h1 className="serif">Your Cart is Empty</h1>
        <p>Nothing here yet. Explore the collection to find your first piece.</p>
        <Button to="/collection" variant="solid">
          Shop the Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="serif">Shopping Cart</h1>

      <div className="cart-page-layout">
        <div className="cart-page-items">
          {items.map((item) => (
            <CartLineItem key={item.key} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          ))}
        </div>

        <aside className="cart-page-summary">
          <div className="cart-page-subtotal">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="cart-page-note">Shipping and taxes calculated at checkout.</p>
          <Button to="/checkout" variant="solid" className="cart-page-checkout">
            Proceed to Checkout
          </Button>
          <Link to="/collection" className="cart-page-continue">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
