import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { AppContext } from '../../App';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product, onPreview }) => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useContext(CartContext);
  const { toggleWishlist, wishlist, user } = useContext(AppContext);

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const finalPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
  const cartItem = cart.find(item => item.id === product.id);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="product-card-container glass-effect animate-fade-in">
      <div className="product-image-wrapper">
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
          alt={product.name} 
          className="product-img"
          loading="lazy"
        />
        {product.discountPercentage > 0 && (
          <span className="product-discount-tag">-{product.discountPercentage}%</span>
        )}
        
        {/* Wishlist Heart Toggle */}
        {!isAdmin && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
            aria-label="Toggle Wishlist"
          >
            <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} stroke={isWishlisted ? '#ef4444' : '#64748b'} />
          </button>
        )}

        {/* Quick View Hover Overlay */}
        <div className="product-quickview-overlay">
          <button 
            className="quickview-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreview) onPreview(product);
            }}
          >
            <Eye size={16} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      <div className="product-details-wrapper">
        {/* Category & Brand Header Tag */}
        <div className="product-cat-brand-row">
          <span className="product-category-lbl-tag">{product.category}</span>
          <span className="product-brand-lbl-tag">{product.brand}</span>
        </div>

        <h3 className="product-title">{product.name}</h3>

        {/* Sneak peek description snippet */}
        <p className="product-desc-snippet">
          {product.description ? (product.description.substring(0, 70) + '...') : ''}
        </p>

        {/* Ratings Star Row */}
        <div className="product-rating-row">
          <div className="stars-row">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.floor(product.rating || 4.5) ? '#f59e0b' : 'none'} 
                stroke="#f59e0b" 
              />
            ))}
          </div>
          <span className="rating-number">{product.rating || 4.5}</span>
          <span className="review-count">({product.reviewCount || 100})</span>
        </div>

        {/* Pricing & Cart Action Row */}
        <div className="product-price-action-row">
          <div className="price-box">
            <span className="price-now">₹{finalPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <span className="price-old">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          {isAdmin ? (
            <span className="admin-view-badge" style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.2)', fontWeight: 'bold' }}>
              Monitoring
            </span>
          ) : cartItem ? (
            <div className="product-qty-selector">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (cartItem.quantity <= 1) {
                    removeFromCart(product.id);
                  } else {
                    updateQuantity(product.id, cartItem.quantity - 1);
                  }
                }} 
                className="qty-adjust-btn"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="qty-display">{cartItem.quantity}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, cartItem.quantity + 1);
                }} 
                className="qty-adjust-btn"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }} 
              className="product-add-cart-circle-btn"
              aria-label={`Add ${product.name} to shopping cart`}
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
