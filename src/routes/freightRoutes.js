import express from 'express';
import {
  createFreight,
  getMyFreight,
  getFreightById,
  acceptFreight,
  updateFreightStatus,
  getAllFreightAdmin,
  deleteFreightAdmin
} from '../controllers/freightController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createFreight);
router.get('/my-freight', protect, getMyFreight);
router.get('/admin/all', protect, authorizeRoles('FreightAdmin', 'SuperAdmin'), getAllFreightAdmin);
router.get('/:id', protect, getFreightById);
router.put('/:id/accept', protect, authorizeRoles('FreightAdmin', 'SuperAdmin'), acceptFreight);
router.put('/:id/status', protect, updateFreightStatus);
router.delete('/:id', protect, authorizeRoles('FreightAdmin', 'SuperAdmin'), deleteFreightAdmin);

export default router;
