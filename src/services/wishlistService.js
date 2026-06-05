import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach user token automatically to wishlist requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const wishlistService = {
  // Get wishlist items
  async getWishlist() {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error.message);
      throw error;
    }
  },

  // Add item to wishlist
  async addToWishlist(productId) {
    try {
      const response = await api.post('/wishlist', { productId });
      return response.data;
    } catch (error) {
      console.error('Failed to add to wishlist:', error.message);
      throw error;
    }
  },

  // Remove item from wishlist
  async removeFromWishlist(productId) {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove from wishlist:', error.message);
      throw error;
    }
  }
};
