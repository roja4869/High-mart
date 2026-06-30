import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach the JWT Authorization token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  // Login method
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('highMartToken', response.data.token);
        localStorage.setItem('highMartUser', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      throw new Error(errorMsg);
    }
  },

  // Registration method
  async register(name, email, phone, password) {
    try {
      const response = await api.post('/auth/register', { name, email, phone, password });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      throw new Error(errorMsg);
    }
  },

  // Logout method
  logout() {
    localStorage.removeItem('highMartToken');
    localStorage.removeItem('highMartUser');
  },

  // User profile helper
  getCurrentUser() {
    const user = localStorage.getItem('highMartUser');
    return user ? JSON.parse(user) : null;
  },

  // Token helper
  getToken() {
    return localStorage.getItem('highMartToken');
  },

  // Authentication check
  isAuthenticated() {
    return !!localStorage.getItem('highMartToken');
  }
};
