import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';
import { CartContext } from './context/CartContext';
import { authService } from './services/authService';
import { cartService } from './services/cartService';
import { MOCK_PRODUCTS } from './services/productService';

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
  const { cart, addToCart, removeFromCart, clearCart, toasts, addToast, updateQuantity } = useContext(CartContext);

  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('highMartTheme') || 'light';
  });

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

  // 2. Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('highMartWishlist');
    return local ? JSON.parse(local) : [];
  });

  // 3. Global Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(15000);
  const [activeNavbarTab, setActiveNavbarTab] = useState('categories');

  // 4. Reactive Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setWishlist([]);
    clearCart();
    addToast('Logged out successfully.', 'info');
  };

  const syncCart = async () => {
    // Frontend-only: Sync cart is no-op
  };

  useEffect(() => {
    localStorage.setItem('highMartWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        addToast(`${product.name} removed from wishlist.`, 'info');
        return prev.filter(item => item.id !== product.id);
      }
      addToast(`${product.name} added to wishlist!`, 'success');
      return [...prev, product];
    });
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
        removeFromCart,
        updateCartQuantity: updateQuantity,
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
