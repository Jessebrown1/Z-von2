import { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminOverview from './admin/AdminOverview';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import './AdminPage.css';

const TABS = ['overview', 'orders', 'products'];
const TAB_LABELS = { overview: 'Overview', orders: 'Orders', products: 'Products' };

export default function AdminPage() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="admin-page">
      <AdminNavbar tab={tab} onTabChange={setTab} />

      <div className="admin-page-body">
        <h1 className="serif admin-page-title">{TAB_LABELS[tab]}</h1>

        {TABS.map((id) => (
          <div
            key={id}
            id={`admin-tabpanel-${id}`}
            role="tabpanel"
            aria-labelledby={`admin-tab-${id}`}
            hidden={tab !== id}
            className="admin-tab-panel"
          >
            {id === 'overview' && tab === 'overview' && <AdminOverview />}
            {id === 'orders' && tab === 'orders' && <AdminOrders />}
            {id === 'products' && tab === 'products' && <AdminProducts />}
          </div>
        ))}
      </div>
    </div>
  );
}
