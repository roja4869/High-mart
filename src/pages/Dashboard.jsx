import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { User, LogOut, ShoppingCart, Heart, Package, Wallet, Trash2, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import CheckoutModal from '../srinivas/CheckoutModal';
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

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [ordersList, setOrdersList] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = async () => {
    if (authService.isAuthenticated()) {
      setIsLoadingOrders(true);
      try {
        const response = await orderService.getOrders();
        if (response.success) {
          setOrdersList(response.orders);
        }
      } catch (error) {
        console.error('Failed to load orders from backend:', error.message);
      } finally {
        setIsLoadingOrders(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cartTotal = cart.reduce((total, item) => {
    const discount = item.discount || 0;
    return total + (item.price * (1 - discount / 100)) * item.quantity;
  }, 0);

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

            {/* Order Tracker Card */}
            <div className="dashboard-widget glass-effect">
              <div className="widget-header">
                <Package size={18} className="widget-icon primary" />
                <h3>Active Shipments ({ordersList.length})</h3>
              </div>
              {ordersList.length > 0 ? (
                <div className="active-orders-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {ordersList.map(order => (
                    <div key={order.id} className="active-order-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <div className="order-progress-icon">
                        <span className={order.status === 'Cancelled' ? 'order-pulse-cancelled' : 'order-pulse'}></span>
                      </div>
                      <div className="order-tracker-info" style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0 }}>Order #HM-00{order.id}</h4>
                          <span style={{ fontSize: '11px', opacity: 0.6 }}>₹{order.totalAmount}</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                          Status: <strong style={{ color: order.status === 'Cancelled' ? '#ef4444' : '#10b981' }}>{order.status}</strong>
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          To: {order.shippingAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-widget-text">No active shipments found. Place an order to begin tracking.</p>
              )}
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
                      onClick={() => setCheckoutModalOpen(true)} 
                      className="checkout-action-btn"
                    >
                      <CreditCard size={16} />
                      <span>Secure Checkout</span>
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
      <CheckoutModal 
        isOpen={checkoutModalOpen} 
        onClose={() => {
          setCheckoutModalOpen(false);
          fetchOrders();
        }} 
        cartItems={cart}
        cartTotal={cartTotal}
      />
    </div>
  );
};

export default Dashboard;
