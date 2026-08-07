import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <Link to="/" className="site-footer-mark">
          ZÉVON
        </Link>

        <div className="site-footer-col">
          <span className="site-footer-heading">Shop</span>
          <Link to="/collection">Collection</Link>
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
        <span>No. 001 &mdash; Fearless Collection</span>
      </div>
    </footer>
  );
}
