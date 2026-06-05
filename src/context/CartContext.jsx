import React, { createContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Load initial cart
  useEffect(() => {
    const loadInitialCart = async () => {
      const token = localStorage.getItem('highMartToken');
      if (token) {
        try {
          const response = await cartService.getCart();
          if (response && response.cart) {
            setCart(response.cart);
          }
        } catch (e) {
          console.error('Failed to load cart from backend:', e);
        }
      } else {
        try {
          const localData = localStorage.getItem('highMartCart');
          setCart(localData ? JSON.parse(localData) : []);
        } catch (e) {
          console.error('Failed to parse cart data from LocalStorage:', e);
          setCart([]);
        }
      }
    };
    loadInitialCart();
  }, []);

  // Save guest cart to LocalStorage only if guest
  useEffect(() => {
    const token = localStorage.getItem('highMartToken');
    if (!token) {
      try {
        localStorage.setItem('highMartCart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart data to LocalStorage:', e);
      }
    }
  }, [cart]);

  const syncCartWithBackend = async () => {
    const token = localStorage.getItem('highMartToken');
    if (!token) return;

    try {
      const localData = localStorage.getItem('highMartCart');
      const guestCart = localData ? JSON.parse(localData) : [];

      if (guestCart.length > 0) {
        for (const item of guestCart) {
          await cartService.addToCart(item.productId || item.id, item.quantity);
        }
        localStorage.removeItem('highMartCart');
      }

      const response = await cartService.getCart();
      if (response && response.cart) {
        setCart(response.cart);
      }
    } catch (e) {
      console.error('Error syncing cart with backend:', e);
    }
  };

  const addToCart = async (product) => {
    if (!product || (!product.id && !product.productId)) {
      addToast('Invalid product details. Cannot add to cart.', 'error');
      return;
    }

    const prodId = product.productId || product.id;
    const token = localStorage.getItem('highMartToken');

    if (token) {
      try {
        const response = await cartService.addToCart(prodId, 1);
        if (response && response.cart) {
          setCart(response.cart);
          addToast(`${product.name} added to cart.`, 'success');
        }
      } catch (error) {
        addToast(error.response?.data?.message || error.message || 'Failed to add item to cart', 'error');
      }
    } else {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => (item.productId || item.id) === prodId);
        if (existingProduct) {
          addToast(`Updated quantity of ${product.name} in cart.`, 'success');
          return prevCart.map((item) =>
            (item.productId || item.id) === prodId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        addToast(`${product.name} added to cart.`, 'success');
        return [...prevCart, { ...product, productId: prodId, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('highMartToken');

    if (token) {
      try {
        const response = await cartService.removeFromCart(productId);
        if (response && response.cart) {
          setCart(response.cart);
          addToast('Item removed from cart.', 'info');
        }
      } catch (error) {
        addToast(error.response?.data?.message || error.message || 'Failed to remove item', 'error');
      }
    } else {
      setCart((prevCart) => {
        const item = prevCart.find(i => (i.productId || i.id) === productId);
        if (item) {
          addToast(`${item.name} removed from cart.`, 'info');
        }
        return prevCart.filter((item) => (item.productId || item.id) !== productId);
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    const token = localStorage.getItem('highMartToken');

    if (token) {
      try {
        const response = await cartService.updateQuantity(productId, quantity);
        if (response && response.cart) {
          setCart(response.cart);
        }
      } catch (error) {
        addToast(error.response?.data?.message || error.message || 'Failed to update quantity', 'error');
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          (item.productId || item.id) === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('highMartToken');

    if (token) {
      try {
        await cartService.clearCart();
        setCart([]);
        addToast('Shopping cart cleared.', 'info');
      } catch (error) {
        addToast('Failed to clear cart in database.', 'error');
      }
    } else {
      setCart([]);
      addToast('Shopping cart cleared.', 'info');
    }
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
        syncCartWithBackend
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
