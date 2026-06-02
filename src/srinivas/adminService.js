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
      console.warn('Backend connection unavailable, utilizing mock statistics calculations.', err.message);
      
      // Standalone simulation fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const orders = JSON.parse(localStorage.getItem('highMartMockOrders') || '[]');
          const users = JSON.parse(localStorage.getItem('highMartMockUsers') || '[]');
          const activeOrders = orders.filter(o => o.status !== 'Cancelled');
          const revenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

          resolve({
            totalRevenue: parseFloat((1449.92 + revenue).toFixed(2)),
            totalOrders: 6 + orders.length,
            totalUsers: 1 + users.length,
            lowStockAlerts: 1,
            awaitingAction: orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length + 2
          });
        }, 800);
      });
    }
  },

  async getCharts() {
    try {
      const response = await api.get('/reports/charts');
      return response.data.charts;
    } catch (err) {
      console.warn('Backend connection unavailable, utilizing mock analytics calculations.', err.message);

      // Standalone charts simulation fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockOrders = JSON.parse(localStorage.getItem('highMartMockOrders') || '[]');
          
          const salesOverTime = [
            { date: 'May 27', amount: 389.98 },
            { date: 'May 28', amount: 199.99 },
            { date: 'May 29', amount: 0 },
            { date: 'May 30', amount: 179.97 },
            { date: 'May 31', amount: 24.99 },
            { date: 'Jun 1', amount: 274.98 },
            { date: 'Jun 2', amount: 199.99 }
          ];

          // Accumulate custom mock orders placed in local storage
          mockOrders.forEach(o => {
            const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const index = salesOverTime.findIndex(s => s.date === dateStr);
            if (index !== -1) {
              salesOverTime[index].amount = parseFloat((salesOverTime[index].amount + o.totalAmount).toFixed(2));
            } else {
              salesOverTime.push({ date: dateStr, amount: o.totalAmount });
            }
          });

          const categoryBreakdown = [
            { category: 'Appliances', value: 519.96 },
            { category: 'Electronics', value: 399.98 },
            { category: 'Furniture', value: 249.99 },
            { category: 'Kitchenware', value: 74.97 },
            { category: 'Footwear', value: 0 }
          ];

          const topProducts = [
            { name: 'Wireless Noise-Cancelling Headphones', qty: 2, revenue: 399.98, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
            { name: 'Premium Coffee Maker', qty: 2, revenue: 259.98, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80' },
            { name: 'Ergonomic Office Chair', qty: 1, revenue: 249.99, image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400&q=80' }
          ];

          const recentOrders = [
            { id: 104, customerName: 'Jane Doe', totalAmount: 199.99, status: 'Processing', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
            { id: 103, customerName: 'Jane Doe', totalAmount: 274.98, status: 'Pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 102, customerName: 'Jane Doe', totalAmount: 49.98, status: 'Shipped', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 101, customerName: 'Jane Doe', totalAmount: 129.99, status: 'Delivered', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
          ];

          // Add locally placed orders
          mockOrders.forEach(o => {
            recentOrders.unshift({
              id: o.id,
              customerName: o.customerName || 'Jane Doe',
              totalAmount: o.totalAmount,
              status: o.status,
              createdAt: o.createdAt
            });
          });

          resolve({
            salesOverTime,
            categoryBreakdown,
            topProducts,
            recentOrders: recentOrders.slice(0, 4)
          });
        }, 800);
      });
    }
  },

  async getInventoryLogs() {
    try {
      const response = await api.get('/reports/inventory-logs');
      return response.data.logs;
    } catch (err) {
      console.warn('Backend connection unavailable, pulling simulated inventory logs.', err.message);

      return new Promise((resolve) => {
        setTimeout(() => {
          const mockOrders = JSON.parse(localStorage.getItem('highMartMockOrders') || '[]');
          
          const defaultLogs = [
            { id: 4, productId: 4, productName: "Stainless Steel Water Bottle", activityType: "Order Deduction", quantityChange: -2, remainingStock: 48, performedBy: "Order #HM-102 (Jane Doe)", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 3, productId: 1, productName: "Premium Coffee Maker", activityType: "Order Deduction", quantityChange: -1, remainingStock: 14, performedBy: "Order #HM-101 (Jane Doe)", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 2, productId: 2, productName: "Wireless Noise-Cancelling Headphones", activityType: "Stock Inbound", quantityChange: 25, remainingStock: 25, performedBy: "System Seeding", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 1, productId: 1, productName: "Premium Coffee Maker", activityType: "Stock Inbound", quantityChange: 15, remainingStock: 15, performedBy: "System Seeding", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
          ];

          // Dynamically prepend logs for newly created mock orders in client
          mockOrders.forEach((o, index) => {
            o.items.forEach((item, itemIdx) => {
              defaultLogs.unshift({
                id: 100 + index * 10 + itemIdx,
                productId: item.productId,
                productName: item.name,
                activityType: "Order Deduction",
                quantityChange: -item.quantity,
                remainingStock: 5, // Simulated
                performedBy: `Order #HM-${o.id} (${o.customerName || 'Shopper'})`,
                timestamp: o.createdAt
              });
            });
          });

          resolve(defaultLogs);
        }, 500);
      });
    }
  },

  // ==================== USER MANAGEMENT ====================
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data.users;
    } catch (err) {
      console.warn('Backend connection unavailable, utilizing mock user list.', err.message);

      return new Promise((resolve) => {
        setTimeout(() => {
          const registeredMockUsers = JSON.parse(localStorage.getItem('highMartMockUsers') || '[]');
          
          const defaultUsers = [
            { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
            { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
          ];

          const combined = [
            ...defaultUsers,
            ...registeredMockUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user' }))
          ];

          resolve(combined);
        }, 500);
      });
    }
  },

  async updateUserRole(id, role) {
    try {
      const response = await api.put(`/users/${id}`, { role });
      return response.data;
    } catch (err) {
      console.warn('Backend connection unavailable, editing mock user role in localStorage.', err.message);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id === 'default-uuid' || id === 2) {
            reject(new Error('Demoting standard administrators is restricted.'));
            return;
          }

          const mockUsers = JSON.parse(localStorage.getItem('highMartMockUsers') || '[]');
          const userIndex = mockUsers.findIndex(u => u.id.toString() === id.toString());

          if (userIndex !== -1) {
            mockUsers[userIndex].role = role;
            localStorage.setItem('highMartMockUsers', JSON.stringify(mockUsers));
            resolve({ success: true, message: 'User role updated successfully (mock)!' });
          } else {
            reject(new Error('User not found.'));
          }
        }, 500);
      });
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Backend connection unavailable, removing user from mock localStorage db.', err.message);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id === 1 || id === 2 || id === 'default-uuid') {
            reject(new Error('Standard pre-seeded users cannot be deleted.'));
            return;
          }

          const mockUsers = JSON.parse(localStorage.getItem('highMartMockUsers') || '[]');
          const filtered = mockUsers.filter(u => u.id.toString() !== id.toString());
          
          if (filtered.length !== mockUsers.length) {
            localStorage.setItem('highMartMockUsers', JSON.stringify(filtered));
            resolve({ success: true, message: 'User account deleted successfully (mock).' });
          } else {
            reject(new Error('User account not found.'));
          }
        }, 500);
      });
    }
  },

  // ==================== ORDER MANAGEMENT ====================
  async getOrders() {
    try {
      const response = await api.get('/orders');
      return response.data.orders;
    } catch (err) {
      console.warn('Backend connection unavailable, listing mock orders.', err.message);

      return new Promise((resolve) => {
        setTimeout(() => {
          const localOrders = JSON.parse(localStorage.getItem('highMartMockOrders') || '[]');
          
          const defaultOrders = [
            {
              id: 104,
              userId: 1,
              customerName: 'Jane Doe',
              items: [{ name: 'Wireless Noise-Cancelling Headphones', price: 199.99, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' }],
              totalAmount: 199.99,
              shippingAddress: '456 Oak Rd, Los Angeles, CA 90001',
              status: 'Processing',
              paymentMethod: 'Stripe',
              paymentStatus: 'Paid',
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 103,
              userId: 1,
              customerName: 'Jane Doe',
              items: [
                { name: 'Ergonomic Office Chair', price: 249.99, quantity: 1, image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400&q=80' },
                { name: 'Stainless Steel Water Bottle', price: 24.99, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' }
              ],
              totalAmount: 274.98,
              shippingAddress: '123 Main St, New York, NY 10001',
              status: 'Pending',
              paymentMethod: 'Stripe',
              paymentStatus: 'Paid',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 102,
              userId: 1,
              customerName: 'Jane Doe',
              items: [{ name: 'Stainless Steel Water Bottle', price: 24.99, quantity: 2, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' }],
              totalAmount: 49.98,
              shippingAddress: '123 Main St, New York, NY 10001',
              status: 'Shipped',
              paymentMethod: 'Razorpay',
              paymentStatus: 'Paid',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 101,
              userId: 1,
              customerName: 'Jane Doe',
              items: [{ name: 'Premium Coffee Maker', price: 129.99, quantity: 1, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80' }],
              totalAmount: 129.99,
              shippingAddress: '123 Main St, New York, NY 10001',
              status: 'Delivered',
              paymentMethod: 'Stripe',
              paymentStatus: 'Paid',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];

          resolve([...localOrders, ...defaultOrders]);
        }, 600);
      });
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/orders/${id}`, { status });
      return response.data;
    } catch (err) {
      console.warn('Backend connection unavailable, modifying order status locally.', err.message);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const localOrders = JSON.parse(localStorage.getItem('highMartMockOrders') || '[]');
          const index = localOrders.findIndex(o => o.id.toString() === id.toString());

          if (index !== -1) {
            localOrders[index].status = status;
            localStorage.setItem('highMartMockOrders', JSON.stringify(localOrders));
            resolve({ success: true, message: `Order status updated to ${status} successfully (mock)!` });
          } else {
            // Check if default pre-seeded order
            const defaults = [101, 102, 103, 104];
            if (defaults.includes(parseInt(id))) {
              // Successfully simulate success
              resolve({ success: true, message: `Order #${id} status updated to ${status} (simulated).` });
            } else {
              reject(new Error('Order not found.'));
            }
          }
        }, 500);
      });
    }
  },

  // ==================== PRODUCT CRUD ====================
  async createProduct(formData) {
    try {
      // Use multipart for image uploads
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.warn('Backend connection unavailable, saving new product mock details.', err.message);

      return new Promise((resolve) => {
        setTimeout(() => {
          // Read new fields
          const name = formData.get('name');
          const description = formData.get('description');
          const price = parseFloat(formData.get('price'));
          const category = formData.get('category');
          const stock = parseInt(formData.get('stock'));
          
          const mockProducts = JSON.parse(localStorage.getItem('highMartMockProducts') || '[]');
          
          const newProduct = {
            id: Date.now(),
            name,
            description,
            price,
            category,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', // Default gorgeous product image
            stock,
            discount: 10,
            rating: 4.5
          };

          mockProducts.push(newProduct);
          localStorage.setItem('highMartMockProducts', JSON.stringify(mockProducts));
          
          resolve({ success: true, message: 'Product created successfully (mock)!', product: newProduct });
        }, 800);
      });
    }
  },

  async updateProduct(id, formData) {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.warn('Backend connection unavailable, updating mock product store.', err.message);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockProducts = JSON.parse(localStorage.getItem('highMartMockProducts') || '[]');
          const index = mockProducts.findIndex(p => p.id.toString() === id.toString());

          if (index !== -1) {
            const name = formData.get('name');
            const description = formData.get('description');
            const price = formData.get('price');
            const category = formData.get('category');
            const stock = formData.get('stock');

            mockProducts[index] = {
              ...mockProducts[index],
              name: name !== null ? name : mockProducts[index].name,
              description: description !== null ? description : mockProducts[index].description,
              price: price !== null ? parseFloat(price) : mockProducts[index].price,
              category: category !== null ? category : mockProducts[index].category,
              stock: stock !== null ? parseInt(stock) : mockProducts[index].stock
            };

            localStorage.setItem('highMartMockProducts', JSON.stringify(mockProducts));
            resolve({ success: true, message: 'Product updated successfully (mock)!', product: mockProducts[index] });
          } else {
            // Check if default pre-seeded product
            const defaults = [1, 2, 3, 4, 5];
            if (defaults.includes(parseInt(id))) {
              resolve({ success: true, message: 'Default product updated (simulated).' });
            } else {
              reject(new Error('Product not found in database.'));
            }
          }
        }, 800);
      });
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Backend connection unavailable, deleting mock product from local store.', err.message);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockProducts = JSON.parse(localStorage.getItem('highMartMockProducts') || '[]');
          const filtered = mockProducts.filter(p => p.id.toString() !== id.toString());

          if (filtered.length !== mockProducts.length) {
            localStorage.setItem('highMartMockProducts', JSON.stringify(filtered));
            resolve({ success: true, message: 'Product deleted successfully (mock).' });
          } else {
            const defaults = [1, 2, 3, 4, 5];
            if (defaults.includes(parseInt(id))) {
              resolve({ success: true, message: 'Default product deleted (simulated).' });
            } else {
              reject(new Error('Product not found in database.'));
            }
          }
        }, 500);
      });
    }
  }
};
