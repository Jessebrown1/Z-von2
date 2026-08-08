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

  const handleTabKeyDown = (e) => {
    const index = TABS.findIndex((t) => t.id === tab);
    if (index === -1) return;
    let nextIndex = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (nextIndex === null) return;
    e.preventDefault();
    const nextTab = TABS[nextIndex];
    setTab(nextTab.id);
    document.getElementById(`admin-tab-${nextTab.id}`)?.focus();
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — {user.firstName}</p>
        <h1 className="serif">Dashboard</h1>
      </header>

      <nav className="admin-tabs" role="tablist" aria-label="Admin sections" onKeyDown={handleTabKeyDown}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`admin-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`admin-tabpanel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={`admin-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {TABS.map((t) => (
        <div
          key={t.id}
          id={`admin-tabpanel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${t.id}`}
          hidden={tab !== t.id}
          className="admin-tab-panel"
        >
          {t.id === 'overview' && tab === 'overview' && <AdminOverview />}
          {t.id === 'orders' && tab === 'orders' && <AdminOrders />}
          {t.id === 'products' && tab === 'products' && <AdminProducts />}
        </div>
      ))}
    </div>
  );
}
