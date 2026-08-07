import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { cartLineKey } from '../utils/helpers';

const STORAGE_KEY = 'zevon_cart_v1';
const CartContext = createContext(null);

function loadInitialState() {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { items: JSON.parse(raw) } : { items: [] };
  } catch {
    return { items: [] };
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, color, quantity } = action.payload;
      const key = cartLineKey(product.id, size, color);
      const existing = state.items.find((item) => item.key === key);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            currency: product.currency,
            image: product.images?.[0],
            size,
            color,
            quantity,
          },
        ],
      };
    }
    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.key !== key) };
      }
      return {
        items: state.items.map((item) => (item.key === key ? { ...item, quantity } : item)),
      };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((item) => item.key !== action.payload.key) };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo(() => {
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items: state.items,
      itemCount,
      subtotal,
      addItem: (product, { size, color, quantity = 1 }) =>
        dispatch({ type: 'ADD_ITEM', payload: { product, size, color, quantity } }),
      updateQuantity: (key, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } }),
      removeItem: (key) => dispatch({ type: 'REMOVE_ITEM', payload: { key } }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
