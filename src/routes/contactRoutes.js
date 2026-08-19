import express from 'express';
import {
  submitContactInquiry,
  getAllInquiriesAdmin,
  updateInquiryAdmin,
  deleteInquiryAdmin
} from '../controllers/contactController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContactInquiry);
router.get('/admin/all', protect, authorizeRoles('SuperAdmin', 'RideAdmin', 'ParcelAdmin', 'FreightAdmin', 'VendorAdmin'), getAllInquiriesAdmin);
router.put('/admin/:id', protect, authorizeRoles('SuperAdmin', 'RideAdmin', 'ParcelAdmin', 'FreightAdmin', 'VendorAdmin'), updateInquiryAdmin);
router.delete('/admin/:id', protect, authorizeRoles('SuperAdmin'), deleteInquiryAdmin);

export default router;
