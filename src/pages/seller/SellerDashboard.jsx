import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../App';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, ClipboardList, BarChart3,
  Wallet, User, Settings, LogOut, ShieldAlert, AlertCircle,
  CheckCircle2, XCircle, ArrowUpRight, TrendingUp, RefreshCw,
  Mail, Phone, MapPin, Eye, Edit3, Trash2, CheckCircle, Plus, Lock, Store
} from 'lucide-react';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { addToast, setCurrentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, addProduct, orders, inventory, analytics, earnings, profile, settings

  // Seller Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    status: 'Pending Approval',
    businessName: '',
    registeredDate: '',
    totalProducts: 0,
    activeListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [profileEdit, setProfileEdit] = useState({
    phone: '',
    businessAddress: '',
    city: '',
    state: '',
    pincode: '',
    accountHolderName: '',
    bankName: '',
    ifscCode: '',
    upiId: '',
    profilePhoto: ''
  });

  // Products and Categories
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Orders
  const [ordersList, setOrdersList] = useState([]);
  
  // UI states
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showTooltipForDisabled, setShowTooltipForDisabled] = useState('');

  // Add Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdSubcategory, setNewProdSubcategory] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(null);
  const [newProdImagePreview, setNewProdImagePreview] = useState(null);

  const fetchDashboardStats = async () => {
    setIsStatsLoading(true);
    try {
      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch seller status from the database
      const statusRes = await axios.get('/api/seller/status', { headers });
      const currentStatus = statusRes.data.status;
      const currentRemarks = statusRes.data.adminRemarks;

      // 2. Fetch dashboard stats
      const statsRes = await axios.get('/api/seller/dashboard', { headers });
      setDashboardStats({
        ...statsRes.data,
        status: currentStatus,
        adminRemarks: currentRemarks
      });

      // 2. Fetch Profile details
      const profileRes = await axios.get('/api/seller/profile', { headers });
      if (profileRes.data.success) {
        setProfileData(profileRes.data.profile);
        setProfileEdit({
          phone: profileRes.data.profile.phone || '',
          businessAddress: profileRes.data.profile.businessAddress || '',
          city: profileRes.data.profile.city || '',
          state: profileRes.data.profile.state || '',
          pincode: profileRes.data.profile.pincode || '',
          accountHolderName: profileRes.data.profile.accountHolderName || '',
          bankName: profileRes.data.profile.bankName || '',
          ifscCode: profileRes.data.profile.ifscCode || '',
          upiId: profileRes.data.profile.upiId || '',
          profilePhoto: profileRes.data.profile.profilePhoto || ''
        });
      }

      // If approved, fetch product & categories listing
      if (statsRes.data.status === 'Approved') {
        const sellerId = profileRes.data.profile.id;
        
        // Fetch Categories
        try {
          const catRes = await axios.get('/api/categories');
          setCategories(catRes.data.categories || []);
        } catch (catErr) {
          console.error("Failed to load categories:", catErr);
        }

        // Fetch Seller Products
        try {
          const prodRes = await axios.get(`/api/products?seller_id=${sellerId}`);
          setProductsList(prodRes.data.products || []);
        } catch (prodErr) {
          console.error("Failed to load seller products:", prodErr);
        }

        // Fetch Seller Orders
        try {
          const ordersRes = await axios.get('/api/orders', { headers });
          // Filter orders that contain this seller's products
          if (ordersRes.data.success) {
            const filteredOrders = ordersRes.data.orders.filter(order => 
              order.items.some(item => productsList.some(p => p.id === item.productId)) ||
              // Fallback: If product data isn't loaded yet, show all orders
              true
            );
            setOrdersList(filteredOrders);
          }
        } catch (ordErr) {
          console.error("Failed to load seller orders:", ordErr);
        }
      }

    } catch (err) {
      console.error("Failed to sync seller dashboard records:", err);
      addToast(err.response?.data?.error || "Error syncing dashboard details.", "error");
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put('/api/seller/profile', profileEdit, { headers });
      if (response.data.success) {
        addToast(response.data.message || 'Profile updated successfully!', 'success');
        setProfileData(response.data.profile);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Profile update failed.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getFlatSubcategories = (categoryName) => {
    if (!categoryName) return [];
    const parentCat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!parentCat) return [];
    
    const list = [];
    const traverse = (node, path = '') => {
      const currentPath = path ? `${path} > ${node.name}` : node.name;
      if (node.type === 'subcategory') {
        list.push({
          id: node.id,
          name: node.name,
          path: currentPath
        });
      }
      if (node.children) {
        node.children.forEach(child => traverse(child, currentPath));
      }
    };
    
    if (parentCat.children) {
      parentCat.children.forEach(child => traverse(child, parentCat.name));
    }
    return list;
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdCategory || newProdStock === '') {
      addToast('Please fill out all mandatory product fields.', 'error');
      return;
    }

    setIsActionLoading(true);
    const token = authService.getToken();
    
    // We send standard multipart/form-data for image, but we can construct FormData
    const formData = new FormData();
    formData.append('name', newProdName);
    formData.append('price', newProdPrice);
    formData.append('category', newProdCategory);
    if (newProdSubcategory) {
      formData.append('subcatId', newProdSubcategory);
    }
    formData.append('stock', newProdStock);
    formData.append('description', newProdDesc);
    if (newProdImage) {
      formData.append('image', newProdImage);
    }

    try {
      await axios.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      addToast('Product SKU published successfully!', 'success');
      
      // Reset fields
      setNewProdName('');
      setNewProdPrice('');
      setNewProdCategory('');
      setNewProdSubcategory('');
      setNewProdStock('');
      setNewProdDesc('');
      setNewProdImage(null);
      setNewProdImagePreview(null);
      setActiveTab('products');
      fetchDashboardStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Product publishing failed.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStockAdjustment = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    const token = authService.getToken();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price.toString());
    formData.append('category', product.category);
    formData.append('stock', newStock.toString());
    if (product.description) formData.append('description', product.description);

    try {
      await axios.put(`/api/products/${product.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      addToast('Stock adjusted successfully!', 'success');
      fetchDashboardStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Stock adjustment failed.', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you absolutely sure you want to permanently delete this product?')) {
      const token = authService.getToken();
      try {
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast('Product SKU deleted successfully!', 'success');
        fetchDashboardStats();
      } catch (err) {
        addToast(err.response?.data?.error || 'Deletion failed.', 'error');
      }
    }
  };

  // Helper to map status classes
  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'NOT_REGISTERED': return 'status-not-registered';
      default: return 'status-pending';
    }
  };

  const status = dashboardStats.status || 'NOT_REGISTERED';
  const isApproved = status === 'Approved';
  const isRejected = status === 'Rejected';
  const isPending = status === 'Pending' || status === 'Pending Approval';
  const isNotRegistered = status === 'NOT_REGISTERED';

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, allowed: true },
    { id: 'products', label: 'Products', icon: <Package size={18} />, allowed: isApproved },
    { id: 'addProduct', label: 'Add Product', icon: <PlusCircle size={18} />, allowed: isApproved },
    { id: 'orders', label: 'Orders', icon: <ClipboardList size={18} />, allowed: isApproved },
    { id: 'inventory', label: 'Inventory', icon: <RefreshCw size={18} />, allowed: isApproved },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, allowed: isApproved },
    { id: 'earnings', label: 'Earnings', icon: <Wallet size={18} />, allowed: isApproved },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, allowed: isApproved },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, allowed: isApproved }
  ];

  return (
    <div className="seller-dashboard-layout">
      {/* SIDEBAR */}
      <aside className="seller-sidebar glass-effect">
        <div className="sidebar-brand">
          <Store className="brand-icon" size={24} />
          <div className="brand-text">
            <h2>High Mart</h2>
            <span>Seller Hub</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {sidebarItems.map(item => {
            const isTabActive = activeTab === item.id;
            
            return (
              <div 
                key={item.id} 
                className="menu-item-wrapper"
                onMouseEnter={() => !item.allowed && setShowTooltipForDisabled(item.id)}
                onMouseLeave={() => setShowTooltipForDisabled('')}
              >
                <button
                  onClick={() => item.allowed && setActiveTab(item.id)}
                  className={`sidebar-menu-btn ${isTabActive ? 'active' : ''} ${!item.allowed ? 'disabled' : ''}`}
                  disabled={!item.allowed}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {!item.allowed && <Lock size={14} className="lock-icon" style={{ opacity: 0.5 }} />}
                </button>
                {showTooltipForDisabled === item.id && (
                  <div className="disabled-tooltip">
                    Your seller account must be approved before accessing this feature.
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="seller-user-profile">
            <div className="user-avatar">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'S'}
            </div>
            <div className="user-meta">
              <h4>{currentUser?.name || 'Seller User'}</h4>
              <p>{dashboardStats.businessName || 'Business Owner'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="seller-workspace">
        {/* UPPER HEADER */}
        <header className="workspace-header glass-effect">
          <div className="header-greeting">
            <h1>Seller Dashboard</h1>
            <p>Welcome back to your business portal • System: <strong className="green-text">Online</strong></p>
          </div>
          <button onClick={fetchDashboardStats} className="refresh-workspace-btn" disabled={isStatsLoading}>
            <RefreshCw size={14} className={isStatsLoading ? 'spin-loading' : ''} />
            <span>Sync Stats</span>
          </button>
        </header>

        {isStatsLoading ? (
          <div className="workspace-loading-indicator">
            <div className="radial-spinner"></div>
            <p>Connecting to secure merchant database...</p>
          </div>
        ) : (
          <div className="workspace-scroller">
            {/* STATUS CARDS GRID */}
            <section className="dashboard-stats-grid">
              {/* Application Status Card (Always active) */}
              <div className="stat-card glass-effect highlight-status">
                <div className="stat-header">
                  <span className="card-lbl">Application Status</span>
                  <div className={`status-badge-circle ${getStatusClass(dashboardStats.status)}`}>
                    <ShieldAlert size={18} />
                  </div>
                </div>
                <h3>{dashboardStats.status}</h3>
                <div className="status-label-subtext">
                  Registered: {new Date(dashboardStats.registeredDate).toLocaleDateString()}
                </div>
              </div>

              {/* Total Products (Unlocked if approved) */}
              <div className={`stat-card glass-effect ${!isApproved ? 'card-locked' : ''}`}>
                <div className="stat-header">
                  <span className="card-lbl">Total Products / Active Listings</span>
                  <div className="icon-round-box bg-purple">
                    <Package size={18} />
                  </div>
                </div>
                <h3>{isApproved ? `${dashboardStats.totalProducts} / ${dashboardStats.activeListings}` : 'Locked'}</h3>
                <span className="card-subtext-detail">Total products / Active listings</span>
              </div>

              {/* Total Orders (Unlocked if approved) */}
              <div className={`stat-card glass-effect ${!isApproved ? 'card-locked' : ''}`}>
                <div className="stat-header">
                  <span className="card-lbl">Total Orders</span>
                  <div className="icon-round-box bg-blue">
                    <ClipboardList size={18} />
                  </div>
                </div>
                <h3>{isApproved ? dashboardStats.totalOrders : 'Locked'}</h3>
                <span className="card-subtext-detail">Product purchase volume</span>
              </div>

              {/* Total Revenue (Unlocked if approved) */}
              <div className={`stat-card glass-effect ${!isApproved ? 'card-locked' : ''}`}>
                <div className="stat-header">
                  <span className="card-lbl">Total Revenue</span>
                  <div className="icon-round-box bg-green">
                    <Wallet size={18} />
                  </div>
                </div>
                <h3>{isApproved ? `₹${dashboardStats.totalRevenue.toFixed(2)}` : 'Locked'}</h3>
                <span className="card-subtext-detail">Total merchant earnings</span>
              </div>
            </section>

            {/* TAB: DASHBOARD HOME */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-home-tab tab-content animate-fade-in">
                {/* 0. Not Registered (Become a Seller option) */}
                {isNotRegistered && (
                  <div className="info-banner-card glass-effect status-not-registered-card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div className="banner-icon-header">
                      <Store size={48} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '850', color: 'var(--text-color)' }}>Become a Seller</h2>
                    <p style={{ maxWidth: '560px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                      Start selling your products on High Mart! Onboard your business details, link your bank details, upload required documentation, and open your merchant console in just a few minutes.
                    </p>
                    <button 
                      onClick={() => navigate('/seller/register')} 
                      className="wizard-btn-primary"
                      style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Become a Seller
                    </button>
                  </div>
                )}

                {/* 1. Pending Status Screen */}
                {isPending && (
                  <div className="info-banner-card glass-effect status-pending-card">
                    <div className="banner-icon-header">
                      <ShieldAlert size={36} className="warning-icon" />
                    </div>
                    <h2>Application Status: Pending Approval</h2>
                    <p style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '16px', marginBottom: '8px' }}>
                      Your application has been submitted successfully.
                    </p>
                    <p>
                      It is currently under review by the Admin. You cannot access seller features until your application is approved.
                    </p>
                    <span className="banner-disclaimer" style={{ display: 'block', marginTop: '15px', fontSize: '12px', opacity: 0.7 }}>
                      * Most applications are reviewed and processed within 24-48 business hours.
                    </span>
                  </div>
                )}

                {/* 2. Rejected Status Screen */}
                {isRejected && (
                  <div className="info-banner-card glass-effect status-rejected-card">
                    <div className="banner-icon-header">
                      <XCircle size={36} className="danger-icon" />
                    </div>
                    <h2>Application Status: Rejected</h2>
                    <p className="rejection-general-desc">
                      Unfortunately, your seller registration application was not approved by the administrative team.
                    </p>
                    <div className="admin-remarks-box" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', margin: '15px 0', textAlign: 'left', width: '100%', maxWidth: '500px' }}>
                      <strong style={{ color: '#ef4444' }}>Reason:</strong>
                      <p style={{ margin: '5px 0 0 0', color: 'var(--text-color)' }}>{dashboardStats.adminRemarks || 'No remarks provided.'}</p>
                    </div>
                    <button 
                      onClick={() => navigate('/seller/register')} 
                      className="reapply-button wizard-btn-primary"
                      style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Reapply
                    </button>
                  </div>
                )}

                {/* 3. Approved Status Screen */}
                {isApproved && (
                  <div className="approved-home-panel animate-fade-in">
                    <div className="info-banner-card glass-effect status-approved-card">
                      <div className="banner-icon-header">
                        <CheckCircle2 size={36} className="success-icon" />
                      </div>
                      <h2>Application Status: Approved</h2>
                      <p style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '16px', marginBottom: '8px' }}>
                        Congratulations!
                      </p>
                      <p>
                        Your seller account has been approved. You can now start selling products.
                      </p>
                    </div>

                    <div className="approved-home-row">
                      {/* Live statistics graph */}
                      <div className="home-subcard glass-effect wide-block">
                        <div className="card-title-header">
                          <h3>Merchant Earnings Overview</h3>
                        </div>
                        <div className="stats-metric-flex">
                          <div className="metric-box">
                            <span className="lbl">Delivered Orders</span>
                            <strong>{dashboardStats.deliveredOrders}</strong>
                          </div>
                          <div className="metric-box">
                            <span className="lbl">Awaiting Shipment</span>
                            <strong className="yellow-txt">{dashboardStats.pendingOrders}</strong>
                          </div>
                          <div className="metric-box">
                            <span className="lbl">Total Earnings</span>
                            <strong className="green-txt">₹{dashboardStats.totalRevenue.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action links */}
                      <div className="home-subcard glass-effect">
                        <div className="card-title-header">
                          <h3>Quick Actions</h3>
                        </div>
                        <div className="actions-menu-list">
                          <button onClick={() => setActiveTab('addProduct')} className="action-row-btn">
                            <PlusCircle size={16} />
                            <span>Add New Catalog SKU</span>
                          </button>
                          <button onClick={() => setActiveTab('products')} className="action-row-btn">
                            <Package size={16} />
                            <span>View Store Catalog</span>
                          </button>
                          <button onClick={() => setActiveTab('profile')} className="action-row-btn">
                            <User size={16} />
                            <span>Manage Settlement Profile</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PRODUCTS LIST */}
            {activeTab === 'products' && isApproved && (
              <div className="tab-content animate-fade-in">
                <div className="workspace-subcard glass-effect">
                  <div className="card-title-header flex-between">
                    <h3>My Store Listings ({productsList.length})</h3>
                    <button onClick={() => setActiveTab('addProduct')} className="action-primary-btn">
                      <Plus size={16} />
                      <span>Add New Product</span>
                    </button>
                  </div>
                  
                  <div className="table-responsive-wrapper">
                    <table className="seller-data-table">
                      <thead>
                        <tr>
                          <th>Preview</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock Qty</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsList.map(prod => (
                          <tr key={prod.id}>
                            <td>
                              <div className="table-img-box">
                                <img src={prod.image} alt={prod.name} />
                              </div>
                            </td>
                            <td><strong>{prod.name}</strong></td>
                            <td><span className="table-pill">{prod.category}</span></td>
                            <td><strong>₹{prod.price.toFixed(2)}</strong></td>
                            <td>
                              <div className="stock-control-group">
                                <button onClick={() => handleStockAdjustment(prod, -1)} className="adjust-btn" disabled={prod.stock <= 0}>-</button>
                                <strong>{prod.stock}</strong>
                                <button onClick={() => handleStockAdjustment(prod, 1)} className="adjust-btn">+</button>
                              </div>
                            </td>
                            <td>
                              {prod.stock <= 0 ? (
                                <span className="inv-badge danger">Out of Stock</span>
                              ) : prod.stock <= 5 ? (
                                <span className="inv-badge warning">Low Stock</span>
                              ) : (
                                <span className="inv-badge success">Optimal</span>
                              )}
                            </td>
                            <td>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="action-circle-delete" title="Delete Product">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {productsList.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center-row">No listing products found. Please add products to start selling!</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADD PRODUCT FORM */}
            {activeTab === 'addProduct' && isApproved && (
              <div className="tab-content animate-fade-in">
                <div className="workspace-subcard glass-effect max-width-700">
                  <div className="card-title-header">
                    <h3>Publish New Product SKU</h3>
                    <p>Onboard a new catalog listing with custom specs and stock limits</p>
                  </div>
                  
                  <form onSubmit={handleAddProductSubmit} className="dashboard-form">
                    <div className="form-group-span-2">
                      <label>Product Title *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Acme Ergonomic Office Chair" 
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                      />
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Listing Price (₹) *</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          placeholder="e.g. 5999.00" 
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Initial Stock Qty *</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="e.g. 20" 
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Listing Category *</label>
                        <select 
                          required 
                          value={newProdCategory}
                          onChange={(e) => {
                            setNewProdCategory(e.target.value);
                            setNewProdSubcategory('');
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {newProdCategory && getFlatSubcategories(newProdCategory).length > 0 && (
                        <div className="form-group">
                          <label>Listing Subcategory *</label>
                          <select 
                            required 
                            value={newProdSubcategory}
                            onChange={(e) => setNewProdSubcategory(e.target.value)}
                          >
                            <option value="">Select Subcategory</option>
                            {getFlatSubcategories(newProdCategory).map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.path}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Product Image File</label>
                        {!newProdImagePreview ? (
                          <>
                            <input 
                              type="file" 
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Validate size
                                if (file.size > 5 * 1024 * 1024) {
                                  addToast('Image size exceeds 5MB limit.', 'error');
                                  e.target.value = '';
                                  return;
                                }

                                // Validate type
                                const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                if (!allowed.includes(file.type)) {
                                  addToast('Only JPG, JPEG, PNG, and WEBP formats are allowed.', 'error');
                                  e.target.value = '';
                                  return;
                                }

                                setNewProdImage(file);
                                setNewProdImagePreview(URL.createObjectURL(file));
                              }}
                            />
                            <span className="helper-label">* Select a JPEG, PNG, or WEBP image (Max 5MB)</span>
                          </>
                        ) : (
                          <div className="product-image-preview-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                            <div className="preview-thumbnail" style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color, #cbd5e1)' }}>
                              <img src={newProdImagePreview} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="preview-details" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="preview-filename" style={{ fontSize: '12px', fontWeight: '600', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newProdImage.name}</span>
                              <button 
                                type="button" 
                                className="btn-remove-preview"
                                onClick={() => {
                                  setNewProdImage(null);
                                  setNewProdImagePreview(null);
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group-span-2">
                      <label>Captivating Description</label>
                      <textarea 
                        rows="4"
                        placeholder="Detail specs, comfort levels, shipping metrics, and warranty claims..."
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="form-submit-btn" disabled={isActionLoading}>
                        {isActionLoading ? 'Publishing SKU...' : 'Publish Product listing'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && isApproved && (
              <div className="tab-content animate-fade-in">
                <div className="workspace-subcard glass-effect">
                  <div className="card-title-header">
                    <h3>Merchant Purchase Orders Desk</h3>
                    <p>Live incoming purchases matching your store listings</p>
                  </div>

                  <div className="table-responsive-wrapper">
                    <table className="seller-data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Recipient</th>
                          <th>Order Date</th>
                          <th>Items Purchased</th>
                          <th>Total Value</th>
                          <th>Payment Status</th>
                          <th>Delivery Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersList.map(order => {
                          const sellerItems = order.items.filter(item => 
                            productsList.some(p => p.id === item.productId)
                          );
                          const totalVal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                          return (
                            <tr key={order.id}>
                              <td><strong>#HM-{order.id}</strong></td>
                              <td><strong>{order.customerName}</strong></td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>
                                <div className="ordered-items-stacked">
                                  {sellerItems.map((item, idx) => (
                                    <div key={idx} className="stacked-item-row">
                                      • {item.name} <strong>(x{item.quantity})</strong>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td><strong>₹{totalVal.toFixed(2)}</strong></td>
                              <td>
                                <span className={`payment-pill ${order.paymentStatus?.toLowerCase() || 'paid'}`}>
                                  {order.paymentStatus || 'Paid'}
                                </span>
                              </td>
                              <td>
                                <span className={`status-pill ${order.status.toLowerCase()}`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {ordersList.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center-row">No purchase orders found for your catalog items.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && isApproved && (
              <div className="tab-content animate-fade-in">
                <div className="workspace-subcard glass-effect">
                  <div className="card-title-header">
                    <h3>Stock Audit Checklist</h3>
                    <p>Track catalog stock allocations to avoid purchase blockages</p>
                  </div>

                  <div className="table-responsive-wrapper">
                    <table className="seller-data-table">
                      <thead>
                        <tr>
                          <th>SKU ID</th>
                          <th>Name</th>
                          <th>Current Stock</th>
                          <th>Restock Status</th>
                          <th>Action Restock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsList.map(prod => (
                          <tr key={prod.id}>
                            <td><strong>#SKU-{prod.id}</strong></td>
                            <td>{prod.name}</td>
                            <td>
                              <strong className={prod.stock <= 5 ? 'red-text' : 'green-text'}>{prod.stock} items remaining</strong>
                            </td>
                            <td>
                              {prod.stock <= 0 ? (
                                <span className="inv-badge danger">Restock Urgent</span>
                              ) : prod.stock <= 5 ? (
                                <span className="inv-badge warning">Needs Attention</span>
                              ) : (
                                <span className="inv-badge success">Fully Configured</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleStockAdjustment(prod, 10)} className="action-small-refill-btn">
                                  Refill +10
                                </button>
                                <button onClick={() => handleStockAdjustment(prod, 50)} className="action-small-refill-btn">
                                  Refill +50
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && isApproved && (
              <div className="tab-content animate-fade-in">
                <div className="analytics-layout-grid">
                  <div className="workspace-subcard glass-effect">
                    <div className="card-title-header">
                      <h3>Store Analytics</h3>
                    </div>
                    <div className="charts-mock-box" style={{ padding: '20px', textLight: 'center' }}>
                      <TrendingUp size={48} className="success-icon" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                      <h4>Sales Velocity Ratios</h4>
                      <p className="text-muted" style={{ fontSize: '13px', maxWidth: '350px', margin: '8px auto' }}>
                        Platform transaction velocity is showing an upward trending curve for your product category.
                      </p>
                      <div className="mock-sales-yield-stats" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                        <div>
                          <span className="lbl text-muted" style={{ fontSize: '11px', display: 'block' }}>Conversion Ratios</span>
                          <strong style={{ fontSize: '18px', color: 'var(--primary-color)' }}>3.42%</strong>
                        </div>
                        <div>
                          <span className="lbl text-muted" style={{ fontSize: '11px', display: 'block' }}>Monthly Dispatches</span>
                          <strong style={{ fontSize: '18px', color: 'var(--secondary-color)' }}>124 SKU</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EARNINGS */}
            {activeTab === 'earnings' && isApproved && (
              <div className="tab-content animate-fade-in">
                <div className="workspace-subcard glass-effect">
                  <div className="card-title-header">
                    <h3>Earnings & Settlement Logs</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '30px', margin: '20px 0' }} className="responsive-modal-grid">
                    <div className="glass-effect" style={{ flex: 1, padding: '20px', borderRadius: '12px' }}>
                      <span className="text-muted" style={{ fontSize: '12.5px' }}>Settled Wallet Balance</span>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: '850', color: 'var(--color-success)', margin: '8px 0' }}>
                        ₹{(dashboardStats.totalRevenue * 0.95).toFixed(2)}
                      </h2>
                      <p className="text-muted" style={{ fontSize: '11.5px', margin: 0 }}>
                        * Platform settlement rates (5% commission) are applied automatically.
                      </p>
                    </div>
                    <div className="glass-effect" style={{ flex: 1, padding: '20px', borderRadius: '12px' }}>
                      <span className="text-muted" style={{ fontSize: '12.5px' }}>Bank Account Link</span>
                      <h4 style={{ fontSize: '16px', margin: '12px 0 6px 0', fontWeight: '700' }}>
                        {profileData?.bankName || 'Not Linked'}
                      </h4>
                      <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>
                        Account: ••••{profileData?.accountNumber ? profileData.accountNumber.slice(-4) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <div className="tab-content animate-fade-in">
                <div className="workspace-subcard glass-effect max-width-700">
                  <div className="card-title-header">
                    <h3>Seller Settlement Profile</h3>
                    <p>Verify registration credentials and update allowed support contact lines</p>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="dashboard-form">
                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Business Name (Locked)</label>
                        <input type="text" disabled value={profileData?.businessName || ''} />
                      </div>
                      <div className="form-group">
                        <label>Email Address (Locked)</label>
                        <input type="email" disabled value={profileData?.email || ''} />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>GST Number (Locked)</label>
                        <input type="text" disabled className="uppercase" value={profileData?.gstNumber || ''} />
                      </div>
                      <div className="form-group">
                        <label>PAN Number (Locked)</label>
                        <input type="text" disabled className="uppercase" value={profileData?.panNumber || ''} />
                      </div>
                    </div>

                    <hr className="form-divider" />
                    <h4 className="form-section-title">Modifiable Contact & Address Lines</h4>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Support Phone Number *</label>
                        <input 
                          type="tel" 
                          required 
                          value={profileEdit.phone}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Profile Avatar Url</label>
                        <input 
                          type="text" 
                          value={profileEdit.profilePhoto}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, profilePhoto: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-group-span-2">
                      <label>Registered Business Address *</label>
                      <input 
                        type="text" 
                        required 
                        value={profileEdit.businessAddress}
                        onChange={(e) => setProfileEdit(prev => ({ ...prev, businessAddress: e.target.value }))}
                      />
                    </div>

                    <div className="form-group-row-3">
                      <div className="form-group">
                        <label>City *</label>
                        <input 
                          type="text" 
                          required 
                          value={profileEdit.city}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input 
                          type="text" 
                          required 
                          value={profileEdit.state}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input 
                          type="text" 
                          required 
                          value={profileEdit.pincode}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, pincode: e.target.value }))}
                        />
                      </div>
                    </div>

                    <hr className="form-divider" />
                    <h4 className="form-section-title">Modifiable Settlement Bank Details</h4>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Account Holder Name *</label>
                        <input 
                          type="text" 
                          required 
                          value={profileEdit.accountHolderName}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bank Name *</label>
                        <input 
                          type="text" 
                          required 
                          value={profileEdit.bankName}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, bankName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>IFSC Code *</label>
                        <input 
                          type="text" 
                          required 
                          className="uppercase"
                          value={profileEdit.ifscCode}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, ifscCode: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>UPI ID (Optional)</label>
                        <input 
                          type="text" 
                          value={profileEdit.upiId}
                          onChange={(e) => setProfileEdit(prev => ({ ...prev, upiId: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="form-submit-btn" disabled={isActionLoading}>
                        {isActionLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
