import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../utils/wishlistApi';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [productIds, setProductIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const reload = () => {
    if (!isAuthenticated) {
      setProductIds(new Set());
      return;
    }
    setIsLoading(true);
    fetchWishlist()
      .then(({ products }) => setProductIds(new Set(products.map((p) => p.id))))
      .catch(() => setProductIds(new Set()))
      .finally(() => setIsLoading(false));
  };

  useEffect(reload, [isAuthenticated]);

  const value = useMemo(
    () => ({
      productIds,
      isLoading,
      isWishlisted: (productId) => productIds.has(productId),
      toggle: async (productId) => {
        if (!isAuthenticated) return;
        const wasWishlisted = productIds.has(productId);
        // Optimistic — the heart should flip the instant you click it.
        setProductIds((prev) => {
          const next = new Set(prev);
          wasWishlisted ? next.delete(productId) : next.add(productId);
          return next;
        });
        try {
          if (wasWishlisted) await removeFromWishlist(productId);
          else await addToWishlist(productId);
        } catch {
          reload(); // out of sync with the server — resync rather than lie
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productIds, isLoading, isAuthenticated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
