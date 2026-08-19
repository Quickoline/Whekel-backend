import express from 'express';
import { getGeneralInfo, updateGeneralInfo } from '../controllers/generalController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGeneralInfo);
router.put('/', protect, authorizeRoles('SuperAdmin'), updateGeneralInfo);

export default router;
