import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrdersOrOrderById, 
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
  .get(getOrdersOrOrderById)
  .put(adminOnly, updateOrderStatus)
  .delete(cancelOrder);

export default router;
