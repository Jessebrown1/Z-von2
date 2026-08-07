import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminOverview from './admin/AdminOverview';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import './AdminPage.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — {user.firstName}</p>
        <h1 className="serif">Dashboard</h1>
      </header>

      <nav className="admin-tabs" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="admin-tab-panel">
        {tab === 'overview' && <AdminOverview />}
        {tab === 'orders' && <AdminOrders />}
        {tab === 'products' && <AdminProducts />}
      </div>
    </div>
  );
}
