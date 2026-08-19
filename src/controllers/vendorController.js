import VendorService from '../models/VendorService.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';

// ==========================================
// 1. SUPERADMIN MASTER CATALOG CONTROLLERS
// ==========================================

export const createMasterService = async (req, res) => {
  try {
    const { name, category, icon, description } = req.body;

    const existing = await VendorService.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vendor service already exists in master catalog' });
    }

    const service = await VendorService.create({
      name,
      category: category || 'Breakdown & Mobility Support',
      icon: icon || 'build',
      description
    });

    res.status(201).json({ success: true, message: 'Master vendor service created', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMasterServices = async (req, res) => {
  try {
    const services = await VendorService.find({ isActive: true });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMasterService = async (req, res) => {
  try {
    const service = await VendorService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMasterService = async (req, res) => {
  try {
    const service = await VendorService.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Master service removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. VENDOR ADMIN PROFILE & SERVICE SELECTION
// ==========================================

export const updateVendorOfferedServices = async (req, res) => {
  try {
    const { offeredServices, serviceLocation, pricingEstimate, bio, isVendorActive } = req.body;

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (offeredServices) admin.vendorProfile.offeredServices = offeredServices;
    if (pricingEstimate) admin.vendorProfile.pricingEstimate = pricingEstimate;
    if (bio) admin.vendorProfile.bio = bio;
    if (isVendorActive !== undefined) admin.vendorProfile.isVendorActive = isVendorActive;

    if (serviceLocation) {
      admin.serviceLocation = {
        ...admin.serviceLocation,
        ...serviceLocation
      };
    }

    const updatedAdmin = await admin.save();

    res.json({
      success: true,
      message: 'Vendor services & location settings updated successfully',
      data: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        role: updatedAdmin.role,
        serviceLocation: updatedAdmin.serviceLocation,
        vendorProfile: updatedAdmin.vendorProfile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. USER FLOW: LOCATION -> SERVICES -> VENDOR PROFILES
// ==========================================

// Step 1: Get list of active cities/locations where Vendor Admins are operating
export const getAvailableLocations = async (req, res) => {
  try {
    const vendorAdmins = await Admin.find({
      role: { $in: ['VendorAdmin', 'SuperAdmin'] },
      'vendorProfile.isVendorActive': true
    }).select('serviceLocation');

    const locations = Array.from(
      new Set(
        vendorAdmins
          .map((v) => v.serviceLocation?.city)
          .filter((city) => city && city !== 'All')
      )
    );

    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 2: Select Location -> Fetch available services offered by Vendor Admins in that location
export const getAvailableServicesByLocation = async (req, res) => {
  try {
    const { city, state } = req.query;

    const filter = {
      role: { $in: ['VendorAdmin', 'SuperAdmin'] },
      'vendorProfile.isVendorActive': true
    };

    if (city) {
      filter.$or = [
        { 'serviceLocation.city': new RegExp(city, 'i') },
        { 'serviceLocation.city': 'All' }
      ];
    }

    const vendorAdmins = await Admin.find(filter).select('vendorProfile.offeredServices');

    // Aggregate all unique offered services in this location
    const serviceNamesSet = new Set();
    vendorAdmins.forEach((admin) => {
      admin.vendorProfile?.offeredServices?.forEach((service) => {
        serviceNamesSet.add(service);
      });
    });

    const offeredServiceNames = Array.from(serviceNamesSet);

    // Fetch master service details for these available service names
    const services = await VendorService.find({
      name: { $in: offeredServiceNames },
      isActive: true
    });

    res.json({
      success: true,
      city: city || 'All',
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 3: Select Service -> Fetch profiles list of Vendor Admins in location offering that service
export const getVendorAdminProfiles = async (req, res) => {
  try {
    const { city, serviceName } = req.query;

    if (!serviceName) {
      return res.status(400).json({ success: false, message: 'serviceName parameter is required' });
    }

    const filter = {
      role: { $in: ['VendorAdmin', 'SuperAdmin'] },
      'vendorProfile.isVendorActive': true,
      'vendorProfile.offeredServices': serviceName
    };

    if (city) {
      filter.$or = [
        { 'serviceLocation.city': new RegExp(city, 'i') },
        { 'serviceLocation.city': 'All' }
      ];
    }

    const vendorAdmins = await Admin.find(filter).select('-password');

    res.json({
      success: true,
      serviceName,
      city: city || 'All',
      count: vendorAdmins.length,
      data: vendorAdmins.map((v) => ({
        vendorAdminId: v._id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        profilePhoto: v.profilePhoto,
        role: v.role,
        serviceLocation: v.serviceLocation,
        vendorProfile: v.vendorProfile
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Step 4: Book Vendor Service with Selected Vendor Admin
export const createVendorBooking = async (req, res) => {
  try {
    const { serviceName, vendorAdminId, phone, location, locationDetails, description } = req.body;

    const vendorReq = await Vendor.create({
      userId: req.user._id,
      phone: phone || req.user.phone,
      serviceName,
      profession: serviceName,
      location,
      locationDetails,
      description,
      assignedVendorId: vendorAdminId || null,
      status: 'pending',
      isActive: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Vendor breakdown service request submitted',
      data: vendorReq
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Vendor Bookings
export const getMyVendorRequests = async (req, res) => {
  try {
    const requests = await Vendor.find({ userId: req.user._id })
      .populate('assignedVendorId', 'name phone profilePhoto vendorProfile serviceLocation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor Admin / Provider: Accept Booking Request
export const acceptVendorRequest = async (req, res) => {
  try {
    const vendorReq = await Vendor.findById(req.params.id);
    if (!vendorReq) {
      return res.status(404).json({ success: false, message: 'Vendor request not found' });
    }

    vendorReq.assignedVendorId = req.user._id;
    vendorReq.status = 'accepted';

    const updated = await vendorReq.save();
    res.json({ success: true, message: 'Vendor accepted booking request', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Booking Status
export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendorReq = await Vendor.findById(req.params.id);

    if (!vendorReq) {
      return res.status(404).json({ success: false, message: 'Vendor request not found' });
    }

    if (status) vendorReq.status = status;
    const updated = await vendorReq.save();

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Vendor Requests
export const getAllVendorAdmin = async (req, res) => {
  try {
    const { status, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter['locationDetails.city'] = city;

    const requests = await Vendor.find(filter)
      .populate('userId', 'name phone email')
      .populate('assignedVendorId', 'name phone role vendorProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
