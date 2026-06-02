import React from 'react';
import { Star, Trash2, Bookmark, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onIncrease, onDecrease, onRemove, onSaveLater }) => {
  const itemTotalPrice = (item.price * (1 - item.discount / 100)) * item.quantity;
  const itemUnitPrice = item.price * (1 - item.discount / 100);

  return (
    <div className="cart-item-card">
      {/* Image Box */}
      <div className="cart-item-image-box">
        <img src={item.image} alt={item.name} />
      </div>

      {/* Info Details */}
      <div className="cart-item-info">
        <div className="cart-item-meta">
          <span className="cart-item-category">{item.category}</span>
          <h3 className="cart-item-name">{item.name}</h3>
          
          {/* Ratings */}
          <div className="cart-item-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                fill={i < Math.floor(item.rating) ? '#F59E0B' : 'none'} 
                stroke="#F59E0B" 
              />
            ))}
            <span>({item.rating})</span>
          </div>
        </div>

        {/* Action Options */}
        <div className="cart-item-actions">
          <button onClick={() => onSaveLater(item.id)} className="cart-action-btn">
            <Bookmark size={14} />
            <span>Save for Later</span>
          </button>
          <button onClick={() => onRemove(item.id)} className="cart-action-btn remove-btn">
            <Trash2 size={14} />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Controls & Price Column */}
      <div className="cart-item-control-col">
        <div className="cart-item-price-info">
          {item.discount > 0 && (
            <div className="cart-item-unit-price">
              <span style={{ textDecoration: 'line-through', marginRight: '6px' }}>
                ₹{item.price.toFixed(2)}
              </span>
              <span>₹{itemUnitPrice.toFixed(2)} each</span>
            </div>
          )}
          {!item.discount && (
            <div className="cart-item-unit-price">₹{item.price.toFixed(2)} each</div>
          )}
          <div className="cart-item-total-price">₹{itemTotalPrice.toFixed(2)}</div>
        </div>

        {/* Quantity Selectors */}
        <div className="cart-quantity-selector">
          <button 
            onClick={() => onDecrease(item.id)} 
            className="qty-control-btn"
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <input 
            type="text" 
            className="qty-display-input" 
            value={item.quantity} 
            readOnly 
            aria-label="Current quantity"
          />
          <button 
            onClick={() => onIncrease(item.id)} 
            className="qty-control-btn"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
