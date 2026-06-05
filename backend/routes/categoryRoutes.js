import express from 'express';
import {
  getCategories,
  getCategorySubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Category CRUD Routes
router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, createCategory);

router.route('/:id')
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

router.route('/:id/subcategories')
  .get(getCategorySubcategories);

// Subcategory CRUD Routes
router.route('/subcategories')
  .post(protect, adminOnly, createSubcategory);

router.route('/subcategories/:id')
  .put(protect, adminOnly, updateSubcategory)
  .delete(protect, adminOnly, deleteSubcategory);

export default router;
