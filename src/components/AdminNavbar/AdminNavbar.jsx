import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import './AdminNavbar.css';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
];

/**
 * Dedicated top nav for /admin — deliberately doesn't share the storefront
 * Navbar (no Home/Collection/Shop By Mood/Limited Edition), so the admin
 * area reads as its own focused tool rather than a page bolted onto the
 * customer site. Section switching (Overview/Orders/Products) lives here
 * instead of a secondary tab row.
 */
export default function AdminNavbar({ tab, onTabChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = async () => {
    setIsAccountOpen(false);
    setIsMenuOpen(false);
    await logout();
    navigate('/');
  };

  const selectTab = (id) => {
    onTabChange(id);
    setIsMenuOpen(false);
  };

  const handleTabKeyDown = (e) => {
    const index = ADMIN_TABS.findIndex((t) => t.id === tab);
    if (index === -1) return;
    let nextIndex = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % ADMIN_TABS.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + ADMIN_TABS.length) % ADMIN_TABS.length;
    if (nextIndex === null) return;
    e.preventDefault();
    const nextTab = ADMIN_TABS[nextIndex];
    selectTab(nextTab.id);
    document.getElementById(`admin-tab-${nextTab.id}`)?.focus();
  };

  return (
    <>
      <header className="admin-navbar">
        <Link to="/" className="admin-navbar-mark">
          ZÉVON <span className="admin-navbar-badge">Admin</span>
        </Link>

        <nav
          className="admin-navbar-links admin-navbar-links--desktop"
          role="tablist"
          aria-label="Admin sections"
          onKeyDown={handleTabKeyDown}
        >
          {ADMIN_TABS.map((t) => (
            <button
              key={t.id}
              id={`admin-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`admin-tabpanel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className={`admin-navbar-link ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="admin-navbar-actions">
          <ThemeToggle className="admin-navbar-theme-toggle" />

          <div className="admin-navbar-account" ref={accountRef}>
            <button
              type="button"
              className="admin-navbar-account-btn"
              onClick={() => setIsAccountOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={isAccountOpen}
              aria-label="Account menu"
            >
              <span className="admin-navbar-avatar">{initials}</span>
              <span className="admin-navbar-name">{user?.firstName}</span>
            </button>

            <div className={`admin-navbar-dropdown glass ${isAccountOpen ? 'is-open' : ''}`}>
              <Link to="/" onClick={() => setIsAccountOpen(false)}>
                View Site
              </Link>
              <button type="button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`admin-navbar-burger ${isMenuOpen ? 'is-open' : ''}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`admin-navbar-mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
        {ADMIN_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <Link to="/" onClick={() => setIsMenuOpen(false)}>
          View Site
        </Link>
        <button type="button" className="admin-navbar-mobile-logout" onClick={handleLogout}>
          Log Out
        </button>
        <ThemeToggle className="admin-navbar-mobile-theme-toggle" />
      </div>
    </>
  );
}
