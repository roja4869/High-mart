import express from 'express';
import { getSellerDashboard, getSellerProfile, updateSellerProfile, getSellerStatus } from '../controllers/sellerDashboardController.js';
import { submitSellerRequest } from '../controllers/sellerRequestController.js';
import { uploadSellerDocs } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public registration endpoint
router.post('/register', uploadSellerDocs, submitSellerRequest);

// Protected dashboard/profile/status endpoints
router.get('/status', protect, getSellerStatus);
router.get('/dashboard', protect, getSellerDashboard);
router.get('/profile', protect, getSellerProfile);
router.put('/profile', protect, updateSellerProfile);

export default router;
