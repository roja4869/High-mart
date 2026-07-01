import express from 'express';
import { getAllSellerRequests, getSellerRequestById, approveSellerRequest, rejectSellerRequest } from '../controllers/sellerRequestController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllSellerRequests);
router.get('/:id', protect, adminOnly, getSellerRequestById);
router.put('/:id/approve', protect, adminOnly, approveSellerRequest);
router.put('/:id/reject', protect, adminOnly, rejectSellerRequest);

export default router;
