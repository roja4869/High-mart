import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
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

  // 2. User State
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('highMartUser');
    return local ? JSON.parse(local) : null;
  });

  const logout = () => {
    authService.logout();
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  // 3. Cart & Wishlist State
  const [cart, setCart] = useState([]);

  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('highMartWishlist');
    return local ? JSON.parse(local) : [];
  });

  const enrichCartItems = (backendCart) => {
    return backendCart.map(item => {
      const prod = MOCK_PRODUCTS.find(p => p.id === item.productId);
      return {
        ...item,
        id: item.productId,
        discount: prod ? prod.discount : 0,
        category: prod ? prod.category : 'General',
        rating: prod ? prod.rating : 4.5
      };
    });
  };

  const syncCart = async () => {
    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.getCart();
        if (response.success) {
          setCart(enrichCartItems(response.cart));
        }
      } catch (err) {
        console.warn("Could not sync cart with server:", err.message);
      }
    } else {
      const local = localStorage.getItem('highMartCart');
      setCart(local ? JSON.parse(local) : []);
    }
  };

  useEffect(() => {
    syncCart();
  }, [user]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      localStorage.setItem('highMartCart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('highMartWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Actions
  const addToCart = async (product) => {
    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.addToCart(product.id, 1);
        if (response.success) {
          setCart(enrichCartItems(response.cart));
          addToast(`${product.name} added to cart.`, 'success');
        }
      } catch (error) {
        const errMsg = error.response?.data?.error || error.message;
        addToast(errMsg, 'error');
      }
    } else {
      setCart(prev => {
        const exists = prev.find(item => item.id === product.id);
        if (exists) {
          addToast(`${product.name} quantity updated in cart.`, 'success');
          return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        addToast(`${product.name} added to cart.`, 'success');
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.removeFromCart(productId);
        if (response.success) {
          setCart(enrichCartItems(response.cart));
          addToast('Item removed from cart.', 'info');
        }
      } catch (error) {
        addToast('Failed to remove item from cart.', 'error');
      }
    } else {
      setCart(prev => {
        const target = prev.find(item => item.id === productId);
        if (target) {
          addToast(`${target.name} removed from cart.`, 'info');
        }
        return prev.filter(item => item.id !== productId);
      });
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.updateQuantity(productId, quantity);
        if (response.success) {
          setCart(enrichCartItems(response.cart));
        }
      } catch (error) {
        const errMsg = error.response?.data?.error || error.message;
        addToast(errMsg, 'error');
      }
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    addToast('Shopping cart cleared.', 'info');
  };

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

  // 3. Global Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3500);
  };

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{
        theme,
        toggleTheme,
        user,
        setUser,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        setWishlist,
        toggleWishlist,
        toasts,
        addToast,
        syncCart
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
