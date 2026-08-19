import express from 'express';
import {
  createParcel,
  getMyParcels,
  getParcelById,
  acceptParcel,
  updateParcelStatus,
  getAllParcelsAdmin,
  deleteParcelAdmin
} from '../controllers/parcelController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createParcel);
router.get('/my-parcels', protect, getMyParcels);
router.get('/admin/all', protect, authorizeRoles('ParcelAdmin', 'SuperAdmin'), getAllParcelsAdmin);
router.get('/:id', protect, getParcelById);
router.put('/:id/accept', protect, authorizeRoles('ParcelAdmin', 'SuperAdmin'), acceptParcel);
router.put('/:id/status', protect, updateParcelStatus);
router.delete('/:id', protect, authorizeRoles('ParcelAdmin', 'SuperAdmin'), deleteParcelAdmin);

export default router;
