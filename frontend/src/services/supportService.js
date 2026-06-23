import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach the token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('highMartToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const supportService = {
  async sendChatMessage(message) {
    try {
      const response = await api.post('/support/chat', { message });
      return response.data;
    } catch (err) {
      console.error('Failed to communicate with support chatbot API:', err.message);
      throw err;
    }
  }
};
