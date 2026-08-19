import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllUsersAdmin
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Auth Endpoints
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin Auth Endpoints
router.post('/admin/signup', registerAdmin);
router.post('/admin/login', loginAdmin);
router.get('/admin/profile', protect, getAdminProfile);
router.get('/admin/users', protect, authorizeRoles('SuperAdmin'), getAllUsersAdmin);

export default router;
