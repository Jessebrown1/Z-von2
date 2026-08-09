import { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import './Collection.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function Collection() {
  const { getCategories, getProductsByCategory, isLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('featured');
  const categories = useMemo(() => getCategories(), [getCategories]);
  const categoryProducts = useMemo(
    () => getProductsByCategory(activeCategory),
    [getProductsByCategory, activeCategory]
  );
  const products = useMemo(() => {
    if (sortOrder === 'featured') return categoryProducts;
    const sorted = [...categoryProducts];
    sorted.sort((a, b) => (sortOrder === 'price-asc' ? a.price - b.price : b.price - a.price));
    return sorted;
  }, [categoryProducts, sortOrder]);

  return (
    <div className="collection-page">
      <header className="collection-header">
        <p className="eyebrow">No. 001</p>
        <h1 className="serif">The Fearless Collection</h1>
        <p className="collection-header-sub">500 pieces. Numbered. Never repeated.</p>
      </header>

      <div className="collection-controls">
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

        <label className="collection-sort">
          <span>Sort</span>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort by price">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
