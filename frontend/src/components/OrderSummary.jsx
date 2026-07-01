import React from 'react';
import { CreditCard, ArrowLeft } from 'lucide-react';

const OrderSummary = ({ subtotal, discount, delivery, gst, total, onCheckout, onContinue, children }) => {
  return (
    <div className="order-summary-card">
      <h2>Order Summary</h2>
      
      <div className="summary-rows">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="summary-row discount-row">
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="summary-row">
          <span>Delivery Charges</span>
          <span>{delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`}</span>
        </div>
        
        <div className="summary-row tax-row">
          <span>Estimated GST (18%)</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        {children}
        
        <div className="summary-row total-row">
          <span>Total Amount</span>
          <span className="total-amount">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-action-buttons">
        <button onClick={onCheckout} className="checkout-btn">
          <CreditCard size={18} />
          <span>Proceed to Checkout</span>
        </button>
        <button onClick={onContinue} className="continue-shopping-btn">
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
