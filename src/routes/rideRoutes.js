import express from 'express';
import {
  createRide,
  getMyRides,
  getRideById,
  acceptRide,
  updateRideStatus,
  getAllRidesAdmin,
  deleteRideAdmin
} from '../controllers/rideController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRide);
router.get('/my-rides', protect, getMyRides);
router.get('/admin/all', protect, authorizeRoles('RideAdmin', 'LocalAdmin', 'SuperAdmin'), getAllRidesAdmin);
router.get('/:id', protect, getRideById);
router.put('/:id/accept', protect, authorizeRoles('RideAdmin', 'LocalAdmin', 'SuperAdmin'), acceptRide);
router.put('/:id/status', protect, updateRideStatus);
router.delete('/:id', protect, authorizeRoles('RideAdmin', 'SuperAdmin'), deleteRideAdmin);

export default router;
