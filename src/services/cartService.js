import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach user token automatically to cart requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const cartService = {
  // Get active cart items
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cart:', error.message);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await api.post('/cart', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('Failed to add item to cart:', error.message);
      throw error;
    }
  },

  // Update item quantity
  async updateQuantity(productId, quantity) {
    try {
      const response = await api.put(`/cart/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Failed to update cart quantity:', error.message);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const response = await api.delete(`/cart/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove item from cart:', error.message);
      throw error;
    }
  }
};
