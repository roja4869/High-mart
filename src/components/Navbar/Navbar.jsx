import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../App';
import { authService } from '../../services/authService';
import { ShoppingCart, Heart, Search, User, LogOut, Sun, Moon, ShoppingBag, Menu, X, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { cart, wishlist, theme, toggleTheme, addToast } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  console.log("[RENDER] Navbar Component", location.pathname);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = authService.getCurrentUser();
  const isAuth = authService.isAuthenticated();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    addToast('Logged out successfully.', 'info');
    setShowProfileDropdown(false);
    navigate('/login');
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar glass-effect">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon-wrapper">
            <ShoppingBag className="logo-svg" size={24} />
          </div>
          <span>High Mart</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <input 
            type="text" 
            placeholder="Search products, brands and more..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Submit Search">
            <Search size={18} />
          </button>
        </form>

        {/* Navigation Links - Desktop */}
        <ul className="navbar-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          </li>
          <li>
            <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Categories</Link>
          </li>
          <li>
            <span onClick={() => handleNavClick('deals')} className="nav-click-anchor">Deals</span>
          </li>
          <li>
            <span onClick={() => handleNavClick('new-arrivals')} className="nav-click-anchor">New Arrivals</span>
          </li>
        </ul>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="action-btn theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="action-btn wishlist-icon-link" aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
          </Link>

          {/* Cart */}
          <div className="cart-hover-container">
            <Link to="/cart" className="action-btn cart-icon-link" aria-label="Shopping Cart">
              <ShoppingCart size={20} />
              {totalCartItems > 0 && <span className="action-badge success">{totalCartItems}</span>}
            </Link>
          </div>

          {/* User Auth Dropdown */}
          {isAuth ? (
            <div className="profile-dropdown-wrapper">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                className="profile-trigger-btn"
                aria-label="User Profile Dropdown"
              >
                <div className="avatar-circle">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span className="profile-name">{currentUser?.name?.split(' ')[0]}</span>
              </button>
              
              {showProfileDropdown && (
                <div className="profile-dropdown-menu glass-effect">
                  <div className="dropdown-user-info">
                    <p className="user-name-title">{currentUser?.name}</p>
                    <p className="user-email-subtitle">{currentUser?.email}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link 
                    to="/profile" 
                    onClick={() => setShowProfileDropdown(false)} 
                    className="dropdown-item"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setShowProfileDropdown(false)} 
                    className="dropdown-item"
                  >
                    <ShoppingCart size={16} />
                    <span>My Dashboard</span>
                  </Link>
                  {currentUser?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setShowProfileDropdown(false)} 
                      className="dropdown-item admin-nav-dropdown-item"
                    >
                      <Shield size={16} style={{ color: 'var(--secondary-color)' }} />
                      <span style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>Admin Panel</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout-btn-item">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-nav-btn">Sign In</Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="action-btn mobile-menu-btn"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-effect">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            </li>
            <li>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
            </li>
            <li>
              <span onClick={() => handleNavClick('deals')}>Deals</span>
            </li>
            <li>
              <span onClick={() => handleNavClick('new-arrivals')}>New Arrivals</span>
            </li>
            {isAuth ? (
              <>
                <li>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                </li>
                <li>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
                </li>
                {currentUser?.role === 'admin' && (
                  <li>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>Admin Panel</Link>
                  </li>
                )}
                <li>
                  <span onClick={handleLogout} className="mobile-logout-anchor">Sign Out</span>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-login-drawer-btn">Sign In / Register</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
