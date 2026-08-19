import express from 'express';
import {
  createReview,
  getReviewsByOrder,
  getReviewsByVendorAdmin,
  getAllReviews,
  deleteReviewAdmin
} from '../controllers/reviewController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.post('/rate', protect, createReview);
router.get('/order/:orderId', getReviewsByOrder);
router.get('/vendor/:vendorAdminId', getReviewsByVendorAdmin);
router.get('/', getAllReviews);
router.delete('/:id', protect, authorizeRoles('SuperAdmin'), deleteReviewAdmin);

export default router;
