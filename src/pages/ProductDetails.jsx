import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import ProductDNA from '../components/ProductDNA/ProductDNA';
import { Button, QuantityStepper, SelectorGroup } from '../components/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';
import { recordProductView } from '../utils/interactionsApi';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const { getProductBySlug, getRelatedProducts, isLoading } = useProducts();
  const product = getProductBySlug(slug);

  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Product data loads async — default the selectors once it's actually in.
  useEffect(() => {
    if (product) {
      setSize((prev) => prev || product.sizes[0] || '');
      setColor((prev) => prev || product.colors[0] || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Feeds Style DNA — no-ops server-side for guests, so safe unconditionally.
  useEffect(() => {
    if (product) recordProductView(product.id).catch(() => {});
  }, [product?.id]);

  if (isLoading) return null;
  if (!product) return <Navigate to="/collection" replace />;

  const related = getRelatedProducts(product);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    addItem(product, { size, color, quantity });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="product-details-page">
      <div className="product-details">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="product-details-info">
          <p className="eyebrow">{product.category}</p>
          <h1 className="serif">{product.name}</h1>
          <p className="product-details-price">{formatPrice(product.price, product.currency)}</p>

          {product.isLimited && (
            <p className="product-details-edition">Limited to {product.editionSize} pieces</p>
          )}

          <p className="product-details-description">{product.description}</p>

          <SelectorGroup label="Color" options={product.colors} value={color} onChange={setColor} />
          <SelectorGroup label="Size" options={product.sizes} value={size} onChange={setSize} />

          <div className="product-details-actions">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button onClick={handleAddToCart} variant="solid" className="product-details-add">
              {justAdded ? 'Added ✓' : isAuthenticated ? 'Add to Cart' : 'Sign In to Add to Cart'}
            </Button>
            {isAuthenticated && (
              <button
                type="button"
                className={`product-details-wishlist ${isWishlisted(product.id) ? 'is-active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={isWishlisted(product.id)}
                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <svg viewBox="0 0 24 24" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 21s-7.5-4.7-10-9.3C.3 8 2 4.5 5.6 4.5c2 0 3.5 1 6.4 4.2 2.9-3.2 4.4-4.2 6.4-4.2C22 4.5 23.7 8 22 11.7 19.5 16.3 12 21 12 21z" />
                </svg>
              </button>
            )}
          </div>

          <ul className="product-details-list">
            {product.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <ProductDNA product={product} />

      {related.length > 0 && (
        <section className="product-details-related">
          <h2 className="serif">You May Also Like</h2>
          <div className="product-details-related-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <Link to="/collection" className="product-details-back">
        &larr; Back to Collection
      </Link>
    </div>
  );
}
