import express from 'express';
import {
  createVendorRequest,
  getMyVendorRequests,
  getVendorRequestById,
  acceptVendorRequest,
  updateVendorStatus,
  getAllVendorAdmin,
  deleteVendorAdmin
} from '../controllers/vendorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createVendorRequest);
router.get('/my-requests', protect, getMyVendorRequests);
router.get('/admin/all', protect, authorizeRoles('VendorAdmin', 'SuperAdmin'), getAllVendorAdmin);
router.get('/:id', protect, getVendorRequestById);
router.put('/:id/accept', protect, authorizeRoles('VendorAdmin', 'SuperAdmin'), acceptVendorRequest);
router.put('/:id/status', protect, updateVendorStatus);
router.delete('/:id', protect, authorizeRoles('VendorAdmin', 'SuperAdmin'), deleteVendorAdmin);

export default router;
