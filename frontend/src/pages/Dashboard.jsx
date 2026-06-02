import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { User, LogOut, ShoppingCart, Heart, Package, Wallet, Trash2, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { cart, wishlist, removeFromCart, clearCart, toggleWishlist, addToCart, addToast } = useContext(AppContext);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  // Mock checkout trigger
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + (item.price * (1 - item.discount / 100)) * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      addToast('Your cart is empty.', 'info');
      return;
    }
    setIsCheckingOut(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderSuccess(true);
      addToast('Order placed successfully! Shipping partners notified.', 'success');
      clearCart();
      setTimeout(() => setOrderSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="dashboard-page-wrapper section-padding">
      <div className="dashboard-container">
        {/* Welcome Header Banner */}
        <div className="dashboard-welcome-banner glass-effect">
          <div className="welcome-banner-details">
            <div className="welcome-avatar-circle">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="welcome-banner-text">
              <h1>Hello, {currentUser?.name || 'Shopper'}</h1>
              <p>Welcome to your High Mart account hub. Track orders and manage checkouts.</p>
            </div>
          </div>
          <button onClick={handleLogout} className="dashboard-signout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Grid Overview */}
        <div className="dashboard-grid-layout">
          {/* Left Column: Stats & Profile Details */}
          <div className="dashboard-left-col">
            {/* Profile Info Card */}
            <div className="dashboard-widget glass-effect">
              <div className="widget-header">
                <User size={18} className="widget-icon" />
                <h3>Account Details</h3>
              </div>
              <ul className="widget-detail-list">
                <li>
                  <span className="detail-lbl">Full Name</span>
                  <span className="detail-val">{currentUser?.name}</span>
                </li>
                <li>
                  <span className="detail-lbl">Email Address</span>
                  <span className="detail-val">{currentUser?.email}</span>
                </li>
                <li>
                  <span className="detail-lbl">Mobile Number</span>
                  <span className="detail-val">+1 {currentUser?.phone ? `${currentUser.phone.substring(0,3)}-${currentUser.phone.substring(3,6)}-${currentUser.phone.substring(6)}` : 'N/A'}</span>
                </li>
              </ul>
            </div>

            {/* Wallet Info Card */}
            <div className="dashboard-widget glass-effect">
              <div className="widget-header">
                <Wallet size={18} className="widget-icon success" />
                <h3>High Mart Wallet</h3>
              </div>
              <div className="wallet-balance-box">
                <span className="wallet-amount">₹25,000.00</span>
                <span className="wallet-lbl">Available Credits</span>
              </div>
              <p className="wallet-promo-text">10% Cashbacks auto-applied on payments utilizing High Mart credits.</p>
            </div>

            {/* Mock Order Tracker Card */}
            <div className="dashboard-widget glass-effect">
              <div className="widget-header">
                <Package size={18} className="widget-icon primary" />
                <h3>Active Shipments</h3>
              </div>
              <div className="active-order-item">
                <div className="order-progress-icon"><span className="order-pulse"></span></div>
                <div className="order-tracker-info">
                  <h4>Order #HM-183920</h4>
                  <p>Status: Out for Delivery • ETA 2 Mins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cart Checkouts & Wishlist Items */}
          <div className="dashboard-right-col">
            {/* Cart Section */}
            <div className="dashboard-widget glass-effect">
              <div className="widget-header">
                <ShoppingCart size={18} className="widget-icon primary" />
                <h3>Shopping Cart ({cart.length} unique items)</h3>
              </div>

              {orderSuccess && (
                <div className="order-success-alert animate-fade-in">
                  <CheckCircle size={18} />
                  <span>Success! Your order has been placed. Transaction ID: HM-TX-{Math.floor(100000+Math.random()*900000)}</span>
                </div>
              )}

              {cart.length > 0 ? (
                <div className="cart-checkout-block">
                  <div className="cart-item-list">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item-row">
                        <div className="cart-item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="cart-item-desc">
                          <h4>{item.name}</h4>
                          <p>₹{(item.price * (1 - item.discount / 100)).toFixed(2)} x {item.quantity}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="cart-item-remove-btn"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="cart-checkout-summary">
                    <div className="summary-price-row">
                      <span>Total Amount:</span>
                      <span className="summary-total-amount">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleCheckout} 
                      className={`checkout-action-btn ${isCheckingOut ? 'checkout-loading' : ''}`}
                      disabled={isCheckingOut}
                    >
                      <CreditCard size={16} />
                      <span>{isCheckingOut ? 'Authorizing Payment...' : 'Secure Checkout'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="empty-widget-text">Your cart is currently empty. Visit the homepage to add products.</p>
              )}
            </div>

            {/* Wishlist Section */}
            <div className="dashboard-widget glass-effect">
              <div className="widget-header">
                <Heart size={18} className="widget-icon error" />
                <h3>My Wishlist ({wishlist.length} items)</h3>
              </div>

              {wishlist.length > 0 ? (
                <div className="wishlist-items-block">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-item-row">
                      <div className="wishlist-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="wishlist-desc">
                        <h4>{item.name}</h4>
                        <p>₹{(item.price * (1 - item.discount / 100)).toFixed(2)}</p>
                      </div>
                      <div className="wishlist-actions">
                        <button 
                          onClick={() => {
                            addToCart(item);
                            toggleWishlist(item); // Move to cart removes from wishlist
                          }}
                          className="wishlist-to-cart-btn"
                        >
                          Move to Cart
                        </button>
                        <button 
                          onClick={() => toggleWishlist(item)}
                          className="wishlist-remove-btn"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-widget-text">You have no items in your wishlist.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
