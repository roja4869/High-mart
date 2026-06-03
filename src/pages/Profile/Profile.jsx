import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { authService } from '../../services/authService';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import AddressCard from '../../components/AddressCard/AddressCard';
import OrderCard from '../../components/OrderCard/OrderCard';
import SettingsPanel from '../../components/SettingsPanel/SettingsPanel';

import {
  User, MapPin, ShoppingBag, Heart, Settings, LogOut, LayoutDashboard,
  ClipboardList, ShoppingCart, Loader2, ArrowRight, ShieldCheck, HeartOff
} from 'lucide-react';
import './Profile.css';

const MOCK_ORDER_SEED = [
  {
    orderId: '8215',
    date: '2026-05-24T12:00:00.000Z',
    productName: 'Wireless Over-Ear ANC Headphones',
    price: 129.99,
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    status: 'Delivered',
    paymentMethod: 'High Mart Wallet',
    shippingAddress: {
      name: 'Rishi Shopora',
      phone: '9876543210',
      street: 'Apt 4B, Harmony Towers, High Street',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    }
  },
  {
    orderId: '7034',
    date: '2026-05-30T15:30:00.000Z',
    productName: 'Minimalist Quartz Leather Watch',
    price: 79.99,
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    status: 'Processing',
    paymentMethod: 'Credit Card (Visa)',
    shippingAddress: {
      name: 'Rishi Shopora',
      phone: '9876543210',
      street: 'Apt 4B, Harmony Towers, High Street',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    }
  },
  {
    orderId: '6012',
    date: '2026-06-01T09:15:00.000Z',
    productName: 'Vintage Waterproof Canvas Backpack',
    price: 59.99,
    productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    status: 'Pending',
    paymentMethod: 'Net Banking',
    shippingAddress: {
      name: 'Rishi Shopora (Office)',
      phone: '9876543211',
      street: 'Level 8, Cyber Crest Block A, Tech Park Main Road',
      locality: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066'
    }
  },
  {
    orderId: '5511',
    date: '2026-04-18T14:20:00.000Z',
    productName: 'Premium Organic Almonds (1kg)',
    price: 14.99,
    productImage: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80',
    status: 'Cancelled',
    paymentMethod: 'High Mart Wallet',
    shippingAddress: {
      name: 'Rishi Shopora',
      phone: '9876543210',
      street: 'Apt 4B, Harmony Towers, High Street',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    }
  }
];

