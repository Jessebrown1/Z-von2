import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/helpers';

const SLOT_LABELS = { jacket: 'Jacket', top: 'Top', bottom: 'Bottom', accessory: 'Accessory' };

function MiniProduct({ product }) {
  if (!product) return null;
  return (
    <Link to={`/product/${product.slug}`} className="ai-mini-product">
      <img src={product.images?.[0]} alt={product.name} />
      <div>
        <p className="ai-mini-product-name">{product.name}</p>
        <p className="ai-mini-product-price">{formatPrice(product.price, product.currency)}</p>
      </div>
    </Link>
  );
}

export default function AIProductRecommendation({ block, onAddProduct, onAddLook, isAuthenticated }) {
  if (block.type === 'products') {
    if (!block.items?.length) return null;
    return (
      <div className="ai-rec ai-rec--products">
        {block.title && <p className="ai-rec-title">{block.title}</p>}
        <div className="ai-rec-products-row">
          {block.items.map((product) => (
            <div className="ai-rec-product-card" key={product.id}>
              <MiniProduct product={product} />
              <button type="button" onClick={() => onAddProduct(product)} disabled={!isAuthenticated}>
                {isAuthenticated ? 'Add to Cart' : 'Sign In to Add'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'outfit') {
    const slotEntries = Object.entries(block.slots).filter(([, product]) => product);
    if (!slotEntries.length) return null;
    return (
      <div className="ai-rec ai-rec--outfit">
        <p className="ai-rec-title">The Look</p>
        <div className="ai-outfit-slots">
          {slotEntries.map(([slot, product]) => (
            <div className="ai-outfit-slot" key={slot}>
              <span className="ai-outfit-slot-label">{SLOT_LABELS[slot] || slot}</span>
              <MiniProduct product={product} />
            </div>
          ))}
        </div>
        <div className="ai-outfit-footer">
          <span>
            Complete Look — {formatPrice(block.total, block.currency)}
          </span>
          <button type="button" onClick={() => onAddLook(block.slots)} disabled={!isAuthenticated}>
            {isAuthenticated ? 'Add Entire Look' : 'Sign In to Add'}
          </button>
        </div>
      </div>
    );
  }

  if (block.type === 'comparison') {
    const [a, b] = block.items;
    return (
      <div className="ai-rec ai-rec--comparison">
        <div className="ai-comparison-products">
          {[a, b].map((product) => (
            <div className={`ai-comparison-product ${product.id === block.winner.id ? 'is-winner' : ''}`} key={product.id}>
              <MiniProduct product={product} />
              {product.id === block.winner.id && <span className="ai-comparison-badge">Recommended</span>}
            </div>
          ))}
        </div>
        <ul className="ai-comparison-reasons">
          {block.reasons.map((reason) => (
            <li key={reason.label}>
              <span>{reason.label}</span>
              <p>{reason.text}</p>
            </li>
          ))}
        </ul>
        <button type="button" className="ai-comparison-cta" onClick={() => onAddProduct(block.winner)} disabled={!isAuthenticated}>
          {isAuthenticated ? `Choose ${block.winner.name.replace('ZÉVON ', '')}` : 'Sign In to Add'}
        </button>
      </div>
    );
  }

  return null;
}
