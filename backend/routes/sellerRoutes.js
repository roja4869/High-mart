import express from 'express';
import { 
  registerSeller, getSellerById, getPendingSellers, 
  approveSeller, rejectSeller, getAllSellers, 
  getApprovedSellers, getRejectedSellers 
} from '../controllers/sellerController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSellerDocs } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Registration
router.post('/register', uploadSellerDocs, registerSeller);

// Admin Moderation endpoints - mapped to support both /api/sellers/admin/... and /api/admin/sellers/... formats
router.get('/pending', protect, adminOnly, getPendingSellers);
router.get('/admin/pending', protect, adminOnly, getPendingSellers);

router.get('/approved', protect, adminOnly, getApprovedSellers);
router.get('/admin/approved', protect, adminOnly, getApprovedSellers);

router.get('/rejected', protect, adminOnly, getRejectedSellers);
router.get('/admin/rejected', protect, adminOnly, getRejectedSellers);

// Approve & Reject Flow
router.put('/:id/approve', protect, adminOnly, approveSeller);
router.put('/admin/:id/approve', protect, adminOnly, approveSeller);

router.put('/:id/reject', protect, adminOnly, rejectSeller);
router.put('/admin/:id/reject', protect, adminOnly, rejectSeller);

// Get All Seller Requests
router.get('/', protect, adminOnly, getAllSellers);
router.get('/admin', protect, adminOnly, getAllSellers);

// Fetch seller by application ID (keep at the end to avoid matching with /pending etc.)
router.get('/:id', protect, getSellerById);
router.get('/admin/:id', protect, adminOnly, getSellerById);

export default router;
