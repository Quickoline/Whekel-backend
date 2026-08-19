import express from 'express';
import {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  markMessagesRead
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/conversation', protect, getOrCreateConversation);
router.post('/message', protect, sendMessage);
router.get('/messages/:conversationId', protect, getMessages);
router.put('/read/:conversationId', protect, markMessagesRead);

export default router;
