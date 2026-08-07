import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../utils/api';

const ProductsContext = createContext(null);

/**
 * Product catalog now lives in the database (admin-editable) instead of the
 * static src/data/products.js file — that file only still exists as the
 * one-time seed the server loads on first boot. Every page reads from here.
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = () =>
    apiRequest('/api/products')
      .then(({ products }) => {
        setProducts(products);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Could not load products.'))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      products,
      isLoading,
      error,
      reload,
      getProductBySlug: (slug) => products.find((p) => p.slug === slug),
      getProductById: (id) => products.find((p) => p.id === id),
      getProductsByCategory: (category) =>
        !category || category === 'All' ? products : products.filter((p) => p.category === category),
      getCategories: () => ['All', ...new Set(products.map((p) => p.category))],
      getRelatedProducts: (product, limit = 3) =>
        products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit),
    }),
    [products, isLoading, error]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
