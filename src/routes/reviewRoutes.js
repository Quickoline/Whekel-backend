import express from 'express';
import {
  createReview,
  getReviewsByOrder,
  getAllReviews,
  deleteReviewAdmin
} from '../controllers/reviewController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/order/:orderId', getReviewsByOrder);
router.get('/all', getAllReviews);
router.delete('/:id', protect, authorizeRoles('SuperAdmin'), deleteReviewAdmin);

export default router;
