import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);

  const unitPrice = item.price * (1 - (item.discount || 0) / 100);
  const totalPrice = unitPrice * item.quantity;

  return (
    <div className="cart-item-wrapper glass-effect">
      <div className="cart-item-img-box">
        <img 
          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
          alt={item.name} 
          className="cart-item-img"
        />
      </div>

      <div className="cart-item-details">
        <span className="cart-item-cat">{item.category}</span>
        <h4 className="cart-item-title">{item.name}</h4>
        
        <div className="cart-item-unit-price">
          <span>₹{unitPrice.toFixed(2)} each</span>
          {item.discount > 0 && (
            <span className="cart-item-strike">₹{item.price.toFixed(2)}</span>
          )}
        </div>
      </div>

      <div className="cart-item-controls-col">
        {/* Quantity selectors */}
        <div className="cart-item-qty-selector">
          <button 
            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
            className="qty-btn"
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="qty-value">{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
            className="qty-btn"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Pricing & remove row */}
        <div className="cart-item-pricing-actions">
          <span className="cart-item-total-price">₹{totalPrice.toFixed(2)}</span>
          <button 
            onClick={() => removeFromCart(item.id)} 
            className="cart-item-remove-btn"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
