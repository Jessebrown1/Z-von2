import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { useProducts } from '../context/ProductsContext';
import { formatPrice } from '../utils/helpers';
import { fetchOrderHistory } from '../utils/authApi';
import './OrderHistoryPage.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const STATUS_LABELS = { pending: 'Pending', paid: 'Paid', completed: 'Completed', cancelled: 'Cancelled' };

export default function OrderHistoryPage() {
  const { getProductById } = useProducts();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderHistory()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err.message || 'Could not load your orders.'));
  }, []);

  if (error) {
    return (
      <div className="orders-page orders-page--empty">
        <h1 className="serif">Order History</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="orders-page orders-page--empty">
        <h1 className="serif">Order History</h1>
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page orders-page--empty">
        <h1 className="serif">Order History</h1>
        <p>No orders yet — your first piece is waiting.</p>
        <Button to="/collection" variant="solid">
          Shop the Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="serif">Order History</h1>

      <ul className="orders-list">
        {orders.map((order) => (
          <li className="order-card glass" key={order.reference}>
            <div className="order-card-head">
              <div>
                <p className="order-card-ref">{order.reference}</p>
                <p className="order-card-date">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`order-status order-status--${order.status}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            <ul className="order-card-items">
              {order.items.map((line) => {
                const product = getProductById(line.id);
                if (!product) return null;
                return (
                  <li key={line.id}>
                    <Link to={`/product/${product.slug}`} className="order-card-item-link">
                      <img src={product.images[0]} alt={product.name} />
                      <span>
                        {product.name} &times; {line.quantity}
                      </span>
                    </Link>
                    <span>{formatPrice(product.price * line.quantity, product.currency)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="order-card-total">
              <span>Total</span>
              <span>{formatPrice(order.amount / 100, order.currency)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
