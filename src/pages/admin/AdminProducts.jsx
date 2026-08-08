import { useState } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../utils/helpers';
import { deleteProduct } from '../../utils/adminApi';
import ProductForm from './ProductForm';
import './AdminProducts.css';

export default function AdminProducts() {
  const { products, isLoading, error: loadError, reload } = useProducts();
  const [editing, setEditing] = useState(null); // null = list view, 'new' = create, product = edit
  const [error, setError] = useState(null);

  const handleSaved = () => {
    setEditing(null);
    reload();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(product.id);
      reload();
    } catch (err) {
      setError(err.message || 'Could not delete product.');
    }
  };

  if (editing) {
    return (
      <ProductForm
        product={editing === 'new' ? null : editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-products-toolbar">
        <button type="button" className="admin-add-btn" onClick={() => setEditing('new')}>
          + Add Product
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loadError ? (
        <p className="admin-error">
          {loadError} <button type="button" onClick={reload}>Retry</button>
        </p>
      ) : isLoading ? (
        <p className="admin-loading">Loading products…</p>
      ) : (
        <div className="admin-products-grid">
          {products.map((product) => (
            <div className="admin-product-card glass" key={product.id}>
              <div className="admin-product-thumb">
                <img src={product.images[0] || '/hero.png'} alt={product.name} />
              </div>
              <div className="admin-product-info">
                <p className="admin-product-name">{product.name}</p>
                <p className="admin-product-meta">
                  {product.category} &middot; {formatPrice(product.price, product.currency)}
                </p>
                <p className="admin-product-desc">{product.description}</p>
              </div>
              <div className="admin-product-actions">
                <button type="button" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-product-delete"
                  aria-label={`Delete ${product.name}`}
                  onClick={() => handleDelete(product)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
