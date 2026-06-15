import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';
import SupportChatBot from './components/SupportChatBot/SupportChatBot';
import { CartContext } from './context/CartContext';
import { authService } from './services/authService';
import { cartService } from './services/cartService';
import { wishlistService } from './services/wishlistService';

// Create Global App Context
export const AppContext = createContext();

// Simple ErrorBoundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a',
          color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '10px' }}>Something went wrong.</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Our shop portal encountered a rendering error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '12px 24px', background: '#2563EB', border: 'none',
              borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            Refresh App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  // Consume CartContext values
  const { cart, addToCart, removeFromCart, clearCart, toasts, addToast } = useContext(CartContext);

  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('highMartTheme') || 'light';
  });

  // 2. Reactive Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const user = currentUser;
  const setUser = setCurrentUser;

  // 3. Wishlist State
  const [wishlist, setWishlist] = useState([]);

  // 4. Global Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(15000);
  const [activeNavbarTab, setActiveNavbarTab] = useState('categories');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('highMartTheme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [theme]);

  // Sync/fetch wishlist when user logs in/changes or on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('highMartToken');
      if (token) {
        try {
          const res = await wishlistService.getWishlist();
          if (res && res.wishlist) {
            setWishlist(res.wishlist);
          }
        } catch (e) {
          console.error('Failed to load wishlist from database:', e);
        }
      } else {
        const local = localStorage.getItem('highMartWishlist');
        setWishlist(local ? JSON.parse(local) : []);
      }
    };
    fetchWishlist();
  }, [currentUser]);
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateCartQuantity = updateQuantity;

  const syncCart = async () => {
    // 1. Sync cart
    await syncCartWithBackend();
    
    // 2. Sync wishlist
    const token = localStorage.getItem('highMartToken');
    if (token) {
      try {
        const localWish = localStorage.getItem('highMartWishlist');
        const guestWish = localWish ? JSON.parse(localWish) : [];
        if (guestWish.length > 0) {
          for (const item of guestWish) {
            await wishlistService.addToWishlist(item.id);
          }
          localStorage.removeItem('highMartWishlist');
        }
        const res = await wishlistService.getWishlist();
        if (res && res.wishlist) {
          setWishlist(res.wishlist);
        }
      } catch (e) {
        console.error('Failed to sync wishlist with backend:', e);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('highMartToken');
    if (!token) {
      localStorage.setItem('highMartWishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const toggleWishlist = async (product) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.role === 'admin') {
      addToast('Monitoring Mode: Administrators cannot use the wishlist feature.', 'error');
      return;
    }

    if (!product || !product.id) return;
    const token = localStorage.getItem('highMartToken');

    if (token) {
      const exists = wishlist.some(item => item.id === product.id);
      try {
        if (exists) {
          const res = await wishlistService.removeFromWishlist(product.id);
          if (res && res.wishlist) {
            setWishlist(res.wishlist);
            addToast(`${product.name} removed from wishlist.`, 'info');
          }
        } else {
          const res = await wishlistService.addToWishlist(product.id);
          if (res && res.wishlist) {
            setWishlist(res.wishlist);
            addToast(`${product.name} added to wishlist!`, 'success');
          }
        }
      } catch (err) {
        addToast(err.response?.data?.message || err.message || 'Failed to update wishlist', 'error');
      }
    } else {
      setWishlist(prev => {
        const exists = prev.find(item => item.id === product.id);
        if (exists) {
          addToast(`${product.name} removed from wishlist.`, 'info');
          return prev.filter(item => item.id !== product.id);
        }
        addToast(`${product.name} added to wishlist!`, 'success');
        return [...prev, product];
      });
    }
  };

  // Define helper variables for deprecated/alternate contexts
  const user = currentUser;
  const setUser = setCurrentUser;
  const updateCartQuantity = updateQuantity;
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{
        theme,
        toggleTheme,
        user: currentUser,
        setUser: setCurrentUser,
        logout,
        cart,
        addToCart,
        updateCartQuantity: updateQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        setWishlist,
        toggleWishlist,
        toasts,
        addToast,
        syncCart,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        setSelectedCategories,
        priceRange,
        setPriceRange,
        activeNavbarTab,
        setActiveNavbarTab,
        currentUser,
        setCurrentUser
      }}>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />
            <main className="main-content-flow">
              <AppRoutes />
            </main>
            <Footer />
            <SupportChatBot />
            
            {/* Dynamic Toast Container */}
            <div className="toast-container">
              {toasts.map(toast => (
                <div key={toast.id} className={`toast show ${toast.type}`}>
                  <span className="toast-icon">
                    {toast.type === 'success' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                  </span>
                  <span className="toast-content">{toast.message}</span>
                </div>
              ))}
            </div>
          </div>
        </BrowserRouter>
      </AppContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
