import { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../utils/helpers';
import { fetchAllOrders, setOrderStatus } from '../../utils/adminApi';
import './AdminOrders.css';

const STATUS_LABELS = { pending: 'Pending', paid: 'Paid', completed: 'Completed', cancelled: 'Cancelled' };

// What an order can move to next, from its current status.
const NEXT_STATUS = { paid: 'completed', completed: null, pending: null, cancelled: null };

// Orders in these statuses can still be cancelled from the dashboard.
const CANCELLABLE_STATUSES = new Set(['pending', 'paid']);

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminOrders() {
  const { getProductById } = useProducts();
  const [orders, setOrders] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [updatingRef, setUpdatingRef] = useState(null);

  const load = () => {
    setLoadError(null);
    fetchAllOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setLoadError(err.message || 'Could not load orders.'));
  };

  useEffect(load, []);

  const handleAdvance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdatingRef(order.reference);
    setActionError(null);
    try {
      await setOrderStatus(order.reference, next);
      load();
    } catch (err) {
      setActionError(err.message || 'Could not update order status.');
    } finally {
      setUpdatingRef(null);
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.reference}? This can't be undone.`)) return;
    setUpdatingRef(order.reference);
    setActionError(null);
    try {
      await setOrderStatus(order.reference, 'cancelled');
      load();
    } catch (err) {
      setActionError(err.message || 'Could not cancel order.');
    } finally {
      setUpdatingRef(null);
    }
  };

  if (loadError) {
    return (
      <p className="admin-error">
        {loadError} <button type="button" onClick={load}>Retry</button>
      </p>
    );
  }
  if (!orders) return <p className="admin-loading">Loading orders…</p>;
  if (orders.length === 0) return <p className="admin-empty">No orders yet.</p>;

  const counts = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});

  return (
    <div className="admin-orders">
      {actionError && <p className="admin-error">{actionError}</p>}

      <div className="admin-orders-summary">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div className="admin-stat glass" key={status}>
            <span className="admin-stat-value">{counts[status] || 0}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="admin-orders-table">
        {orders.map((order) => {
          const next = NEXT_STATUS[order.status];
          return (
            <div className="admin-order-row glass" key={order.reference}>
              <div className="admin-order-main">
                <p className="admin-order-ref">{order.reference}</p>
                <p className="admin-order-meta">
                  {order.customerName || order.email} &middot; {formatDate(order.createdAt)}
                </p>
                <ul className="admin-order-items">
                  {order.items.map((line) => {
                    const product = getProductById(line.id);
                    return (
                      <li key={line.id}>
                        {product?.name || line.id} &times; {line.quantity}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="admin-order-side">
                <p className="admin-order-total">{formatPrice(order.amount / 100, order.currency)}</p>
                <span className={`order-status order-status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
                {next && (
                  <button
                    type="button"
                    className="admin-order-advance"
                    disabled={updatingRef === order.reference}
                    onClick={() => handleAdvance(order)}
                  >
                    {updatingRef === order.reference ? 'Updating…' : `Mark ${STATUS_LABELS[next]}`}
                  </button>
                )}
                {CANCELLABLE_STATUSES.has(order.status) && (
                  <button
                    type="button"
                    className="admin-order-cancel"
                    disabled={updatingRef === order.reference}
                    onClick={() => handleCancel(order)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
