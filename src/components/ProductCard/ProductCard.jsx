import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/helpers';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [primaryImage, hoverImage] = product.images;
  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated } = useAuth();
  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) toggle(product.id);
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-media">
        <img src={primaryImage} alt={product.name} className="product-card-img product-card-img--primary" />
        {hoverImage && (
          <img src={hoverImage} alt="" aria-hidden="true" className="product-card-img product-card-img--hover" />
        )}
        {product.isNew && <span className="product-card-badge">New</span>}
        {product.isLimited && <span className="product-card-badge product-card-badge--limited">Limited</span>}
        {isAuthenticated && (
          <button
            type="button"
            className={`product-card-wishlist ${wishlisted ? 'is-active' : ''}`}
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
          >
            <svg viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s-7.5-4.7-10-9.3C.3 8 2 4.5 5.6 4.5c2 0 3.5 1 6.4 4.2 2.9-3.2 4.4-4.2 6.4-4.2C22 4.5 23.7 8 22 11.7 19.5 16.3 12 21 12 21z" />
            </svg>
          </button>
        )}
      </div>
      <div className="product-card-info">
        <h3>{product.name}</h3>
        <p>{formatPrice(product.price, product.currency)}</p>
      </div>
    </Link>
  );
}
