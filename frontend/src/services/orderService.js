import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach user token automatically to order requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const orderService = {
  // Place a new order
  async placeOrder(shippingAddress) {
    try {
      const response = await api.post('/orders', { shippingAddress });
      return response.data;
    } catch (error) {
      console.error('Failed to place order:', error.message);
      throw error;
    }
  },

  // Get user's orders
  async getOrders() {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error.message);
      throw error;
    }
  },

  // Get single order details
  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error.message);
      throw error;
    }
  },

  // Cancel order
  async cancelOrder(id) {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel order ${id}:`, error.message);
      throw error;
    }
  }
};
