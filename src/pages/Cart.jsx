import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import CouponBox from '../components/CouponBox';
import EmptyCart from '../components/EmptyCart';
import '../styles/Cart.css';

// Initial pre-populated dummy items matching MOCK_PRODUCTS database structure
const INITIAL_DUMMY_ITEMS = [
  {
    id: 1,
    name: 'Wireless Over-Ear ANC Headphones',
    category: 'Electronics',
    price: 129.99,
    discount: 20,
    rating: 4.9,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
  },
  {
    id: 2,
    name: 'Minimalist Quartz Leather Watch',
    category: 'Fashion',
    price: 79.99,
    discount: 15,
    rating: 4.6,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
  },
  {
    id: 5,
    name: 'Ergonomic Adjustable Office Chair',
    category: 'Home & Kitchen',
    price: 149.99,
    discount: 12,
    rating: 4.8,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80'
  }
];

const VALID_COUPONS = {
  'HIGHMART10': { type: 'percent', value: 10, description: '10% OFF on subtotal' },
  'DISCOUNT20': { type: 'percent', value: 20, description: '20% OFF on subtotal' },
  'FREESHIP': { type: 'shipping', value: 100, description: 'Free delivery charges' }
};

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    wishlist, 
    toggleWishlist, 
    addToast 
  } = useContext(AppContext) || {};

  const cartItems = cart || [];
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null); // 'applied', 'error', null
  const [couponMessage, setCouponMessage] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [freeShippingApplied, setFreeShippingApplied] = useState(false);

  // Helper trigger for notifications
  const triggerNotification = (msg, type = 'success') => {
    if (addToast) {
      addToast(msg, type);
    } else {
      console.log(`[Notification] ${type.toUpperCase()}: ${msg}`);
    }
  };

  // State actions
  const handleIncreaseQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateCartQuantity(id, item.quantity + 1);
      triggerNotification('Cart item quantity increased.');
    }
  };

  const handleDecreaseQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateCartQuantity(id, item.quantity - 1);
      triggerNotification('Cart item quantity decreased.', 'info');
    }
  };

  const handleRemoveItem = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      removeFromCart(id);
      triggerNotification(`${item.name} removed from shopping cart.`, 'info');
    }
  };

  const handleSaveForLater = (id) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const isAlreadyInWishlist = wishlist?.some(w => w.id === id);
      if (!isAlreadyInWishlist && toggleWishlist) {
        toggleWishlist(item);
      }
      removeFromCart(id);
      triggerNotification(`${item.name} saved for later purchases.`, 'success');
    }
  };

  const handleApplyCoupon = (code) => {
    const cleanCode = code.toUpperCase().trim();
    if (VALID_COUPONS[cleanCode]) {
      const coupon = VALID_COUPONS[cleanCode];
      setCouponCode(cleanCode);
      setCouponStatus('applied');
      
      if (coupon.type === 'percent') {
        setCouponDiscountPercent(coupon.value);
        setCouponMessage(`Promo code applied: ${coupon.description}!`);
      } else if (coupon.type === 'shipping') {
        setFreeShippingApplied(true);
        setCouponMessage(`Promo code applied: ${coupon.description}!`);
      }
      triggerNotification(`Coupon "${cleanCode}" applied successfully!`, 'success');
    } else {
      setCouponStatus('error');
      setCouponMessage('Invalid coupon code. Try HIGHMART10 or DISCOUNT20.');
      triggerNotification('Invalid coupon code entered.', 'error');
    }
  };

  // Price calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = cartItems.reduce((acc, item) => {
    const discount = item.discount || 0;
    const discountedPrice = item.price * (1 - discount / 100);
    return acc + (discountedPrice * item.quantity);
  }, 0);

  // Apply discount calculations
  const discountFromCoupon = (subtotal * couponDiscountPercent) / 100;
  
  // Flat delivery charge of ₹15.00, waived if subtotal > ₹200 or FREE SHIPPING coupon is active
  const deliveryCharges = (subtotal > 200 || freeShippingApplied || subtotal === 0) ? 0 : 15.00;
  
  // Estimated taxes: GST 18% of the net subtotal
  const gst = (subtotal - discountFromCoupon) * 0.18;
  
  const totalAmount = subtotal - discountFromCoupon + deliveryCharges + gst;

  const handleCheckout = () => {
    triggerNotification('Redirecting to checkout processing page...', 'success');
    setTimeout(() => {
      navigate('/dashboard'); // Link directly to final checkout dashboard
    }, 800);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="cart-page-wrapper section-padding">
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link>
          <span className="cart-breadcrumb-separator">&gt;</span>
          <span className="cart-breadcrumb-current">Cart</span>
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            {/* Header */}
            <div className="cart-page-header">
              <h1>Shopping Cart</h1>
              <span className="cart-items-count">
                You have <strong>{totalItemsCount}</strong> items in your cart
              </span>
            </div>

            {/* Layout Grid */}
            <div className="cart-layout-container">
              {/* Product Cards List */}
              <div className="cart-products-column">
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrease={handleIncreaseQuantity}
                    onDecrease={handleDecreaseQuantity}
                    onRemove={handleRemoveItem}
                    onSaveLater={handleSaveForLater}
                  />
                ))}
              </div>

              {/* Order Summary Panel */}
              <div className="cart-summary-column">
                <OrderSummary
                  subtotal={subtotal}
                  discount={discountFromCoupon}
                  delivery={deliveryCharges}
                  gst={gst}
                  total={totalAmount}
                  onCheckout={handleCheckout}
                  onContinue={handleContinueShopping}
                >
                  <CouponBox
                    onApplyCoupon={handleApplyCoupon}
                    couponStatus={couponStatus}
                    couponMessage={couponMessage}
                  />
                </OrderSummary>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
