import express from 'express';
import {
  initiateCall,
  getMyCallLogs,
  updateCallStatus,
  getCallByRoomId
} from '../controllers/callController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiateCall);
router.get('/logs', protect, getMyCallLogs);
router.get('/room/:roomId', protect, getCallByRoomId);
router.put('/:id/status', protect, updateCallStatus);

export default router;
