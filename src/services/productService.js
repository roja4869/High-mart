import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

import { MOCK_PRODUCTS } from '../data/products';

export const productService = {
  // Fetch all products
  async getProducts() {
    try {
      const response = await api.get('/products');
      const data = response.data || [];
      return data.map(p => ({ ...p, image: p.image || (p.images && p.images[0]) }));
    } catch (err) {
      console.warn('Axios API connection failed, returning fallback products list.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_PRODUCTS.map(p => ({ ...p, image: p.image || (p.images && p.images[0]) })));
        }, 600); // Small delay to simulate loading/skeleton
      });
    }
  },

  // Fetch product by ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      const data = response.data;
      return { ...data, image: data.image || (data.images && data.images[0]) };
    } catch (err) {
      console.warn(`Axios API connection failed, returning fallback product by ID: ${id}`, err.message);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id));
          if (product) {
            resolve({ ...product, image: product.image || (product.images && product.images[0]) });
          } else {
            reject(new Error('Product not found in database.'));
          }
        }, 600); // Small delay to simulate loading/skeleton
      });
    }
  }
};
export { MOCK_PRODUCTS };
