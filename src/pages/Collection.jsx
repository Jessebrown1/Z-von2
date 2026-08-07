import { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import './Collection.css';

export default function Collection() {
  const { getCategories, getProductsByCategory, isLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = useMemo(() => getCategories(), [getCategories]);
  const products = useMemo(() => getProductsByCategory(activeCategory), [getProductsByCategory, activeCategory]);

  return (
    <div className="collection-page">
      <header className="collection-header">
        <p className="eyebrow">No. 001</p>
        <h1 className="serif">The Fearless Collection</h1>
        <p className="collection-header-sub">500 pieces. Numbered. Never repeated.</p>
      </header>

      <div className="collection-filters" role="tablist" aria-label="Filter by category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={`collection-filter ${activeCategory === category ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="collection-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!isLoading && products.length === 0 && <p className="collection-empty">No pieces in this category yet.</p>}
    </div>
  );
}
