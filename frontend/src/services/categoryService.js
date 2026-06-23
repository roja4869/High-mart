import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach user token automatically for admin modify endpoints
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const categoryService = {
  // Get category tree
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error.message);
      throw error;
    }
  },

  // Get direct subcategories for category
  async getCategorySubcategories(categoryId) {
    try {
      const response = await api.get(`/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch subcategories for category ${categoryId}:`, error.message);
      throw error;
    }
  },

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error.message);
      throw error;
    }
  },

  // Update existing category
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update category ${categoryId}:`, error.message);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete category ${categoryId}:`, error.message);
      throw error;
    }
  },

  // Create new subcategory
  async createSubcategory(subcategoryData) {
    try {
      const response = await api.post('/categories/subcategories', subcategoryData);
      return response.data;
    } catch (error) {
      console.error('Failed to create subcategory:', error.message);
      throw error;
    }
  },

  // Update subcategory
  async updateSubcategory(subcategoryId, subcategoryData) {
    try {
      const response = await api.put(`/categories/subcategories/${subcategoryId}`, subcategoryData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update subcategory ${subcategoryId}:`, error.message);
      throw error;
    }
  },

  // Delete subcategory
  async deleteSubcategory(subcategoryId) {
    try {
      const response = await api.delete(`/categories/subcategories/${subcategoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete subcategory ${subcategoryId}:`, error.message);
      throw error;
    }
  }
};
