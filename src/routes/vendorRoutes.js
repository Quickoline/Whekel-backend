import express from 'express';
import {
  getVendorDropdownOptions,
  createMasterService,
  getMasterServices,
  updateMasterService,
  deleteMasterService,
  updateVendorOfferedServices,
  getAvailableLocations,
  getAvailableServicesByLocation,
  getVendorAdminProfiles,
  createVendorBooking,
  getMyVendorRequests,
  acceptVendorRequest,
  updateVendorStatus,
  getAllVendorAdmin
} from '../controllers/vendorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dropdown options endpoints for Frontend App & Admin Portal
router.get('/dropdown-options', getVendorDropdownOptions);
router.get('/admin/dropdown-options', getVendorDropdownOptions);
router.get('/dropdown', getVendorDropdownOptions);

// 1. SuperAdmin Master Catalog Routes
router.get('/catalog', getMasterServices);
router.post('/catalog', protect, authorizeRoles('SuperAdmin'), createMasterService);
router.put('/catalog/:id', protect, authorizeRoles('SuperAdmin'), updateMasterService);
router.delete('/catalog/:id', protect, authorizeRoles('SuperAdmin'), deleteMasterService);

// 2. Vendor Admin Choice of Services & Location Setup
router.put('/admin/offered-services', protect, authorizeRoles('VendorAdmin', 'SuperAdmin'), updateVendorOfferedServices);

// 3. User Flow: Select Location -> Available Services -> Vendor Admin Profiles
router.get('/locations', getAvailableLocations);
router.get('/services-by-location', getAvailableServicesByLocation);
router.get('/providers-by-service', getVendorAdminProfiles);

// 4. Booking & Order Lifecycle
router.post('/book', protect, createVendorBooking);
router.get('/my-requests', protect, getMyVendorRequests);
router.put('/:id/accept', protect, authorizeRoles('VendorAdmin', 'SuperAdmin'), acceptVendorRequest);
router.put('/:id/status', protect, updateVendorStatus);
router.get('/admin/all', protect, authorizeRoles('VendorAdmin', 'SuperAdmin'), getAllVendorAdmin);

export default router;
