import axios from 'axios';

// Configure standard API requester
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const adminService = {
  // ==================== REPORTS & STATS ====================
  async getStats() {
    try {
      const response = await api.get('/reports/stats');
      return response.data.stats;
    } catch (err) {
      console.error('Failed to get stats:', err.message);
      throw err;
    }
  },

  async getCharts() {
    try {
      const response = await api.get('/reports/charts');
      return response.data.charts;
    } catch (err) {
      console.error('Failed to get charts:', err.message);
      throw err;
    }
  },

  async getInventoryLogs() {
    try {
      const response = await api.get('/reports/inventory-logs');
      return response.data.logs;
    } catch (err) {
      console.error('Failed to get inventory logs:', err.message);
      throw err;
    }
  },

  // ==================== USER MANAGEMENT ====================
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data.users;
    } catch (err) {
      console.error('Failed to get users:', err.message);
      throw err;
    }
  },

  async updateUserRole(id, role) {
    try {
      const response = await api.put(`/users/${id}`, { role });
      return response.data;
    } catch (err) {
      console.error('Failed to update user role:', err.message);
      throw err;
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete user:', err.message);
      throw err;
    }
  },

  // ==================== ORDER MANAGEMENT ====================
  async getOrders() {
    try {
      const response = await api.get('/orders');
      return response.data.orders;
    } catch (err) {
      console.error('Failed to get orders:', err.message);
      throw err;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/orders/${id}`, { status });
      return response.data;
    } catch (err) {
      console.error('Failed to update order status:', err.message);
      throw err;
    }
  },

  // ==================== PRODUCT CRUD ====================
  async createProduct(formData) {
    try {
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to create product:', err.message);
      throw err;
    }
  },

  async updateProduct(id, formData) {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to update product:', err.message);
      throw err;
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete product:', err.message);
      throw err;
    }
  }
};
