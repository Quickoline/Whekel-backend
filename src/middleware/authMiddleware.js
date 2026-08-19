import jwt from 'jsonwebtoken';
import UserAuth from '../models/UserAuth.js';
import Admin from '../models/Admin.js';

// Protect routes - verifies JWT and attaches req.user
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whekel_super_secret_jwt_key_2026_secure');

      // Try finding in UserAuth first, then Admin
      let account = await UserAuth.findById(decoded.id).select('-password');
      if (account) {
        req.user = account;
        req.accountType = 'User';
      } else {
        account = await Admin.findById(decoded.id).select('-password');
        if (account) {
          req.user = account;
          req.accountType = 'Admin';
        }
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, account not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed verification', error: error.message });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Role-Based Access Control Middleware
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role || (req.accountType === 'User' ? 'user' : undefined);

    if (!allowedRoles.includes(userRole) && userRole !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' is not authorized to access this resource`
      });
    }

    next();
  };
};
