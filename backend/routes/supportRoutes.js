import express from 'express';
import { handleChatMessage } from '../controllers/supportController.js';

const router = express.Router();

router.post('/chat', handleChatMessage);

export default router;
