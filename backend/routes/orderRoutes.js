import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder 
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection middleware to all order endpoints
router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(adminOnly, updateOrderStatus)
  .delete(cancelOrder);

export default router;
