import React from 'react';
import { Star, ShoppingCart, Trash2, Eye } from 'lucide-react';

const WishlistCard = ({ product, onMoveToCart, onRemove, onQuickView }) => {
  const currentPrice = product.price * (1 - (product.discount || 0) / 100);

  // Render Stars
  const renderStars = (rating) => {
    return (
      <div className="wish-card-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < Math.floor(rating) ? '#F59E0B' : 'none'}
            stroke="#F59E0B"
          />
        ))}
        <span>({rating})</span>
      </div>
    );
  };

  return (
    <div className="wish-card">
      {/* Badges and Remove Overlay */}
      <div className="wish-badges">
        {product.discount > 0 && (
          <span className="wish-discount-badge">{product.discount}% OFF</span>
        )}
        <span className={`wish-stock-badge ${product.stockStatus === 'In Stock' ? 'in-stock' : 'low-stock'}`}>
          {product.stockStatus === 'In Stock' ? 'In Stock' : 'Low Stock'}
        </span>
      </div>

      {/* Remove Button Overlay */}
      <button 
        className="wish-remove-overlay-btn" 
        onClick={() => onRemove(product)} 
        title="Remove from Wishlist"
        aria-label="Remove Product"
      >
        <Trash2 size={16} />
      </button>

      {/* Image Container with Quick View Overlay */}
      <div className="wish-card-img-box">
        <img src={product.image} alt={product.name} />
        <div className="wish-card-quick-overlay">
          <button 
            className="wish-quick-view-btn" 
            onClick={() => onQuickView(product)}
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="wish-card-body">
        <div className="wish-card-category-row">
          <span className="wish-card-cat">{product.category}</span>
          <span className="wish-card-brand">{product.brand}</span>
        </div>
        <h3 className="wish-card-name" title={product.name}>{product.name}</h3>

        {/* Ratings */}
        {renderStars(product.rating || 4.5)}

        {/* Pricing */}
        <div className="wish-card-price-row">
          <span className="wish-current-price">₹{currentPrice.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="wish-old-price">₹{product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Move to Cart Main Button */}
        <button className="wish-move-cart-btn" onClick={() => onMoveToCart(product)}>
          <ShoppingCart size={16} />
          <span>Move to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