const Profile = () => {
  const { wishlist, toggleWishlist, addToCart, addToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Load User, Orders & Addresses data
  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Simulate skeleton loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Retrieve current logged in user
    const user = authService.getCurrentUser();
    if (user) {
      // Add mock fields if they don't exist
      if (!user.gender) user.gender = 'Male';
      if (!user.dob) user.dob = '1995-08-15';
      if (!user.bio) user.bio = 'Avid shopper & review contributor';
      setCurrentUser(user);
    } else {
      // Safety redirect
      navigate('/login');
    }

    // Seed mock orders
    const savedOrders = localStorage.getItem('highMartOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      localStorage.setItem('highMartOrders', JSON.stringify(MOCK_ORDER_SEED));
      setOrders(MOCK_ORDER_SEED);
    }

    // Load Addresses for overview display
    const savedAddresses = localStorage.getItem('highMartAddresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }

    return () => clearTimeout(timer);
  }, [navigate]);

  // Sync address changes when tab changes to dashboard overview
  useEffect(() => {
    if (activeTab === 'overview') {
      const savedAddresses = localStorage.getItem('highMartAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    }
  }, [activeTab]);

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleConfirmLogout = () => {
    authService.logout();
    addToast('Signed out successfully.', 'info');
    setShowLogoutModal(false);
    navigate('/login');
  };

  // Calculate Order Statistics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];

  // Renders the Loading Skeleton UI
  if (isLoading) {
    return (
      <div className="profile-page-wrapper section-padding">
        <div className="skeleton-container">
          <div className="skeleton-sidebar">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
          <div className="skeleton-main">
            <div className="skeleton-header"></div>
            <div className="skeleton-stats-grid">
              <div className="skeleton-stat-card"></div>
              <div className="skeleton-stat-card"></div>
              <div className="skeleton-stat-card"></div>
              <div className="skeleton-stat-card"></div>
            </div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper section-padding">
      <div className="profile-dashboard-layout">
        
        {/* Responsive Sidebar Navigation */}
        <aside className="profile-sidebar-nav glass-effect">
          <div className="sidebar-user-header">
            <div className="sidebar-avatar-circle">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="sidebar-avatar-img" />
              ) : (
                currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'
              )}
            </div>
            <h4>{currentUser?.name}</h4>
            <p>{currentUser?.email}</p>
          </div>
          
          <nav className="sidebar-nav-menu">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`sidebar-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab('personal')} 
              className={`sidebar-nav-btn ${activeTab === 'personal' ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Personal Details</span>
            </button>

            <button 
              onClick={() => setActiveTab('addresses')} 
              className={`sidebar-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            >
              <MapPin size={18} />
              <span>Manage Addresses</span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')} 
              className={`sidebar-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
              {pendingOrdersCount > 0 && <span className="pending-badge-sidebar">{pendingOrdersCount}</span>}
            </button>

            <button 
              onClick={() => setActiveTab('wishlist')} 
              className={`sidebar-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Heart size={18} />
              <span>My Wishlist</span>
              {wishlist.length > 0 && <span className="wishlist-count-badge">{wishlist.length}</span>}
            </button>

            <button 
              onClick={() => setActiveTab('settings')} 
              className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Account Settings</span>
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="sidebar-nav-btn logout-trigger"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Dynamic Content Display Panel */}
        <main className="profile-content-main">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="tab-panel-fade-in dashboard-overview-panel">
              {/* Profile Card & Header Section */}
              <ProfileCard 
                user={currentUser} 
                onUpdateUser={handleUpdateUser} 
                addToast={addToast} 
              />

              {/* Order Statistics Summary Section */}
              <div className="order-stats-grid">
                <div className="stat-card glass-effect card-total">
                  <div className="stat-icon-wrapper">
                    <ClipboardList size={22} />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-count">{totalOrdersCount}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                </div>

                <div className="stat-card glass-effect card-pending">
                  <div className="stat-icon-wrapper">
                    <Loader2 size={22} className="spinning-icon" />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-count">{pendingOrdersCount}</span>
                    <span className="stat-label">In-Transit / Pending</span>
                  </div>
                </div>

                <div className="stat-card glass-effect card-delivered">
                  <div className="stat-icon-wrapper">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-count">{deliveredOrdersCount}</span>
                    <span className="stat-label">Delivered Orders</span>
                  </div>
                </div>

                <div className="stat-card glass-effect card-cancelled">
                  <div className="stat-icon-wrapper">
                    <LogOut size={22} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div className="stat-meta">
                    <span className="stat-count">{cancelledOrdersCount}</span>
                    <span className="stat-label">Cancelled Orders</span>
                  </div>
                </div>
              </div>

              {/* Sub-grid: Recent Orders list preview & Default Address */}
              <div className="dashboard-subgrid">
                
                {/* Recent Orders List Preview (max 2) */}
                <div className="overview-recent-orders glass-effect">
                  <div className="widget-header-row">
                    <div className="widget-header">
                      <ShoppingBag size={18} className="widget-icon" />
                      <h3>Recent Orders</h3>
                    </div>
                    {orders.length > 2 && (
                      <button onClick={() => setActiveTab('orders')} className="btn-widget-link">
                        <span>View All</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                  <div className="overview-orders-list">
                    {orders.slice(0, 2).map(order => (
                      <OrderCard key={order.orderId} order={order} />
                    ))}
                    {orders.length === 0 && (
                      <div className="empty-widget-state">
                        <ShoppingBag size={32} />
                        <p>No orders placed yet. Happy shopping!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overview-quick-cards">
                  {/* Default Address Card */}
                  <div className="overview-default-address-widget glass-effect">
                    <div className="widget-header-row">
                      <div className="widget-header">
                        <MapPin size={18} className="widget-icon primary" />
                        <h3>Default Shipping</h3>
                      </div>
                      <button onClick={() => setActiveTab('addresses')} className="btn-widget-link">
                        <span>Edit</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                    {defaultAddr ? (
                      <div className="default-address-snapshot">
                        <div className="addr-header">
                          <strong>{defaultAddr.name}</strong>
                          <span className="tag-type-badge">{defaultAddr.type}</span>
                        </div>
                        <p className="addr-text">{defaultAddr.street}, {defaultAddr.locality && `${defaultAddr.locality}, `}{defaultAddr.city}, {defaultAddr.state} - {defaultAddr.pincode}</p>
                        <p className="addr-phone">Phone: {defaultAddr.phone}</p>
                      </div>
                    ) : (
                      <div className="empty-widget-state">
                        <MapPin size={24} />
                        <p>No delivery address saved.</p>
                        <button onClick={() => setActiveTab('addresses')} className="btn-widget-action">Add Address</button>
                      </div>
                    )}
                  </div>

                  {/* Wishlist Summary Card */}
                  <div className="overview-wishlist-widget glass-effect">
                    <div className="widget-header-row">
                      <div className="widget-header">
                        <Heart size={18} className="widget-icon error" />
                        <h3>Wishlist Summary</h3>
                      </div>
                      {wishlist.length > 0 && (
                        <button onClick={() => setActiveTab('wishlist')} className="btn-widget-link">
                          <span>Quick View</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                    <div className="wishlist-summary-stats">
                      <span className="count-stat-large">{wishlist.length}</span>
                      <span className="count-label">Items currently liked</span>
                    </div>
                    {wishlist.length > 0 ? (
                      <div className="wishlist-thumbnails-row">
                        {wishlist.slice(0, 3).map(item => (
                          <div key={item.id} className="wishlist-thumb-box" title={item.name}>
                            <img src={item.image || (item.images && item.images[0])} alt={item.name} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="wishlist-desc-empty">Your wishlist is empty. Add items to track them here!</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="tab-panel-fade-in">
              <ProfileCard 
                user={currentUser} 
                onUpdateUser={handleUpdateUser} 
                addToast={addToast} 
              />
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="tab-panel-fade-in">
              <AddressCard addToast={addToast} />
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="tab-panel-fade-in orders-list-detailed-panel">
              <div className="widget-header">
                <ShoppingBag size={18} className="widget-icon" />
                <h3>All Orders History</h3>
              </div>
              <div className="detailed-orders-list-box">
                {orders.map(order => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
                {orders.length === 0 && (
                  <div className="empty-detailed-state glass-effect">
                    <ShoppingBag size={48} />
                    <h4>No Orders Found</h4>
                    <p>Looks like you haven't placed any orders yet. Visit our shop categories to find products.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="tab-panel-fade-in wishlist-detailed-panel">
              <div className="widget-header">
                <Heart size={18} className="widget-icon error" />
                <h3>My Saved Wishlist ({wishlist.length} items)</h3>
              </div>
              
              {wishlist.length > 0 ? (
                <div className="wishlist-grid-cards">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-grid-item glass-effect">
                      <div className="item-img-container">
                        <img src={item.image || (item.images && item.images[0])} alt={item.name} />
                        <button 
                          onClick={() => toggleWishlist(item)} 
                          className="wishlist-remove-float-btn" 
                          title="Remove from wishlist"
                          aria-label="Remove item"
                        >
                          <HeartOff size={16} />
                        </button>
                      </div>
                      <div className="item-text-container">
                        <h4>{item.name}</h4>
                        <p className="item-brand">{item.brand}</p>
                        <div className="item-pricing-action-row">
                          <div className="pricing">
                            <span className="price-now">₹{(item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}</span>
                            {item.discount > 0 && <span className="price-old">₹{item.price.toFixed(2)}</span>}
                          </div>
                          <button 
                            onClick={() => {
                              addToCart(item);
                              toggleWishlist(item); // Move to cart removes from wishlist
                            }} 
                            className="btn-add-cart-wishlist"
                          >
                            <ShoppingCart size={13} />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-detailed-state glass-effect">
                  <Heart size={48} className="text-error animate-float" />
                  <h4>Wishlist is Empty</h4>
                  <p>Keep track of products you love by clicking the heart icons on product details.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-panel-fade-in">
              <SettingsPanel />
            </div>
          )}

        </main>
      </div>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-box glass-effect animate-fade-in">
            <div className="logout-modal-header">
              <div className="logout-icon-danger">
                <LogOut size={24} />
              </div>
              <h3>Confirm Log Out</h3>
            </div>
            <p className="logout-modal-text">Are you sure you want to log out of High Mart? You will need to enter your credentials to log in again.</p>
            <div className="logout-modal-actions">
              <button onClick={() => setShowLogoutModal(false)} className="btn-logout-cancel">
                <span>Cancel</span>
              </button>
              <button onClick={handleConfirmLogout} className="btn-logout-confirm">
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
