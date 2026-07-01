import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Heart, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import { AppContext } from '../../App';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AppContext);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleItemClick = (path, stateObj = null) => {
    setIsOpen(false);
    navigate(path, stateObj ? { state: stateObj } : undefined);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`profile-trigger-btn ${isOpen ? 'active' : ''}`}
        aria-label="Profile Menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <User size={20} className="profile-svg-icon" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="profile-dropdown-menu"
          >
            {currentUser ? (
              <>
                <div className="dropdown-user-header">
                  <div className="user-avatar-small">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-meta-info">
                    <span className="user-display-name">{currentUser.name}</span>
                    <span className="user-display-email">{currentUser.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <ul className="dropdown-menu-list">
                  <li>
                    <button onClick={() => handleItemClick('/profile', { activeTab: 'overview' })} className="dropdown-menu-item">
                      <User size={16} />
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleItemClick('/profile', { activeTab: 'orders' })} className="dropdown-menu-item">
                      <ShoppingBag size={16} />
                      <span>Orders</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleItemClick('/profile', { activeTab: 'wishlist' })} className="dropdown-menu-item">
                      <Heart size={16} />
                      <span>Wishlist</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleItemClick('/profile', { activeTab: 'settings' })} className="dropdown-menu-item">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </li>
                  <div className="dropdown-divider" />
                  <li>
                    <button onClick={handleLogoutClick} className="dropdown-menu-item logout-item">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <div className="dropdown-guest-header">
                  <span>Welcome Guest</span>
                  <p>Access your account & orders</p>
                </div>
                <div className="dropdown-divider" />
                <ul className="dropdown-menu-list">
                  <li>
                    <button onClick={() => handleItemClick('/login')} className="dropdown-menu-item">
                      <LogIn size={16} />
                      <span>Login</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleItemClick('/register')} className="dropdown-menu-item">
                      <UserPlus size={16} />
                      <span>Register</span>
                    </button>
                  </li>
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
