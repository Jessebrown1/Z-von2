import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" aria-hidden="true" />

      <div className="site-footer-top">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-mark">
            ZÉVON
          </Link>
          <p className="site-footer-manifesto serif">Crafted for the fearless.</p>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-heading">Shop</span>
          <Link to="/collection">Collection</Link>
          <Link to="/mood">Shop By Mood</Link>
          <Link to="/limited-edition">Limited Edition</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-heading">Info</span>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Shipping &amp; Returns
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Size Guide
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Contact
          </a>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-heading">Follow</span>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Instagram
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            TikTok
          </a>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>&copy; {year} ZÉVON. All rights reserved.</span>
        <span className="site-footer-drop serif">No. 001 &mdash; The Fearless Collection</span>
        <span className="site-footer-legal">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
        </span>
      </div>
    </footer>
  );
}
