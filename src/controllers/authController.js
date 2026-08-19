import jwt from 'jsonwebtoken';
import UserAuth from '../models/UserAuth.js';
import Admin from '../models/Admin.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'whekel_super_secret_jwt_key_2026_secure', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// USER AUTHENTICATION
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, fcmToken, profilePhoto, role } = req.body;

    const userExists = await UserAuth.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await UserAuth.create({
      name,
      email,
      phone,
      password,
      fcmToken: fcmToken || '',
      profilePhoto: profilePhoto || '',
      role: role || 'user'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        fcmToken: user.fcmToken,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserAuth.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({
        success: true,
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          fcmToken: user.fcmToken,
          profilePhoto: user.profilePhoto,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.fcmToken = req.body.fcmToken || user.fcmToken;
    user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        fcmToken: updatedUser.fcmToken,
        profilePhoto: updatedUser.profilePhoto,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN AUTHENTICATION
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, role, fcmToken, profilePhoto } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists with this email' });
    }

    const admin = await Admin.create({
      name,
      email,
      phone,
      password,
      role: role || 'RideAdmin',
      fcmToken: fcmToken || '',
      profilePhoto: profilePhoto || ''
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        fcmToken: admin.fcmToken,
        profilePhoto: admin.profilePhoto
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin._id);
      res.json({
        success: true,
        token,
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          fcmToken: admin.fcmToken,
          profilePhoto: admin.profilePhoto
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await UserAuth.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
