import express from 'express';
import { createPaymentIntent, verifyRazorpay } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both endpoints are protected by auth token
router.use(protect);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/verify-razorpay', verifyRazorpay);

export default router;
