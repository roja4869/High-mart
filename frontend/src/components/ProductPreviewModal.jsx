import React, { useContext } from 'react';
import { X, Star, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { AppContext } from '../App';

const ProductPreviewModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const { user } = useContext(AppContext);
  const isAdmin = user?.role === 'admin';

  if (!isOpen || !product) return null;

  const currentPrice = product.price * (1 - (product.discount || 0) / 100);

  // Render Stars
  const renderStars = (rating) => {
    return (
      <div className="preview-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < Math.floor(rating) ? '#F59E0B' : 'none'}
            stroke="#F59E0B"
          />
        ))}
        <span>({rating} Rating)</span>
      </div>
    );
  };

  return (
    <div className="wish-modal-overlay" onClick={onClose}>
      <div className="preview-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="preview-close-btn" onClick={onClose} aria-label="Close Preview">
          <X size={18} />
        </button>

        <div className="preview-modal-grid">
          {/* Left Column: Image */}
          <div className="preview-modal-img-col">
            <img src={product.image || (product.images && product.images[0])} alt={product.name} />
          </div>

          {/* Right Column: Detailed Info */}
          <div className="preview-modal-info-col">
            <span className="preview-cat-brand">
              {product.category} &bull; {product.brand}
            </span>
            <h3 className="preview-title">{product.name}</h3>

            {/* Ratings */}
            {renderStars(product.rating || 4.5)}

            {/* Prices */}
            <div className="preview-price-row">
              <span className="preview-current">₹{currentPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="preview-old">₹{product.price.toFixed(2)}</span>
                  <span className="preview-discount">{product.discount}% OFF</span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              {product.stockStatus === 'In Stock' ? (
                <span className="wish-stock-badge in-stock" style={{ position: 'static' }}>In Stock</span>
              ) : (
                <span className="wish-stock-badge low-stock" style={{ position: 'static' }}>Low Stock</span>
              )}
            </div>

            {/* Description */}
            <p className="preview-desc">
              {product.description || 'Experience premium quality and performance with this High Mart selected product. Crafted with premium components and designed to enhance your everyday tasks.'}
            </p>

            {/* Highlights */}
            {product.features && product.features.length > 0 && (
              <div className="preview-highlights">
                <h5>Product Highlights</h5>
                <ul>
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Move to Cart button / Admin Notice */}
            {isAdmin ? (
              <div className="admin-preview-notice" style={{ marginTop: '20px', padding: '10px 14px', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '6px', color: '#a78bfa', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>Monitoring Mode: Admins cannot purchase products.</span>
              </div>
            ) : (
              <button 
                className="wish-move-cart-btn" 
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                style={{ marginTop: '20px' }}
              >
                <ShoppingCart size={18} />
                <span>Move to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;
