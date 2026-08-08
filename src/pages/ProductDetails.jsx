import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import ProductDNA from '../components/ProductDNA/ProductDNA';
import { Accordion, Button, QuantityStepper, SelectorGroup } from '../components/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';
import { recordProductView } from '../utils/interactionsApi';
import { SIZE_GUIDE_ROWS } from '../data/sizeGuide';
import { gsap, useGsapContext } from '../hooks/animationHooks';
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
  const pageRef = useRef(null);

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

  useGsapContext(
    () => {
      if (!product) return;
      gsap.from('.product-details-reveal', {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });
    },
    [product?.id],
    pageRef
  );

  if (isLoading) return null;
  if (!product) return <Navigate to="/collection" replace />;

  const related = getRelatedProducts(product);
  const hasStockCount = product.isLimited && Number.isFinite(product.remaining) && product.editionSize;
  const stockRatio = hasStockCount ? product.remaining / product.editionSize : null;
  const isLowStock = hasStockCount && stockRatio <= 0.2;

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
    <div className="product-details-page" ref={pageRef}>
      <div className="product-details">
        <div className="product-details-gallery-col product-details-reveal">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="product-details-info">
          <p className="eyebrow product-details-reveal">
            {product.category}
            {product.dropNumber && <span className="product-details-drop"> · Drop No. {String(product.dropNumber).padStart(3, '0')}</span>}
          </p>
          <h1 className="serif product-details-reveal">{product.name}</h1>
          <p className="product-details-price product-details-reveal">{formatPrice(product.price, product.currency)}</p>

          {product.isLimited && (
            <div className="product-details-scarcity product-details-reveal">
              <div className="product-details-scarcity-top">
                <span className="product-details-edition">Limited Edition — {product.editionSize} Pieces</span>
                {hasStockCount && (
                  <span className={`product-details-stock-count ${isLowStock ? 'is-low' : ''}`}>
                    {product.remaining > 0
                      ? `${product.remaining} of ${product.editionSize} remaining`
                      : 'Sold out'}
                  </span>
                )}
              </div>
              {hasStockCount && (
                <div className="product-details-stock-bar">
                  <div
                    className={`product-details-stock-fill ${isLowStock ? 'is-low' : ''}`}
                    style={{ width: `${Math.max(4, stockRatio * 100)}%` }}
                  />
                </div>
              )}
              {isLowStock && product.remaining > 0 && (
                <p className="product-details-urgency">Selling fast — once these are gone, this drop won't return.</p>
              )}
            </div>
          )}

          <p className="product-details-description product-details-reveal">{product.description}</p>

          <div className="product-details-perk product-details-reveal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M12 2c1.2 1.6 1.8 2.9 1.8 4.2 0 1.4-.8 2.3-1.8 2.3s-1.8-.9-1.8-2.3C10.2 4.9 10.8 3.6 12 2Z" />
              <path d="M8.5 8.5h7L17 21a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L8.5 8.5Z" />
              <path d="M8.2 13h7.6" />
            </svg>
            <p>
              Includes a complimentary <em>ZÉVON</em> Special Perfume (10ml)
            </p>
          </div>

          <div className="product-details-reveal">
            <SelectorGroup label="Color" options={product.colors} value={color} onChange={setColor} />
            <SelectorGroup label="Size" options={product.sizes} value={size} onChange={setSize} />
          </div>

          <div className="product-details-actions product-details-reveal">
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

          <div className="product-details-accordions product-details-reveal">
            <Accordion title="Details" defaultOpen>
              <ul className="product-details-list">
                {product.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Accordion>

            <Accordion title="Size Guide">
              <p className="product-details-accordion-note">Measurements in centimeters. For a relaxed fit, size up.</p>
              <div className="product-details-size-table-wrap">
                <table className="product-details-size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest</th>
                      <th>Waist</th>
                      <th>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE_ROWS.map((row) => (
                      <tr key={row.size} className={row.size === size ? 'is-selected' : ''}>
                        <td>{row.size}</td>
                        <td>{row.chest}</td>
                        <td>{row.waist}</td>
                        <td>{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Accordion>

            <Accordion title="Shipping & Returns">
              <div className="product-details-shipping">
                <p>
                  <strong>Ghana:</strong> 2–4 business days. Free on orders over GHS 800.
                </p>
                <p>
                  <strong>International:</strong> 7–14 business days, customs and duties are the recipient's
                  responsibility.
                </p>
                <p>
                  <strong>Returns:</strong> Unworn pieces in original packaging may be returned within 14 days of
                  delivery. Limited-edition pieces are final sale.
                </p>
              </div>
            </Accordion>
          </div>
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
