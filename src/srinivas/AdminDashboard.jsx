import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { adminService } from './adminService';
import { authService } from '../services/authService';
import { categoryService } from '../services/categoryService';
import { AppContext } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, Plus, Search, Trash2, Edit3, ShieldAlert, ShoppingBag, 
  Users, DollarSign, Package, ClipboardList, LogOut, ArrowUpRight, 
  Grid, RefreshCw, AlertTriangle, UserCheck, Eye, ChevronDown, CheckCircle, X,
  Store, Download, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { addToast, setCurrentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const location = useLocation();

  // Navigation state
  const [activeTab, setActiveTab] = useState('overview'); // overview, analytics, products, orders, users, sellerRequests

  // Check navigation states
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    } else if (location.pathname === '/admin/seller-requests') {
      setActiveTab('sellerRequests');
    }
  }, [location]);

  // API loading states
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, lowStockAlerts: 0, awaitingAction: 0 });
  const [charts, setCharts] = useState({ salesOverTime: [], categoryBreakdown: [], topProducts: [], recentOrders: [] });
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilter, setProdFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState('All');

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Seller requests modal states
  const [viewingSeller, setViewingSeller] = useState(null);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Invalid GST Number');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [verifiedDocs, setVerifiedDocs] = useState({});

  // Form states for creating products
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdSubcategoryId, setNewProdSubcategoryId] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Form states for editing products
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdSubcategoryId, setEditProdSubcategoryId] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');

  const [newProdImage, setNewProdImage] = useState(null);
  const [newProdImagePreview, setNewProdImagePreview] = useState(null);

  const [editProdImage, setEditProdImage] = useState(null);
  const [editProdImagePreview, setEditProdImagePreview] = useState(null);

  const handleNewProdImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProdImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProdImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProdImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProdImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 0. Fetch Categories Tree
      try {
        const catRes = await categoryService.getCategories();
        if (catRes && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Failed to load categories in admin panel:', err);
      }

      // 1. Fetch Stats
      const statData = await adminService.getStats();
      setStats(statData);

      // 2. Fetch Charts
      const chartData = await adminService.getCharts();
      setCharts(chartData);

      // 3. Fetch Users
      const userData = await adminService.getUsers();
      setUsersList(userData);

      // 4. Fetch Orders
      const orderData = await adminService.getOrders();
      setOrdersList(orderData);

      // 5. Fetch Products
      try {
        const response = await axios.get('/api/products');
        setProductsList(response.data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProductsList([]);
      }

      // 6. Fetch Inventory Logs
      const logsData = await adminService.getInventoryLogs();
      setInventoryLogs(logsData);

      // 7. Fetch Sellers
      try {
        const sellerData = await adminService.getSellers();
        setSellersList(sellerData || []);
      } catch (err) {
        console.error('Failed to fetch sellers:', err);
        setSellersList([]);
      }
    } catch (error) {
      addToast('Error fetching database records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  // ==================== PRODUCT CRUD ACTIONS ====================
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdCategory || newProdStock === '') {
      addToast('Please fill out all mandatory product fields.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProdName);
    formData.append('price', newProdPrice);
    formData.append('category', newProdCategory);
    formData.append('stock', newProdStock);
    formData.append('description', newProdDesc);
    if (newProdSubcategoryId) {
      formData.append('subcategory_id', newProdSubcategoryId);
    }
    if (newProdImage) {
      formData.append('image', newProdImage);
    }

    try {
      const response = await adminService.createProduct(formData);
      addToast(response.message, 'success');
      
      // Reset forms
      setNewProdName('');
      setNewProdPrice('');
      setNewProdCategory('');
      setNewProdSubcategoryId('');
      setNewProdStock('');
      setNewProdDesc('');
      setNewProdImage(null);
      setNewProdImagePreview(null);
      setShowAddProduct(false);

      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setEditProdName(product.name);
    setEditProdPrice(product.price);
    setEditProdCategory(product.category);
    setEditProdSubcategoryId(product.subcategory_id || '');
    setEditProdStock(product.stock);
    setEditProdDesc(product.description || '');
    setEditProdImage(null);
    setEditProdImagePreview(product.image ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/uploads/${product.image}`) : null);
    setShowEditProduct(true);
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editProdName);
    formData.append('price', editProdPrice);
    formData.append('category', editProdCategory);
    formData.append('stock', editProdStock);
    formData.append('description', editProdDesc);
    formData.append('subcategory_id', editProdSubcategoryId || '');
    if (editProdImage) {
      formData.append('image', editProdImage);
    }

    try {
      const response = await adminService.updateProduct(editingProduct.id, formData);
      addToast(response.message, 'success');
      setEditProdImage(null);
      setEditProdImagePreview(null);
      setShowEditProduct(false);
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleQuickStockAdjustment = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    // Use FormData since updateProduct expects multipart/form-data
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price.toString());
    formData.append('category', product.category);
    formData.append('stock', newStock.toString());
    if (product.description) formData.append('description', product.description);
    if (product.subcategory_id) {
      formData.append('subcategory_id', product.subcategory_id.toString());
    }

    try {
      const response = await adminService.updateProduct(product.id, formData);
      addToast(response.message, 'success');

      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you absolutely sure you want to permanently delete this product?')) {
      try {
        const response = await adminService.deleteProduct(id);
        addToast(response.message, 'success');
        fetchAllData();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const getSubcategoryFlatList = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName);
    if (!cat || !cat.children) return [];

    const list = [];
    const traverse = (node) => {
      if (!node.children || node.children.length === 0) {
        list.push({ id: node.id, path: node.path, name: node.name });
      } else {
        list.push({ id: node.id, path: node.path, name: node.name });
        node.children.forEach(child => traverse(child));
      }
    };
    
    cat.children.forEach(child => traverse(child));
    return list;
  };

  // ==================== ORDER STATUS TOGGLE ====================
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      addToast(response.message, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ==================== USER ACTIONS ====================
  const handleToggleUserRole = async (user) => {
    const targetRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const response = await adminService.updateUserRole(user.id, targetRole);
      addToast(response.message, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Confirm deletion of this customer account?')) {
      try {
        const response = await adminService.deleteUser(id);
        addToast(response.message, 'success');
        fetchAllData();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  // ==================== SELLER ACTIONS ====================
  const [docLoading, setDocLoading] = useState({});

  const handlePreview = async (filePath, label) => {
    if (!filePath) {
      addToast('Document not found.', 'error');
      return;
    }
    setDocLoading(prev => ({ ...prev, [label]: true }));
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      if (!response.ok) {
        addToast('Document not found.', 'error');
        return;
      }
      
      const extension = filePath.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) || extension === 'pdf') {
        window.open(filePath, '_blank');
      } else {
        window.open(filePath, '_blank');
      }
    } catch (err) {
      addToast('Document not found.', 'error');
    } finally {
      setDocLoading(prev => ({ ...prev, [label]: false }));
    }
  };

  const handleDownload = async (filePath, label) => {
    if (!filePath) {
      addToast('Document not found.', 'error');
      return;
    }
    setDocLoading(prev => ({ ...prev, [label]: true }));
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        addToast('Document not found.', 'error');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = filePath.split('/').pop() || `${label.replace(/\s+/g, '_')}_document`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Document not found.', 'error');
    } finally {
      setDocLoading(prev => ({ ...prev, [label]: false }));
    }
  };

  const handleViewSellerDetails = (seller) => {
    setViewingSeller(seller);
    setShowSellerDetails(true);
  };

  const handleToggleDocVerification = (sellerId, docField, isVerified) => {
    setVerifiedDocs(prev => ({
      ...prev,
      [sellerId]: {
        ...(prev[sellerId] || {}),
        [docField]: isVerified
      }
    }));
  };

  const handleApproveSeller = async (id) => {
    if (window.confirm('Are you sure you want to approve this seller application?')) {
      try {
        const response = await adminService.approveSeller(id);
        addToast(response.message || 'Seller approved successfully!', 'success');
        setShowSellerDetails(false);
        fetchAllData();
      } catch (err) {
        addToast(err.response?.data?.error || err.message || 'Failed to approve seller.', 'error');
      }
    }
  };

  const handleOpenRejectModal = (seller) => {
    setViewingSeller(seller);
    setRejectionReason('Invalid GST Number');
    setCustomRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSellerSubmit = async (e) => {
    e.preventDefault();
    const finalReason = rejectionReason === 'Other' ? customRejectionReason : rejectionReason;
    if (!finalReason.trim()) {
      addToast('Please provide a rejection reason.', 'error');
      return;
    }

    try {
      const response = await adminService.rejectSeller(viewingSeller.id, finalReason);
      addToast(response.message || 'Seller application rejected.', 'success');
      setShowRejectModal(false);
      setShowSellerDetails(false);
      fetchAllData();
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to reject seller.', 'error');
    }
  };

  // Filter listings
  const filteredSellers = sellersList.filter(s => {
    const nameMatch = (s.fullName || '').toLowerCase().includes(sellerSearch.toLowerCase()) || 
                      (s.businessName || '').toLowerCase().includes(sellerSearch.toLowerCase()) ||
                      (s.email || '').toLowerCase().includes(sellerSearch.toLowerCase());
    
    let statusMatch = true;
    if (sellerStatusFilter !== 'All') {
      if (sellerStatusFilter === 'Pending') {
        statusMatch = s.status === 'Pending Approval' || s.status === 'Pending';
      } else {
        statusMatch = s.status === sellerStatusFilter;
      }
    }
    return nameMatch && statusMatch;
  });
  const filteredProducts = productsList.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(prodSearch.toLowerCase()) || (p.category || '').toLowerCase().includes(prodSearch.toLowerCase());
    const matchCat = prodFilter === '' || (p.category || '').toLowerCase() === prodFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const filteredOrders = ordersList.filter(o => 
    o.id.toString().includes(orderSearch) || 
    (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
    (o.shippingAddress && o.shippingAddress.toLowerCase().includes(orderSearch.toLowerCase()))
  );

  const filteredUsers = usersList.filter(u => 
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  // SVG Chart data calculation helper
  const maxSalesVal = charts.salesOverTime.length > 0 
    ? Math.max(...charts.salesOverTime.map(s => s.amount)) * 1.15 
    : 500;

  return (
    <div className="admin-page-frame">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar glass-effect">
        <div className="sidebar-brand-wrapper">
          <div className="brand-logo">
            <ShoppingBag size={22} className="logo-svg" />
          </div>
          <div className="brand-text">
            <h2>High Mart</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="sidebar-menu-links">
          <button 
            className={`sidebar-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Grid size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`sidebar-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Reports & Sales</span>
          </button>
          <button 
            className={`sidebar-menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Product Inventory</span>
          </button>
          <button 
            className={`sidebar-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={18} />
            <span>Orders Desk</span>
            {stats.awaitingAction > 0 && <span className="sidebar-badge">{stats.awaitingAction}</span>}
          </button>
          <button 
            className={`sidebar-menu-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Shoppers List</span>
          </button>
          <button 
            className={`sidebar-menu-item ${activeTab === 'sellerRequests' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellerRequests')}
          >
            <Store size={18} />
            <span>Seller Requests</span>
            {sellersList.filter(s => s.status === 'Pending Approval' || s.status === 'Pending').length > 0 && (
              <span className="sidebar-badge danger">
                {sellersList.filter(s => s.status === 'Pending Approval' || s.status === 'Pending').length}
              </span>
            )}
          </button>
        </nav>

        <div className="sidebar-footer-profile">
          <div className="user-avatar-circle">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
          </div>
          <div className="user-meta-txt">
            <h4>{currentUser?.name || 'Administrator'}</h4>
            <p>System Admin</p>
          </div>
          <button onClick={handleLogout} className="sidebar-logout-trigger" aria-label="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SPACE */}
      <main className="admin-workspace">
        
        {/* Upper Workspace Banner Header */}
        <header className="workspace-header-bar glass-effect">
          <div className="header-greeting-lbl">
            <h1>Administrative Console</h1>
            <p>Platform status: <strong>Online</strong> • Live update sync enabled.</p>
          </div>
          <button onClick={fetchAllData} className="refresh-db-btn" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-loading' : ''} />
            <span>Refresh Workspace</span>
          </button>
        </header>

        {loading ? (
          <div className="workspace-central-loading">
            <div className="glowing-spinner"></div>
            <p>Syncing transactional database...</p>
          </div>
        ) : (
          <div className="workspace-content-scroller">
            
            {/* STATS OVERVIEW CARDS GRID */}
            <section className="stats-cards-grid">
              
              <div className="stat-value-card glass-effect">
                <div className="card-top-header">
                  <span className="card-label">Overall Revenue</span>
                  <div className="card-icon-round revenue">
                    <DollarSign size={20} />
                  </div>
                </div>
                <h2>₹{stats.totalRevenue.toFixed(2)}</h2>
                <div className="trend-percentage-text green">
                  <ArrowUpRight size={14} />
                  <span>+18.4% this week</span>
                </div>
              </div>

              <div className="stat-value-card glass-effect">
                <div className="card-top-header">
                  <span className="card-label">Total Transactions</span>
                  <div className="card-icon-round orders">
                    <ClipboardList size={20} />
                  </div>
                </div>
                <h2>{stats.totalOrders}</h2>
                <div className="trend-percentage-text green">
                  <ArrowUpRight size={14} />
                  <span>+12.1% sales velocity</span>
                </div>
              </div>

              <div className="stat-value-card glass-effect">
                <div className="card-top-header">
                  <span className="card-label">Registered Shoppers</span>
                  <div className="card-icon-round users">
                    <Users size={20} />
                  </div>
                </div>
                <h2>{stats.totalUsers}</h2>
                <div className="trend-percentage-text green">
                  <ArrowUpRight size={14} />
                  <span>+6.2% acquisition</span>
                </div>
              </div>

              <div className="stat-value-card glass-effect">
                <div className="card-top-header">
                  <span className="card-label">Low-Stock Warnings</span>
                  <div className="card-icon-round warnings">
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <h2>{stats.lowStockAlerts}</h2>
                <div className="trend-percentage-text red">
                  <AlertTriangle size={14} />
                  <span>Requires restocking</span>
                </div>
              </div>

            </section>

            {/* TAB PANEL VIEW: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="overview-tab-workspace animate-fade-in">
                <div className="dashboard-sub-flex-grid">
                  
                  {/* Left: Recent Activity Orders */}
                  <div className="dashboard-grid-card glass-effect wide-block">
                    <div className="grid-card-header">
                      <h3>Recent Sales log</h3>
                      <button onClick={() => setActiveTab('orders')} className="card-action-nav-link">View All Orders</button>
                    </div>
                    <div className="recent-orders-list-table">
                      {(charts?.recentOrders || []).map(order => (
                        <div key={order.id} className="recent-order-item-row">
                          <div className="order-initials-badge">
                            {(order.customerName || 'U')[0].toUpperCase()}
                          </div>
                          <div className="order-details-meta">
                            <h4>{order.customerName}</h4>
                            <p>Order #{order.id} • {new Date(order.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <span className={`status-pill ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                          <strong className="order-price-txt">₹{order.totalAmount.toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Low Stock Warnings */}
                  <div className="dashboard-grid-card glass-effect">
                    <div className="grid-card-header">
                      <h3>Inventory Stock Warnings</h3>
                      <button onClick={() => setActiveTab('products')} className="card-action-nav-link">Restock</button>
                    </div>
                    <div className="low-stock-checklist">
                      {productsList.filter(p => p.stock <= 5).map(prod => (
                        <div key={prod.id} className="low-stock-item-badge">
                          <div className="item-bullet-red"></div>
                          <div className="low-stock-desc">
                            <h4>{prod.name}</h4>
                            <p>Current stock: <strong>{prod.stock} items remaining</strong></p>
                          </div>
                          <span className="low-stock-cat-pill">{prod.category}</span>
                        </div>
                      ))}
                      {productsList.filter(p => p.stock <= 5).length === 0 && (
                        <div className="success-empty-checklist">
                          <CheckCircle size={38} className="empty-ico" />
                          <p>All catalog products are fully stocked! No inventory risks detected.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Warehouse Stock Logs Timeline */}
                <div className="dashboard-grid-card glass-effect warehouse-timeline-card">
                  <div className="grid-card-header">
                    <h3>Warehouse Stock Audit Log</h3>
                    <p className="timeline-subtitle-hint">Real-time stock movements & adjustments timeline</p>
                  </div>
                  <div className="timeline-activity-scroller">
                    {(inventoryLogs || []).map(log => {
                      const isDeduction = (log.activityType || '').toLowerCase().includes('deduction');
                      const isInbound = (log.activityType || '').toLowerCase().includes('inbound');
                      
                      return (
                        <div key={log.id} className="timeline-entry-row">
                          <div className={`timeline-indicator-dot ${isDeduction ? 'deduction' : isInbound ? 'inbound' : 'adjustment'}`}>
                            {isDeduction ? '-' : isInbound ? '+' : '✏️'}
                          </div>
                          <div className="timeline-body-content">
                            <div className="timeline-body-details">
                              <h4>{log.productName}</h4>
                              <p>{log.activityType} • Performed by: <strong>{log.performedBy}</strong></p>
                              <span className="timestamp-meta">
                                {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <div className="timeline-right-pills">
                              <span className={`timeline-qty-change-pill ${log.quantityChange > 0 ? 'positive' : 'negative'}`}>
                                {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} units
                              </span>
                              <span className="timeline-remaining-stock-badge">
                                Stock: {log.remainingStock} remaining
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {inventoryLogs.length === 0 && (
                      <p className="table-empty-row-text">No warehouse activity logs found.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB PANEL VIEW: REPORTS & ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="overview-tab-workspace animate-fade-in">
                <div className="analytics-reports-grid">
                  
                  {/* Sales Curve Line Graph */}
                  <div className="dashboard-grid-card glass-effect wide-span-2">
                    <div className="grid-card-header">
                      <h3>7-Day Sales Volume velocity</h3>
                    </div>
                    <div className="svg-chart-container">
                      <svg viewBox="0 0 500 200" className="interactive-sales-svg">
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--secondary-color)" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="var(--secondary-color)" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal grid lines */}
                        <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

                        {/* Chart Line Path */}
                        <path 
                          d={`M ${charts.salesOverTime.map((s, i) => {
                            const x = 40 + i * (440 / (charts.salesOverTime.length - 1 || 1));
                            const y = 170 - (s.amount / maxSalesVal) * 130;
                            return `${x} ${y}`;
                          }).join(' L ')}`}
                          fill="none"
                          stroke="var(--secondary-color)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Area gradient under path */}
                        <path 
                          d={`M 40 170 L ${charts.salesOverTime.map((s, i) => {
                            const x = 40 + i * (440 / (charts.salesOverTime.length - 1 || 1));
                            const y = 170 - (s.amount / maxSalesVal) * 130;
                            return `${x} ${y}`;
                          }).join(' L ')} L 480 170 Z`}
                          fill="url(#salesGrad)"
                        />

                        {/* Interactive Data Dot Nodes */}
                        {charts.salesOverTime.map((s, i) => {
                          const x = 40 + i * (440 / (charts.salesOverTime.length - 1 || 1));
                          const y = 170 - (s.amount / maxSalesVal) * 130;
                          return (
                            <g key={i} className="chart-node-group">
                              <circle cx={x} cy={y} r="5" fill="#fff" stroke="var(--secondary-color)" strokeWidth="2" />
                              <text x={x} y={y - 12} fontSize="9" fill="var(--text-dark)" textAnchor="middle" fontWeight="bold">
                                ${Math.round(s.amount)}
                              </text>
                              <text x={x} y="186" fontSize="9" fill="var(--text-muted)" textAnchor="middle">
                                {s.date}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Category Donut Ratios */}
                  <div className="dashboard-grid-card glass-effect">
                    <div className="grid-card-header">
                      <h3>Sales Share by Category</h3>
                    </div>
                    <div className="donut-chart-flex">
                      <div className="svg-donut-box">
                        <svg viewBox="0 0 100 100" className="donut-svg">
                          {/* We draw standard donut concentric wedges based on percentage ratios */}
                          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                          
                          {/* Segment 1: Appliances (Curated HSL) */}
                          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--secondary-color)" strokeWidth="12" 
                                  strokeDasharray="220" strokeDashoffset="55" />
                          {/* Segment 2: Electronics */}
                          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--primary-color)" strokeWidth="12" 
                                  strokeDasharray="220" strokeDashoffset="145" />
                          {/* Segment 3: Furniture */}
                          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-color)" strokeWidth="12" 
                                  strokeDasharray="220" strokeDashoffset="195" />
                        </svg>
                      </div>
                      
                      <div className="donut-legend-guide">
                        {charts.categoryBreakdown.map((cat, i) => {
                          const colors = ['var(--secondary-color)', 'var(--primary-color)', 'var(--accent-color)', 'var(--color-success)', 'var(--text-muted)'];
                          return (
                            <div key={cat.category} className="legend-indicator-row">
                              <span className="legend-dot" style={{ backgroundColor: colors[i % colors.length] }}></span>
                              <span className="legend-label">{cat.category}</span>
                              <strong className="legend-val">₹{cat.value.toFixed(2)}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Top Selling Products */}
                  <div className="dashboard-grid-card glass-effect wide-span-2">
                    <div className="grid-card-header">
                      <h3>Top Performing Products sold</h3>
                    </div>
                    <div className="top-performing-products-grid">
                      {charts.topProducts.map((prod, index) => (
                        <div key={prod.name} className="top-product-score-badge glass-effect">
                          <div className="product-rank-placement">#{index + 1}</div>
                          <div className="product-rank-thumb">
                            <img src={prod.image} alt={prod.name} />
                          </div>
                          <div className="product-rank-details">
                            <h4>{prod.name}</h4>
                            <p>{prod.qty} items dispatched successfully</p>
                          </div>
                          <div className="product-rank-yield">
                            <strong>₹{prod.revenue.toFixed(2)}</strong>
                            <span>Sales Yield</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB PANEL VIEW: PRODUCTS INVENTORY */}
            {activeTab === 'products' && (
              <div className="admin-table-container glass-effect animate-fade-in">
                
                {/* Search CRUD bar */}
                <div className="table-action-header-row">
                  <div className="table-search-box-wrapper">
                    <Search size={16} className="search-ico" />
                    <input 
                      type="text" 
                      placeholder="Search inventory SKU or Category..." 
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                    />
                  </div>

                  <div className="inventory-right-filter-actions">
                    <select 
                      value={prodFilter}
                      onChange={(e) => setProdFilter(e.target.value)}
                      className="category-filter-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>

                    <button className="add-new-sku-btn" onClick={() => setShowAddProduct(true)}>
                      <Plus size={16} />
                      <span>Add Product SKU</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="table-workspace-scroller">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Preview</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock Qty</th>
                        <th>Stock Alert</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(prod => (
                        <tr key={prod.id}>
                          <td><strong>#{prod.id}</strong></td>
                          <td>
                            <div className="table-item-thumbnail">
                              <img src={prod.image} alt={prod.name} />
                            </div>
                          </td>
                          <td className="product-table-name"><strong>{prod.name}</strong></td>
                          <td><span className="table-cat-pill">{prod.category}</span></td>
                          <td><strong>₹{prod.price.toFixed(2)}</strong></td>
                          <td>
                             <div className="stock-adjustment-flex">
                               <button 
                                 type="button"
                                 onClick={() => handleQuickStockAdjustment(prod, -1)}
                                 className="stock-adjustment-btn decrease"
                                 disabled={prod.stock <= 0}
                                 aria-label="Decrease stock"
                               >
                                 -
                               </button>
                               <strong className="stock-qty-lbl">{prod.stock}</strong>
                               <button 
                                 type="button"
                                 onClick={() => handleQuickStockAdjustment(prod, 1)}
                                 className="stock-adjustment-btn increase"
                                 aria-label="Increase stock"
                               >
                                 +
                               </button>
                             </div>
                           </td>
                           <td>
                             {prod.stock <= 5 ? (
                               <span className="inventory-status-pill danger">Low Stock</span>
                             ) : (
                               <span className="inventory-status-pill success">Optimal</span>
                             )}
                           </td>
                          <td>
                            <div className="table-action-btn-row">
                              <button 
                                onClick={() => handleEditProductClick(prod)} 
                                className="action-circle-btn edit"
                                aria-label="Edit SKU"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(prod.id)} 
                                className="action-circle-btn delete"
                                aria-label="Delete SKU"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && (
                    <p className="table-empty-row-text">No inventory products found matching search filter.</p>
                  )}
                </div>

              </div>
            )}

            {/* TAB PANEL VIEW: ORDERS MANAGEMENT DESK */}
            {activeTab === 'orders' && (
              <div className="admin-table-container glass-effect animate-fade-in">
                
                {/* Search CRUD bar */}
                <div className="table-action-header-row">
                  <div className="table-search-box-wrapper">
                    <Search size={16} className="search-ico" />
                    <input 
                      type="text" 
                      placeholder="Search Order ID, Client, Address..." 
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="table-workspace-scroller">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Created Date</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Payment Status</th>
                        <th>Workflow Status</th>
                        <th>View Items</th>
                        <th>Manage Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>#HM-{order.id}</strong></td>
                          <td><strong>{order.customerName || 'Jane Doe'}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td><strong>₹{order.totalAmount.toFixed(2)}</strong></td>
                          <td>{order.paymentMethod || 'Stripe'}</td>
                          <td>
                            <span className={`payment-status-badge ${order.paymentStatus?.toLowerCase() || 'paid'}`}>
                              {order.paymentStatus || 'Paid'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                             <button
                               type="button"
                               onClick={() => {
                                 setViewingOrder(order);
                                 setShowOrderDetails(true);
                               }}
                               className="action-circle-btn inspect"
                               aria-label="Inspect Order Items"
                             >
                               <Eye size={14} />
                             </button>
                           </td>
                          <td>
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="order-status-update-selector"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                    <p className="table-empty-row-text">No order histories found matching parameters.</p>
                  )}
                </div>

              </div>
            )}

            {/* TAB PANEL VIEW: SHOPPERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="admin-table-container glass-effect animate-fade-in">
                
                {/* Search CRUD bar */}
                <div className="table-action-header-row">
                  <div className="table-search-box-wrapper">
                    <Search size={16} className="search-ico" />
                    <input 
                      type="text" 
                      placeholder="Search shopper name or email..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="table-workspace-scroller">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Initials</th>
                        <th>Name</th>
                        <th>Email Address</th>
                        <th>Access Role</th>
                        <th>Change Role Privilege</th>
                        <th>Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td><strong>#{user.id}</strong></td>
                          <td>
                            <div className="table-item-initials-badge">
                              {user.name[0].toUpperCase()}
                            </div>
                          </td>
                          <td><strong>{user.name}</strong></td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleToggleUserRole(user)}
                              className="toggle-user-privilege-btn"
                            >
                              <UserCheck size={14} />
                              <span>Switch to {user.role === 'admin' ? 'User' : 'Admin'}</span>
                            </button>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="action-circle-btn delete"
                              aria-label="Delete Shopper Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <p className="table-empty-row-text">No shopper records matching query.</p>
                  )}
                </div>

              </div>
            )}

            {/* TAB PANEL VIEW: SELLER REQUESTS */}
            {activeTab === 'sellerRequests' && (
              <div className="admin-table-container glass-effect animate-fade-in">
                
                {/* Search & Filter bar */}
                <div className="table-action-header-row">
                  <div className="table-search-box-wrapper">
                    <Search size={16} className="search-ico" />
                    <input 
                      type="text" 
                      placeholder="Search seller name, business, email..." 
                      value={sellerSearch}
                      onChange={(e) => setSellerSearch(e.target.value)}
                    />
                  </div>

                  <div className="inventory-right-filter-actions">
                    <select 
                      value={sellerStatusFilter}
                      onChange={(e) => setSellerStatusFilter(e.target.value)}
                      className="category-filter-select"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="table-workspace-scroller">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Seller Name</th>
                        <th>Business Name</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>GST Number</th>
                        <th>Submitted Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSellers.map(seller => {
                        const statusClass = seller.status === 'Approved' ? 'success' : (seller.status === 'Rejected' ? 'danger' : 'warning');
                        return (
                          <tr key={seller.id}>
                            <td><strong>{seller.fullName}</strong></td>
                            <td>{seller.businessName}</td>
                            <td>{seller.email}</td>
                            <td>{seller.phone}</td>
                            <td style={{ textTransform: 'uppercase' }}>{seller.gstNumber}</td>
                            <td>{new Date(seller.submittedAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-pill ${statusClass}`}>
                                {seller.status}
                              </span>
                            </td>
                            <td>
                              <div className="table-action-btn-row">
                                <button 
                                  onClick={() => handleViewSellerDetails(seller)} 
                                  className="action-circle-btn inspect"
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                {(seller.status === 'Pending Approval' || seller.status === 'Pending') && (
                                  <>
                                    <button 
                                      onClick={() => handleApproveSeller(seller.id)} 
                                      className="action-circle-btn approve"
                                      title="Approve Seller"
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleOpenRejectModal(seller)} 
                                      className="action-circle-btn delete"
                                      title="Reject Seller"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredSellers.length === 0 && (
                    <p className="table-empty-row-text">No seller requests found matching parameters.</p>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ==================== CREATE PRODUCT MODAL ==================== */}
      {showAddProduct && (
        <div className="admin-dialog-backdrop animate-fade-in">
          <div className="admin-dialog glass-effect">
            <div className="dialog-header">
              <h3>Create Product SKU</h3>
              <button onClick={() => setShowAddProduct(false)} className="dialog-close-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProductSubmit} className="dialog-form-body">
              <div className="form-double-span">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Premium Wireless Mouse" 
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                />
              </div>
              <div className="form-input-box">
                <label>Listing Price (₹) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="e.g. 49.99" 
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                />
              </div>
              <div className="form-input-box">
                <label>Category *</label>
                <select 
                  required 
                  value={newProdCategory}
                  onChange={(e) => {
                    setNewProdCategory(e.target.value);
                    setNewProdSubcategoryId('');
                  }}
                  className="dialog-form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {newProdCategory && getSubcategoryFlatList(newProdCategory).length > 0 && (
                <div className="form-input-box">
                  <label>Subcategory *</label>
                  <select
                    required
                    value={newProdSubcategoryId}
                    onChange={(e) => setNewProdSubcategoryId(e.target.value)}
                    className="dialog-form-select"
                  >
                    <option value="">Select Subcategory</option>
                    {getSubcategoryFlatList(newProdCategory).map(sub => {
                      const displayPath = sub.path.replace(`${newProdCategory} > `, '');
                      return (
                        <option key={sub.id} value={sub.id}>{displayPath}</option>
                      );
                    })}
                  </select>
                </div>
              )}
              <div className="form-input-box">
                <label>Initial Stock Qty *</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 25" 
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                />
              </div>
              <div className="form-input-box form-double-span" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="create-product-image-input" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Product Image Asset</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="file" 
                    id="create-product-image-input"
                    accept="image/*"
                    onChange={handleNewProdImageChange} 
                    className="dialog-file-input" 
                    style={{ display: 'block', width: '100%' }}
                  />
                  {newProdImagePreview && (
                    <img 
                      src={newProdImagePreview} 
                      alt="Preview" 
                      style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  )}
                </div>
              </div>
              <div className="form-double-span">
                <label>Description Details</label>
                <textarea 
                  placeholder="Write a captivating description of this listing..." 
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                />
              </div>
              <div className="dialog-actions-footer">
                <button type="button" className="dialog-cancel-btn" onClick={() => setShowAddProduct(false)}>Cancel</button>
                <button type="submit" className="dialog-confirm-submit-btn">Publish SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT PRODUCT MODAL ==================== */}
      {showEditProduct && (
        <div className="admin-dialog-backdrop animate-fade-in">
          <div className="admin-dialog glass-effect">
            <div className="dialog-header">
              <h3>Edit Product SKU #{editingProduct?.id}</h3>
              <button onClick={() => setShowEditProduct(false)} className="dialog-close-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProductSubmit} className="dialog-form-body">
              <div className="form-double-span">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                />
              </div>
              <div className="form-input-box">
                <label>Listing Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editProdPrice}
                  onChange={(e) => setEditProdPrice(e.target.value)}
                />
              </div>
              <div className="form-input-box">
                <label>Category</label>
                <select 
                  value={editProdCategory}
                  onChange={(e) => {
                    setEditProdCategory(e.target.value);
                    setEditProdSubcategoryId('');
                  }}
                  className="dialog-form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {editProdCategory && getSubcategoryFlatList(editProdCategory).length > 0 && (
                <div className="form-input-box">
                  <label>Subcategory</label>
                  <select
                    value={editProdSubcategoryId}
                    onChange={(e) => setEditProdSubcategoryId(e.target.value)}
                    className="dialog-form-select"
                  >
                    <option value="">Select Subcategory</option>
                    {getSubcategoryFlatList(editProdCategory).map(sub => {
                      const displayPath = sub.path.replace(`${editProdCategory} > `, '');
                      return (
                        <option key={sub.id} value={sub.id}>{displayPath}</option>
                      );
                    })}
                  </select>
                </div>
              )}
              <div className="form-input-box">
                <label>Stock Qty</label>
                <input 
                  type="number" 
                  value={editProdStock}
                  onChange={(e) => setEditProdStock(e.target.value)}
                />
              </div>
              <div className="form-input-box form-double-span" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="edit-product-image-input" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Update Image File</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="file" 
                    id="edit-product-image-input"
                    accept="image/*"
                    onChange={handleEditProdImageChange} 
                    className="dialog-file-input" 
                    style={{ display: 'block', width: '100%' }}
                  />
                  {editProdImagePreview && (
                    <img 
                      src={editProdImagePreview} 
                      alt="Preview" 
                      style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  )}
                </div>
              </div>
              <div className="form-double-span">
                <label>Description Details</label>
                <textarea 
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                />
              </div>
              <div className="dialog-actions-footer">
                <button type="button" className="dialog-cancel-btn" onClick={() => setShowEditProduct(false)}>Cancel</button>
                <button type="submit" className="dialog-confirm-submit-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW PURCHASED ITEMS MODAL ==================== */}
      {showOrderDetails && viewingOrder && (
        <div className="admin-dialog-backdrop animate-fade-in">
          <div className="admin-dialog glass-effect order-items-dialog">
            <div className="dialog-header">
              <h3>Purchased Items - Order #HM-{viewingOrder.id}</h3>
              <button onClick={() => setShowOrderDetails(false)} className="dialog-close-btn"><X size={18} /></button>
            </div>
            <div className="order-inspection-body">
              <div className="order-meta-info-grid">
                <div>
                  <span className="lbl text-muted">Customer Name</span>
                  <strong className="val text-dark">{viewingOrder.customerName || 'Jane Doe'}</strong>
                </div>
                <div>
                  <span className="lbl text-muted">Payment status</span>
                  <span className={`val payment-status-badge ${viewingOrder.paymentStatus?.toLowerCase() || 'paid'}`}>
                    {viewingOrder.paymentStatus || 'Paid'}
                  </span>
                </div>
                <div className="form-double-span">
                  <span className="lbl text-muted">Shipping address</span>
                  <p className="val text-dark shipping-addr-txt">{viewingOrder.shippingAddress}</p>
                </div>
                <div className="form-double-span">
                  <span className="lbl text-muted">Total Paid</span>
                  <strong className="val text-dark grand-total-price">₹{viewingOrder.totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              <hr className="dialog-divider" />

              <h4 className="purchased-items-title">Items Ordered ({viewingOrder.items?.length || 0})</h4>
              <div className="purchased-items-scroll-list">
                {viewingOrder.items?.map((item, idx) => (
                  <div key={idx} className="purchased-item-card-row">
                    <div className="purchased-item-thumb">
                      <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'} alt={item.name} />
                    </div>
                    <div className="purchased-item-details">
                      <h4>{item.name}</h4>
                      <p className="item-pricing">₹{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="purchased-item-total">
                      <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dialog-actions-footer single-action">
                <button type="button" className="dialog-confirm-submit-btn" onClick={() => setShowOrderDetails(false)}>Close Inspection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW SELLER DETAILS MODAL ==================== */}
      {showSellerDetails && viewingSeller && (
        <div className="admin-dialog-backdrop animate-fade-in" style={{ zIndex: 900 }}>
          <div className="admin-dialog glass-effect seller-details-dialog" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="dialog-header">
              <h3>Seller Application Details - {viewingSeller.fullName}</h3>
              <button onClick={() => setShowSellerDetails(false)} className="dialog-close-btn"><X size={18} /></button>
            </div>
            <div className="dialog-form-body" style={{ maxHeight: '70vh', overflowY: 'auto', display: 'block', padding: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="responsive-modal-grid">
                {/* Personal Details */}
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                    <Users size={16} />
                    <span>Personal Details</span>
                  </h4>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">Full Name:</span> <strong>{viewingSeller.fullName}</strong></p>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">Email Address:</span> <strong>{viewingSeller.email}</strong></p>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">Phone Number:</span> <strong>{viewingSeller.phone}</strong></p>
                </div>

                {/* Business Details */}
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                    <Store size={16} />
                    <span>Business Details</span>
                  </h4>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">Business Name:</span> <strong>{viewingSeller.businessName}</strong></p>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">GST Number:</span> <strong style={{ textTransform: 'uppercase' }}>{viewingSeller.gstNumber}</strong></p>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">PAN Number:</span> <strong style={{ textTransform: 'uppercase' }}>{viewingSeller.panNumber}</strong></p>
                  <p style={{ margin: '6px 0', fontSize: '13.5px' }}><span className="text-muted">Address:</span> <strong>{viewingSeller.businessAddress}, {viewingSeller.city}, {viewingSeller.state} - {viewingSeller.pincode}</strong></p>
                </div>

                {/* Bank Account Details */}
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', gridColumn: 'span 2' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '12px', fontSize: '15px', fontWeight: 'bold' }}>
                    <DollarSign size={16} />
                    <span>Bank Account Details</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                    <p style={{ margin: '0', fontSize: '13.5px' }}><span className="text-muted">Holder Name:</span> <strong>{viewingSeller.accountHolderName}</strong></p>
                    <p style={{ margin: '0', fontSize: '13.5px' }}><span className="text-muted">Bank Name:</span> <strong>{viewingSeller.bankName}</strong></p>
                    <p style={{ margin: '0', fontSize: '13.5px' }}><span className="text-muted">Account Number:</span> <strong>{viewingSeller.accountNumber}</strong></p>
                    <p style={{ margin: '0', fontSize: '13.5px' }}><span className="text-muted">IFSC Code:</span> <strong style={{ textTransform: 'uppercase' }}>{viewingSeller.ifscCode}</strong></p>
                    {viewingSeller.upiId && <p style={{ margin: '0', fontSize: '13.5px' }}><span className="text-muted">UPI ID:</span> <strong>{viewingSeller.upiId}</strong></p>}
                  </div>
                </div>
              </div>

              {/* Documents Verification Section */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary-color)', marginBottom: '16px', fontSize: '15px', fontWeight: 'bold' }}>
                  <ShieldAlert size={16} />
                  <span>Document Verification System</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { field: 'profilePhoto', label: 'Profile Photo', path: viewingSeller.profilePhoto },
                    { field: 'gstCertificate', label: 'GST Certificate', path: viewingSeller.gstCertificate },
                    { field: 'panCard', label: 'PAN Card', path: viewingSeller.panCard },
                    { field: 'cancelledCheque', label: 'Cancelled Cheque', path: viewingSeller.cancelledCheque },
                    { field: 'businessLicense', label: 'Business License (Optional)', path: viewingSeller.businessLicense }
                  ].map((doc) => {
                    if (doc.field === 'businessLicense' && !doc.path) return null;
                    
                    const isVerified = !!(verifiedDocs[viewingSeller.id]?.[doc.field]);
                    
                    return (
                      <div key={doc.field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }} className="responsive-doc-row">
                        <div>
                          <strong style={{ fontSize: '13.5px' }}>{doc.label}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            {isVerified ? (
                              <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold' }}>
                                <CheckCircle2 size={13} /> Verified
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold' }}>
                                <XCircle size={13} /> Not Verified
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            type="button" 
                            className="dialog-cancel-btn"
                            style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            disabled={docLoading[doc.label]}
                            onClick={() => handlePreview(doc.path, doc.label)}
                          >
                            {docLoading[doc.label] ? (
                              <Loader2 size={12} className="spinning-icon" />
                            ) : (
                              <Eye size={12} />
                            )}
                            <span>Preview</span>
                          </button>

                          <button 
                            type="button" 
                            className="dialog-cancel-btn"
                            style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            disabled={docLoading[doc.label]}
                            onClick={() => handleDownload(doc.path, doc.label)}
                          >
                            {docLoading[doc.label] ? (
                              <Loader2 size={12} className="spinning-icon" />
                            ) : (
                              <Download size={12} />
                            )}
                            <span>Download</span>
                          </button>

                          {isVerified ? (
                            <button 
                              type="button" 
                              className="dialog-cancel-btn"
                              style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                              onClick={() => handleToggleDocVerification(viewingSeller.id, doc.field, false)}
                            >
                              Unverify
                            </button>
                          ) : (
                            <button 
                              type="button" 
                              className="dialog-confirm-submit-btn"
                              style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto', background: '#10b981' }}
                              onClick={() => handleToggleDocVerification(viewingSeller.id, doc.field, true)}
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {viewingSeller.rejectionReason && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>
                  <strong>Rejection Reason:</strong> {viewingSeller.rejectionReason}
                </div>
              )}

              <div className="dialog-actions-footer">
                <button type="button" className="dialog-cancel-btn" onClick={() => setShowSellerDetails(false)}>Close</button>
                
                {(viewingSeller.status === 'Pending Approval' || viewingSeller.status === 'Pending') && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="dialog-cancel-btn" 
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)', background: 'transparent' }}
                      onClick={() => handleOpenRejectModal(viewingSeller)}
                    >
                      Reject Application
                    </button>
                    <button 
                      type="button" 
                      className="dialog-confirm-submit-btn"
                      style={{ background: '#10b981' }}
                      onClick={() => handleApproveSeller(viewingSeller.id)}
                    >
                      Approve Application
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== REJECT SELLER CONFIRMATION MODAL ==================== */}
      {showRejectModal && viewingSeller && (
        <div className="admin-dialog-backdrop animate-fade-in" style={{ zIndex: 1000 }}>
          <div className="admin-dialog glass-effect" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="dialog-header">
              <h3>Reject Seller Application</h3>
              <button onClick={() => setShowRejectModal(false)} className="dialog-close-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleRejectSellerSubmit} className="dialog-form-body" style={{ padding: '24px' }}>
              <div className="form-double-span" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Reason for Rejection *</label>
                <select 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="dialog-form-select"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dark)', border: '1px solid rgba(0,0,0,0.15)' }}
                >
                  <option value="Invalid GST Number">Invalid GST Number</option>
                  <option value="Documents Missing">Documents Missing</option>
                  <option value="Incorrect Information">Incorrect Information</option>
                  <option value="Duplicate Registration">Duplicate Registration</option>
                  <option value="Other">Other (Type below)</option>
                </select>
              </div>

              {rejectionReason === 'Other' && (
                <div className="form-double-span" style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Custom Rejection Reason *</label>
                  <textarea
                    required
                    placeholder="Type the detailed reason for rejection..."
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                    style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dark)', border: '1px solid rgba(0,0,0,0.15)' }}
                  />
                </div>
              )}

              <div className="dialog-actions-footer" style={{ marginTop: '25px' }}>
                <button type="button" className="dialog-cancel-btn" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="submit" className="dialog-confirm-submit-btn" style={{ background: '#ef4444' }}>Reject Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
