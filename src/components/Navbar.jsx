import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AppContext } from '../App';
import { ShoppingCart, Heart, Menu, X, ShoppingBag, Sun, Moon, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const { 
    theme, 
    toggleTheme, 
    searchQuery, 
    setSearchQuery, 
    activeNavbarTab, 
    setActiveNavbarTab,
    wishlist,
    currentUser
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const handleNavClick = (tab, path) => {
    setActiveNavbarTab(tab);
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    navigate('/cart');
    setMobileMenuOpen(false);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const displayName = currentUser ? currentUser.name : '';
  const shortName = displayName ? displayName.split(' ')[0].toLowerCase() : '';
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : '';

  return (
    <nav className="navbar-container glass-effect">
      <div className="navbar-content">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={() => handleNavClick('home', '/')}>
          <div className="logo-icon-wrapper">
            <ShoppingBag className="logo-svg" size={22} />
          </div>
          <span className="brand-name">High Mart</span>
        </Link>

        {!isAuthPage && (
          <>
            {/* Center Search Bar */}
            <div className="navbar-search-wrapper">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="navbar-search-input"
              />
              <Search size={18} className="navbar-search-icon" />
            </div>

            {/* Navigation Links - Desktop */}
            <ul className="navbar-links-desktop">
              <li>
                <button 
                  onClick={() => handleNavClick('home', '/')} 
                  className={`nav-link-btn ${activeNavbarTab === 'home' && location.pathname === '/' ? 'active-link' : ''}`}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('categories', '/products')} 
                  className={`nav-link-btn ${activeNavbarTab === 'categories' && location.pathname === '/products' ? 'active-link' : ''}`}
                >
                  Categories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('deals', '/products')} 
                  className={`nav-link-btn ${activeNavbarTab === 'deals' && location.pathname === '/products' ? 'active-link' : ''}`}
                >
                  Deals
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavClick('newArrivals', '/products')} 
                  className={`nav-link-btn ${activeNavbarTab === 'newArrivals' && location.pathname === '/products' ? 'active-link' : ''}`}
                >
                  New Arrivals
                </button>
              </li>
            </ul>

            {/* Action Controls */}
            <div className="navbar-actions">
              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="theme-toggle-btn-glow" aria-label="Toggle Theme">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Wishlist Link Icon */}
              <Link 
                to="/wishlist" 
                className={`wishlist-icon-wrapper ${location.pathname === '/wishlist' ? 'active-action' : ''}`}
                aria-label="View Wishlist"
              >
                <Heart size={20} className="wishlist-svg-icon" />
                {wishlist.length > 0 && (
                  <span className="wishlist-badge-count">{wishlist.length}</span>
                )}
              </Link>

              {/* Cart Icon Trigger */}
              <Link 
                to="/cart" 
                onClick={handleCartClick} 
                className={`cart-icon-wrapper-new ${location.pathname === '/cart' ? 'active-action' : ''}`}
                aria-label="View Shopping Cart"
              >
                <ShoppingCart size={20} className="cart-svg-icon" />
                {cartCount > 0 && (
                  <span className="cart-badge-count-new animate-pop">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Account avatar badge */}
              {currentUser && (
                <div className="navbar-profile-pill" onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : '/profile')}>
                  <div className="profile-avatar-circle">
                    <span>{avatarLetter}</span>
                  </div>
                  <span className="profile-username">{shortName}</span>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="mobile-hamburger-btn"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {!isAuthPage && mobileMenuOpen && (
        <div className="navbar-mobile-drawer animate-slide-down">
          {/* Mobile Search */}
          <div className="mobile-search-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="mobile-search-input"
            />
            <Search size={16} className="mobile-search-icon" />
          </div>
          <ul className="mobile-drawer-links">
            <li>
              <button onClick={() => handleNavClick('home', '/')} className="mobile-nav-btn">Home</button>
            </li>
            <li>
              <button onClick={() => handleNavClick('categories', '/products')} className="mobile-nav-btn">Categories</button>
            </li>
            <li>
              <button onClick={() => handleNavClick('deals', '/products')} className="mobile-nav-btn">Deals</button>
            </li>
            <li>
              <button onClick={() => handleNavClick('newArrivals', '/products')} className="mobile-nav-btn">New Arrivals</button>
            </li>
            <li>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlist.length})</Link>
            </li>
            {currentUser && (
              <li>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile ({shortName})</Link>
              </li>
            )}
            <li>
              <Link to="/cart" onClick={handleCartClick} className="mobile-cart-link">
                <span>Shopping Cart</span>
                {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
