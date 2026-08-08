import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Desktop account control — a "Login" link when signed out, an initials avatar + dropdown when signed in. */
export default function AccountMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <NavLink to="/login" className="navbar-account-link" aria-label="Log in">
        <span className="navbar-account-avatar navbar-account-avatar--empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
          </svg>
        </span>
      </NavLink>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="navbar-account" ref={rootRef}>
      <button
        type="button"
        className="navbar-account-btn"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Account menu"
      >
        <span className="navbar-account-avatar">{initials}</span>
        <span className="navbar-account-first-name">{user.firstName}</span>
      </button>

      <div className={`navbar-account-dropdown glass ${isOpen ? 'is-open' : ''}`}>
        <p className="navbar-account-name">
          {user.firstName} {user.lastName}
        </p>
        {user.role === 'admin' ? (
          <Link to="/admin" className="navbar-account-admin-link" onClick={() => setIsOpen(false)}>
            Admin Dashboard
          </Link>
        ) : (
          <>
            <Link to="/account/orders" onClick={() => setIsOpen(false)}>
              Order History
            </Link>
            <Link to="/account/wishlist" onClick={() => setIsOpen(false)}>
              Wishlist
            </Link>
            <Link to="/account/certificates" onClick={() => setIsOpen(false)}>
              Certificates
            </Link>
            <Link to="/account/style-dna" onClick={() => setIsOpen(false)}>
              Your ZÉVON DNA
            </Link>
          </>
        )}
        <button type="button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}
