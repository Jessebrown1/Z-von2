import { useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import '../pages/Collection.css';
import './LimitedEditionPage.css';

export default function LimitedEditionPage() {
  const { products, isLoading } = useProducts();
  const limited = useMemo(() => products.filter((p) => p.isLimited), [products]);

  return (
    <div className="collection-page limited-edition-page">
      <header className="collection-header">
        <p className="eyebrow">Numbered &amp; Never Repeated</p>
        <h1 className="serif">Limited Edition</h1>
        <p className="collection-header-sub">
          Every piece here ships with a digital certificate of authenticity — its own numbered place in the drop.
        </p>
      </header>

      <div className="collection-grid">
        {limited.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!isLoading && limited.length === 0 && (
        <p className="collection-empty">No limited-edition pieces available right now — check back soon.</p>
      )}
    </div>
  );
}
