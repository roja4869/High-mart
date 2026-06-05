import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('highMartCart');
      return localData ? JSON.parse(localData) : [];
    } catch (e) {
      console.error('Failed to parse cart data from LocalStorage:', e);
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const syncCart = async () => {
    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.getCart();
        if (response.success) {
          const mapped = response.cart.map(item => ({ ...item, id: item.productId }));
          setCart(mapped);
        }
      } catch (err) {
        console.warn("Could not sync cart with server:", err.message);
        if (err.response?.status === 401) {
          authService.logout();
          setCart([]);
          addToast("Session expired. Please sign in again.", "error");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } else {
      const local = localStorage.getItem('highMartCart');
      setCart(local ? JSON.parse(local) : []);
    }
  };

  // Run initial sync on mount
  useEffect(() => {
    syncCart();
  }, []);

  // Save local cart for guest users when cart state changes
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      try {
        localStorage.setItem('highMartCart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart data to LocalStorage:', e);
      }
    }
  }, [cart]);

  const addToCart = async (product) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.role === 'admin') {
      addToast('Monitoring Mode: Administrators cannot book or purchase products.', 'error');
      return;
    }

    if (!product || !product.id) {
      addToast('Invalid product details. Cannot add to cart.', 'error');
      return;
    }

    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.addToCart(product.id, 1);
        if (response.success) {
          const mapped = response.cart.map(item => ({ ...item, id: item.productId }));
          setCart(mapped);
          addToast(`${product.name} added to cart.`, 'success');
        }
      } catch (error) {
        const errMsg = error.response?.data?.error || error.message;
        addToast(errMsg, 'error');
        if (error.response?.status === 401) {
          authService.logout();
          setCart([]);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } else {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);
        if (existingProduct) {
          addToast(`Updated quantity of ${product.name} in cart.`, 'success');
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        addToast(`${product.name} added to cart.`, 'success');
        return [...prevCart, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.removeFromCart(productId);
        if (response.success) {
          const mapped = response.cart.map(item => ({ ...item, id: item.productId }));
          setCart(mapped);
          addToast('Item removed from cart.', 'info');
        }
      } catch (error) {
        const errMsg = error.response?.data?.error || error.message;
        addToast(errMsg, 'error');
        if (error.response?.status === 401) {
          authService.logout();
          setCart([]);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } else {
      setCart((prevCart) => {
        const item = prevCart.find(i => i.id === productId);
        if (item) {
          addToast(`${item.name} removed from cart.`, 'info');
        }
        return prevCart.filter((item) => item.id !== productId);
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (authService.isAuthenticated()) {
      try {
        const response = await cartService.updateQuantity(productId, quantity);
        if (response.success) {
          const mapped = response.cart.map(item => ({ ...item, id: item.productId }));
          setCart(mapped);
        }
      } catch (error) {
        const errMsg = error.response?.data?.error || error.message;
        addToast(errMsg, 'error');
        if (error.response?.status === 401) {
          authService.logout();
          setCart([]);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    addToast('Shopping cart cleared.', 'info');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartSubtotal = cart.reduce((total, item) => {
    const price = item.price * (1 - (item.discount || 0) / 100);
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        toasts,
        addToast,
        syncCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
