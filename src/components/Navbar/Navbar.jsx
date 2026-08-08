import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CartDrawer } from '../Cart';
import ThemeToggle from '../ThemeToggle';
import AccountMenu from './AccountMenu';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/collection', label: 'Collection' },
  { to: '/mood', label: 'Shop By Mood' },
  { to: '/limited-edition', label: 'Limited Edition' },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }, [isMenuOpen]);

  return (
    <>
      <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
        <NavLink to="/" className="navbar-mark" onClick={() => setIsMenuOpen(false)}>
          ZÉVON
        </NavLink>

        <nav className="navbar-links navbar-links--desktop" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `navbar-link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <ThemeToggle className="navbar-theme-toggle" />
          <AccountMenu />

          {!isAdmin && (
            <button
              type="button"
              className="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart, ${itemCount} items`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              {itemCount > 0 && <span className="navbar-cart-count">{itemCount}</span>}
            </button>
          )}

          <button
            type="button"
            className={`navbar-burger ${isMenuOpen ? 'is-open' : ''}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`navbar-mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
        {isAuthenticated ? (
          <>
            <p className="navbar-mobile-account-name">
              {user.firstName} {user.lastName}
            </p>
            {isAdmin ? (
              <NavLink to="/admin" className="navbar-mobile-admin-link" onClick={() => setIsMenuOpen(false)}>
                Admin Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/account/orders" onClick={() => setIsMenuOpen(false)}>
                  Order History
                </NavLink>
                <NavLink to="/account/wishlist" onClick={() => setIsMenuOpen(false)}>
                  Wishlist
                </NavLink>
                <NavLink to="/account/certificates" onClick={() => setIsMenuOpen(false)}>
                  Certificates
                </NavLink>
                <NavLink to="/account/style-dna" onClick={() => setIsMenuOpen(false)}>
                  Your DNA
                </NavLink>
              </>
            )}
            <button
              type="button"
              className="navbar-mobile-logout"
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
            Login
          </NavLink>
        )}
        <ThemeToggle className="navbar-mobile-theme-toggle" />
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
