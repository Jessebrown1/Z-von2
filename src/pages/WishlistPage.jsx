import { Button } from '../components/UI';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductsContext';
import './WishlistPage.css';

export default function WishlistPage() {
  const { productIds, isLoading } = useWishlist();
  const { products, isLoading: productsLoading } = useProducts();

  const items = products.filter((p) => productIds.has(p.id));

  if (isLoading || productsLoading) {
    return (
      <div className="wishlist-page wishlist-page--empty">
        <h1 className="serif">Wishlist</h1>
        <p>Loading your saved pieces…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wishlist-page wishlist-page--empty">
        <h1 className="serif">Wishlist</h1>
        <p>Nothing saved yet — tap the heart on any piece to keep it here.</p>
        <Button to="/collection" variant="solid">
          Browse the Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <p className="eyebrow">Saved</p>
      <h1 className="serif">Wishlist</h1>

      <div className="wishlist-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
