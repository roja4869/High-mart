import React from 'react';
import { ShoppingCart } from 'lucide-react';

const WishlistSummary = ({ itemsCount, totalValue, totalOriginalValue, onMoveAllToCart }) => {
  const discountSavings = totalOriginalValue - totalValue;

  return (
    <div className="wish-summary-card">
      <h2>Wishlist Summary</h2>
      
      <div className="wish-summary-details">
        <div className="wish-summary-row">
          <span>Total Saved Products</span>
          <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
        </div>
        
        <div className="wish-summary-row">
          <span>Original Value</span>
          <span>₹{totalOriginalValue.toFixed(2)}</span>
        </div>
        
        {discountSavings > 0 && (
          <div className="wish-summary-row accent-row">
            <span>Special Discounts</span>
            <span>-₹{discountSavings.toFixed(2)}</span>
          </div>
        )}
        
        <div className="wish-summary-row total-row">
          <span>Total Value</span>
          <span className="total-amount">₹{totalValue.toFixed(2)}</span>
        </div>
      </div>

      <button className="wish-move-all-btn" onClick={onMoveAllToCart}>
        <ShoppingCart size={18} />
        <span>Move All to Cart</span>
      </button>
    </div>
  );
};

export default WishlistSummary;
