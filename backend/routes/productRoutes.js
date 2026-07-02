import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { protect, sellerOrAdmin } from '../middleware/authMiddleware.js';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, sellerOrAdmin, uploadProductImage.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, sellerOrAdmin, uploadProductImage.single('image'), updateProduct)
  .delete(protect, sellerOrAdmin, deleteProduct);

export default router;
