import express from 'express';
import {
  createVehicle,
  getAllVehicles,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/fleetController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.post('/', protect, createVehicle);
router.get('/my-fleet', protect, getMyVehicles);
router.get('/:id', getVehicleById);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

export default router;
