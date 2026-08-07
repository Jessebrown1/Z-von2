import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../utils/helpers';
import { fetchAllOrders } from '../../utils/adminApi';
import './AdminOverview.css';

const SALE_STATUSES = new Set(['paid', 'completed']);

function formatDay(isoDay) {
  return new Date(`${isoDay}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildStats(orders) {
  const sales = orders.filter((o) => SALE_STATUSES.has(o.status));
  const revenue = sales.reduce((sum, o) => sum + o.amount, 0);
  const currency = orders[0]?.currency || 'GHS';

  const byDay = new Map();
  for (const o of sales) {
    const day = o.createdAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + o.amount);
  }
  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, amount]) => ({ day, amount }));

  const productTotals = new Map();
  for (const o of sales) {
    for (const line of o.items) {
      const entry = productTotals.get(line.id) || { quantity: 0 };
      entry.quantity += line.quantity;
      productTotals.set(line.id, entry);
    }
  }
  const topProducts = Array.from(productTotals.entries()).sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 5);

  return {
    revenue,
    currency,
    orderCount: orders.length,
    salesCount: sales.length,
    completedCount: orders.filter((o) => o.status === 'completed').length,
    avgOrderValue: sales.length ? revenue / sales.length : 0,
    trend,
    topProducts,
  };
}

export default function AdminOverview() {
  const { getProductById } = useProducts();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(err.message || 'Could not load sales data.'));
  }, []);

  const stats = useMemo(() => (orders ? buildStats(orders) : null), [orders]);

  if (error) return <p className="admin-error">{error}</p>;
  if (!stats) return <p className="admin-loading">Loading sales data…</p>;

  const maxTrend = Math.max(1, ...stats.trend.map((t) => t.amount));

  return (
    <div className="admin-overview">
      <div className="admin-overview-stats">
        <div className="admin-overview-stat glass">
          <span className="admin-overview-stat-value">{formatPrice(stats.revenue / 100, stats.currency)}</span>
          <span className="admin-overview-stat-label">Total Revenue</span>
        </div>
        <div className="admin-overview-stat glass">
          <span className="admin-overview-stat-value">{stats.orderCount}</span>
          <span className="admin-overview-stat-label">Total Orders</span>
        </div>
        <div className="admin-overview-stat glass">
          <span className="admin-overview-stat-value">{formatPrice(stats.avgOrderValue / 100, stats.currency)}</span>
          <span className="admin-overview-stat-label">Avg Order Value</span>
        </div>
        <div className="admin-overview-stat glass">
          <span className="admin-overview-stat-value">{stats.completedCount}</span>
          <span className="admin-overview-stat-label">Fulfilled</span>
        </div>
      </div>

      <div className="admin-overview-panel glass">
        <h3 className="serif">Sales Trend</h3>
        {stats.trend.length === 0 ? (
          <p className="admin-empty">No sales yet — revenue appears here once orders are paid.</p>
        ) : (
          <div className="admin-trend-chart">
            {stats.trend.map((point) => (
              <div className="admin-trend-bar-wrap" key={point.day}>
                <div
                  className="admin-trend-bar"
                  style={{ height: `${Math.max(4, (point.amount / maxTrend) * 100)}%` }}
                  title={formatPrice(point.amount / 100, stats.currency)}
                />
                <span className="admin-trend-label">{formatDay(point.day)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-overview-panel glass">
        <h3 className="serif">Top Products</h3>
        {stats.topProducts.length === 0 ? (
          <p className="admin-empty">No sales yet.</p>
        ) : (
          <ul className="admin-top-products">
            {stats.topProducts.map(([id, data]) => {
              const product = getProductById(id);
              return (
                <li key={id}>
                  <span className="admin-top-product-name">{product?.name || id}</span>
                  <span className="admin-top-product-qty">{data.quantity} sold</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
