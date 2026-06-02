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
      console.warn('Axios API connection failed, falling back to simulated localStorage auth database.', err.message);
      
      // Client-side fallback simulation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check custom mock registration records
          const mockUsers = JSON.parse(localStorage.getItem('highMartMockUsers') || '[]');
          
          // Normalized checks
          const normalizedEmail = email.toLowerCase().trim();
          
          // Standard default account login option
          if (normalizedEmail === 'user@example.com' && password === 'password123') {
            const defaultUser = { id: 'default-uuid', name: 'Rishi Shopora', email: 'user@example.com', phone: '9876543210' };
            const mockToken = 'mock-jwt-header.' + btoa(JSON.stringify(defaultUser)) + '.mock-signature';
            localStorage.setItem('highMartToken', mockToken);
            localStorage.setItem('highMartUser', JSON.stringify(defaultUser));
            resolve({ message: 'Login successful (mock)!', token: mockToken, user: defaultUser });
            return;
          }

          // Match registered user
          const user = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
          if (user && user.password === password) {
            const matchedUser = { id: user.id, name: user.name, email: user.email, phone: user.phone };
            const mockToken = 'mock-jwt-header.' + btoa(JSON.stringify(matchedUser)) + '.mock-signature';
            localStorage.setItem('highMartToken', mockToken);
            localStorage.setItem('highMartUser', JSON.stringify(matchedUser));
            resolve({ message: 'Login successful (mock)!', token: mockToken, user: matchedUser });
          } else {
            reject(new Error('Invalid email or password credentials.'));
          }
        }, 1000);
      });
    }
  },

  // Registration method
  async register(name, email, phone, password) {
    try {
      const response = await api.post('/auth/register', { name, email, phone, password });
      return response.data;
    } catch (err) {
      console.warn('Axios API connection failed, falling back to simulated LocalStorage registration.', err.message);
      
      // Client-side fallback simulation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockUsers = JSON.parse(localStorage.getItem('highMartMockUsers') || '[]');
          const normalizedEmail = email.toLowerCase().trim();
          
          // Check if user already exists
          const exists = mockUsers.some(u => u.email.toLowerCase() === normalizedEmail) || normalizedEmail === 'user@example.com';
          if (exists) {
            reject(new Error('An account with this email address already exists.'));
            return;
          }

          // Save new user
          const newUser = { id: Date.now().toString(), name, email: normalizedEmail, phone, password };
          mockUsers.push(newUser);
          localStorage.setItem('highMartMockUsers', JSON.stringify(mockUsers));
          resolve({ message: 'Registration successful!' });
        }, 1000);
      });
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
