import express from 'express';
import {
  createTourOption,
  getTourOptions,
  deleteTourOption,
  createTourBooking,
  getTourBookings,
  updateTourStatus,
  createMiniTransportBooking,
  getMiniTransportBookings,
  updateMiniTransportStatus
} from '../controllers/localAdminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Tour Dropdown Options Management (LocalAdmin & SuperAdmin)
router.get('/tour-options', getTourOptions);
router.post('/tour-options', protect, authorizeRoles('LocalAdmin', 'SuperAdmin'), createTourOption);
router.delete('/tour-options/:id', protect, authorizeRoles('LocalAdmin', 'SuperAdmin'), deleteTourOption);

// 2. User Tour Booking (Form submission with dropdowns, LocalAdmin calls user)
router.post('/tours/book', protect, createTourBooking);
router.get('/tours', protect, authorizeRoles('LocalAdmin', 'SuperAdmin'), getTourBookings);
router.put('/tours/:id/status', protect, authorizeRoles('LocalAdmin', 'SuperAdmin'), updateTourStatus);

// 3. User Mini Transport Booking (Form submission without dropdowns, LocalAdmin calls user)
router.post('/mini-transport/book', protect, createMiniTransportBooking);
router.get('/mini-transport', protect, authorizeRoles('LocalAdmin', 'SuperAdmin'), getMiniTransportBookings);
router.put('/mini-transport/:id/status', protect, authorizeRoles('LocalAdmin', 'SuperAdmin'), updateMiniTransportStatus);

export default router;
