import express from 'express';
import { getStats, getCharts } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure all analytical endpoints
router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/charts', getCharts);

export default router;
