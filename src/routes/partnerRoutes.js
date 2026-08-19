import express from 'express';
import {
  applyPartner,
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
  deletePartner
} from '../controllers/partnerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply', applyPartner);
router.get('/admin/all', protect, authorizeRoles('SuperAdmin'), getAllPartners);
router.get('/admin/:id', protect, authorizeRoles('SuperAdmin'), getPartnerById);
router.put('/admin/:id/status', protect, authorizeRoles('SuperAdmin'), updatePartnerStatus);
router.delete('/admin/:id', protect, authorizeRoles('SuperAdmin'), deletePartner);

export default router;
