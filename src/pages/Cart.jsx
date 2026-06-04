import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ArrowLeft, Trash2, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cart, clearCart, cartSubtotal } = useContext(CartContext);
  const navigate = useNavigate();

  // Coupon promo code simulation state
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState(null); // 'applied', 'error', null
  const [couponMessage, setCouponMessage] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const cleanCoupon = coupon.toUpperCase().trim();
    if (cleanCoupon === 'HIGHMART15') {
      setDiscountPercent(15);
      setCouponStatus('applied');
      setCouponMessage('Promo code HIGHMART15 applied: 15% discount!');
    } else if (cleanCoupon === 'DISCOUNT10') {
      setDiscountPercent(10);
      setCouponStatus('applied');
      setCouponMessage('Promo code DISCOUNT10 applied: 10% discount!');
    } else {
      setDiscountPercent(0);
      setCouponStatus('error');
      setCouponMessage('Invalid promo code. Try HIGHMART15.');
    }
  };

  // Pricing calculations
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const freeShippingThreshold = 2000;
  const shippingCharges = (cartSubtotal > freeShippingThreshold || cartSubtotal === 0) ? 0 : 150.00;
  const estTaxes = (cartSubtotal - discountAmount) * 0.18; // GST 18%
  const grandTotal = cartSubtotal - discountAmount + shippingCharges + estTaxes;

  const handleCheckout = () => {
    // Navigate to simulated orders dashboard
    navigate('/dashboard');
  };

  return (
    <div className="cart-page-container">
      {/* Breadcrumbs */}
      <div className="cart-breadcrumbs">
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <span className="current">Shopping Cart</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-wrapper glass-effect animate-fade-in">
          <div className="empty-cart-icon-wrapper">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Explore our premium collections and add items to your cart to begin your shopping experience.</p>
          <Link to="/" className="start-shopping-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content-layout">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-header-actions">
              <h1>Shopping Cart ({cart.length})</h1>
              <button onClick={clearCart} className="clear-cart-anchor">
                <Trash2 size={16} />
                <span>Clear Cart</span>
              </button>
            </div>

            {/* Free Shipping Progress bar */}
            {cartSubtotal < freeShippingThreshold && (
              <div className="shipping-progress-banner glass-effect">
                <p>
                  Add <strong>₹{(freeShippingThreshold - cartSubtotal).toFixed(2)}</strong> more to unlock **Free Express Shipping**!
                </p>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${(cartSubtotal / freeShippingThreshold) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="cart-items-list">
              {cart.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <Link to="/" className="continue-shopping-btn">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="cart-summary-section">
            <div className="summary-card glass-effect">
              <h3>Order Summary</h3>
              <hr className="summary-divider" />

              {/* Price Details */}
              <div className="summary-price-details">
                <div className="summary-row">
                  <span>Cart Subtotal</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span>{shippingCharges === 0 ? 'Free' : `₹${shippingCharges.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Taxes (GST 18%)</span>
                  <span>₹{estTaxes.toFixed(2)}</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row grand-total-row">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Code Section */}
              <form onSubmit={handleApplyCoupon} className="coupon-form-box">
                <label htmlFor="promo-code">Have a promo code?</label>
                <div className="coupon-input-row">
                  <input
                    type="text"
                    id="promo-code"
                    placeholder="e.g. HIGHMART15"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button type="submit">Apply</button>
                </div>
                {couponStatus && (
                  <div className={`coupon-status-msg ${couponStatus}`}>
                    <Tag size={13} />
                    <span>{couponMessage}</span>
                  </div>
                )}
              </form>

              {/* Checkout CTA */}
              <button onClick={handleCheckout} className="checkout-btn-cta">
                Proceed to Checkout
              </button>

              <div className="trust-badges-wrapper">
                <div className="badge-item">
                  <ShieldCheck size={16} className="badge-icon" />
                  <span>Secure Checkout</span>
                </div>
                <div className="badge-item">
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
