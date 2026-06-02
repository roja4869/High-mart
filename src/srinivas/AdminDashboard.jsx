import React, { useState, useEffect, useContext } from 'react';
import { adminService } from './adminService';
import { authService } from '../services/authService';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Plus, Search, Trash2, Edit3, ShieldAlert, ShoppingBag, 
  Users, DollarSign, Package, ClipboardList, LogOut, ArrowUpRight, 
  Grid, RefreshCw, AlertTriangle, UserCheck, Eye, ChevronDown, CheckCircle
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { addToast } = useContext(AppContext);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Navigation state
  const [activeTab, setActiveTab] = useState('overview'); // overview, analytics, products, orders, users

  // API loading states
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, lowStockAlerts: 0, awaitingAction: 0 });
  const [charts, setCharts] = useState({ salesOverTime: [], categoryBreakdown: [], topProducts: [], recentOrders: [] });
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilter, setProdFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Form states for creating products
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Form states for editing products
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
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
      // We will read from fallback local storage mock products first, then API
      const localProds = JSON.parse(localStorage.getItem('highMartMockProducts') || '[]');
      try {
        const response = await axios.get('/api/products');
        setProductsList([...localProds, ...response.data.products]);
      } catch (err) {
        // Mock fallback products
        const defaultProducts = [
          { id: 1, name: "Premium Coffee Maker", price: 129.99, category: "Appliances", stock: 15, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80' },
          { id: 2, name: "Wireless Noise-Cancelling Headphones", price: 199.99, category: "Electronics", stock: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
          { id: 3, name: "Ergonomic Office Chair", price: 249.99, category: "Furniture", stock: 8, image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400&q=80' },
          { id: 4, name: "Stainless Steel Water Bottle", price: 24.99, category: "Kitchenware", stock: 50, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
          { id: 5, name: "Ultra-Light Running Shoes", price: 89.99, category: "Footwear", stock: 12, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80' }
        ];
        setProductsList([...localProds, ...defaultProducts]);
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

    try {
      const response = await adminService.createProduct(formData);
      addToast(response.message, 'success');
      
      // Reset forms
      setNewProdName('');
      setNewProdPrice('');
      setNewProdCategory('');
      setNewProdStock('');
      setNewProdDesc('');
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
    setEditProdStock(product.stock);
    setEditProdDesc(product.description || '');
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

    try {
      const response = await adminService.updateProduct(editingProduct.id, formData);
      addToast(response.message, 'success');
      setShowEditProduct(false);
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

  // Filter listings
  const filteredProducts = productsList.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.category.toLowerCase().includes(prodSearch.toLowerCase());
    const matchCat = prodFilter === '' || p.category.toLowerCase() === prodFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const filteredOrders = ordersList.filter(o => 
    o.id.toString().includes(orderSearch) || 
    (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
    (o.shippingAddress && o.shippingAddress.toLowerCase().includes(orderSearch.toLowerCase()))
  );

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
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
                <h2>${stats.totalRevenue.toFixed(2)}</h2>
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
                      {charts.recentOrders.map(order => (
                        <div key={order.id} className="recent-order-item-row">
                          <div className="order-initials-badge">
                            {order.customerName[0].toUpperCase()}
                          </div>
                          <div className="order-details-meta">
                            <h4>{order.customerName}</h4>
                            <p>Order #{order.id} • {new Date(order.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <span className={`status-pill ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                          <strong className="order-price-txt">${order.totalAmount.toFixed(2)}</strong>
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
                              <strong className="legend-val">${cat.value.toFixed(2)}</strong>
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
                            <strong>${prod.revenue.toFixed(2)}</strong>
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
                      <option value="Appliances">Appliances</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Kitchenware">Kitchenware</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Beauty">Beauty</option>
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
                          <td><strong>${prod.price.toFixed(2)}</strong></td>
                          <td><strong>{prod.stock}</strong></td>
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
                        <th>Manage Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td><strong>#HM-{order.id}</strong></td>
                          <td><strong>{order.customerName || 'Jane Doe'}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
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
                <label>Listing Price ($) *</label>
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
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="dialog-form-select"
                >
                  <option value="">Select Category</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Kitchenware">Kitchenware</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>
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
              <div className="form-input-box">
                <label>Product Image Asset</label>
                <input type="file" disabled className="dialog-file-input" />
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
                <label>Listing Price ($)</label>
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
                  onChange={(e) => setEditProdCategory(e.target.value)}
                  className="dialog-form-select"
                >
                  <option value="Appliances">Appliances</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Kitchenware">Kitchenware</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>
              <div className="form-input-box">
                <label>Stock Qty</label>
                <input 
                  type="number" 
                  value={editProdStock}
                  onChange={(e) => setEditProdStock(e.target.value)}
                />
              </div>
              <div className="form-input-box">
                <label>Update Image File</label>
                <input type="file" disabled className="dialog-file-input" />
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

    </div>
  );
};

export default AdminDashboard;
