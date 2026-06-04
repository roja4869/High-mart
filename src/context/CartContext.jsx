import React, { createContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    try {
      localStorage.setItem('highMartCart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart data to LocalStorage:', e);
    }
  }, [cart]);

  const addToCart = (product) => {
    // Prevent invalid or missing product IDs
    if (!product || !product.id) {
      addToast('Invalid product details. Cannot add to cart.', 'error');
      return;
    }

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
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const item = prevCart.find(i => i.id === productId);
      if (item) {
        addToast(`${item.name} removed from cart.`, 'info');
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
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
        addToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
