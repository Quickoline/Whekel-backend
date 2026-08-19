import VendorService from '../models/VendorService.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';

// ==========================================
// PUBLIC VENDOR ORDERS & ASSIGNED PHONE LOOKUP
// ==========================================

export const getPublicVendorOrders = async (req, res) => {
  try {
    const { profession, serviceName, city, state, location } = req.query;

    const targetProfession = profession || serviceName;
    let targetCity = city;
    let targetState = state;

    if (location) {
      try {
        let parsed = typeof location === 'string' ? JSON.parse(location) : location;
        if (parsed.city) targetCity = parsed.city;
        if (parsed.state) targetState = parsed.state;
      } catch (e) {
        const cityMatch = String(location).match(/city[:=]\s*([^,}]+)/i);
        const stateMatch = String(location).match(/state[:=]\s*([^,}]+)/i);
        if (cityMatch) targetCity = cityMatch[1].trim();
        if (stateMatch) targetState = stateMatch[1].trim();
      }
    }

    // Find matching Vendor Admins operating in this location offering targetProfession
    const matchingAdmins = await Admin.find({
      role: { $in: ['VendorAdmin', 'SuperAdmin'] },
      'vendorProfile.isVendorActive': true,
      ...(targetProfession ? {
        $or: [
          { 'vendorProfile.offeredServices': new RegExp(targetProfession, 'i') },
          { assignedServices: new RegExp(targetProfession, 'i') }
        ]
      } : {}),
      ...(targetCity ? {
        $or: [
          { 'serviceLocation.city': new RegExp(targetCity, 'i') },
          { 'serviceLocation.city': 'All' }
        ]
      } : {})
    }).select('-password');

    // Find existing vendor orders/requests
    const orderFilter = {};
    if (targetProfession) {
      orderFilter.$or = [
        { profession: new RegExp(targetProfession, 'i') },
        { serviceName: new RegExp(targetProfession, 'i') }
      ];
    }
    if (targetCity) {
      orderFilter['locationDetails.city'] = new RegExp(targetCity, 'i');
    }

    const publicOrders = await Vendor.find(orderFilter)
      .populate('assignedVendorId', 'name phone profilePhoto vendorProfile serviceLocation')
      .sort({ createdAt: -1 });

    const primaryVendor = matchingAdmins.length > 0 ? matchingAdmins[0] : null;
    const assignedPhone = primaryVendor ? primaryVendor.phone : (publicOrders.length > 0 && publicOrders[0].assignedVendorId ? publicOrders[0].assignedVendorId.phone : '9876543244');

    res.json({
      success: true,
      assignedPhone,
      phone: assignedPhone,
      assignedVendor: primaryVendor ? {
        vendorAdminId: primaryVendor._id,
        name: primaryVendor.name,
        phone: primaryVendor.phone,
        email: primaryVendor.email,
        profilePhoto: primaryVendor.profilePhoto,
        serviceLocation: primaryVendor.serviceLocation,
        vendorProfile: primaryVendor.vendorProfile
      } : null,
      count: publicOrders.length,
      data: publicOrders.map((o) => ({
        id: o._id,
        _id: o._id,
        phone: o.assignedVendorId ? o.assignedVendorId.phone : assignedPhone,
        assignedPhone: o.assignedVendorId ? o.assignedVendorId.phone : assignedPhone,
        serviceName: o.serviceName || o.profession,
        profession: o.profession || o.serviceName,
        location: o.locationDetails,
        locationDetails: o.locationDetails,
        description: o.description,
        status: o.status,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// DROPDOWN OPTIONS FOR FRONTEND ADMIN & USER
// ==========================================

export const getVendorDropdownOptions = async (req, res) => {
  try {
    const services = await VendorService.find({ isActive: true });

    const vendorAdmins = await Admin.find({
      role: { $in: ['VendorAdmin', 'SuperAdmin'] }
    }).select('serviceLocation');

    const locationsMap = new Map();
    vendorAdmins.forEach((v) => {
      if (v.serviceLocation?.city && v.serviceLocation.city !== 'All') {
        locationsMap.set(v.serviceLocation.city, {
          city: v.serviceLocation.city,
          state: v.serviceLocation.state || ''
        });
      }
    });

    const locations = Array.from(locationsMap.values());
    const categories = Array.from(new Set(services.map((s) => s.category)));

    res.json({
      success: true,
      data: {
        services: services.map((s) => ({
          id: s._id,
          name: s.name,
          category: s.category,
          icon: s.icon,
          description: s.description
        })),
        locations,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    const serviceNamesSet = new Set();
    vendorAdmins.forEach((admin) => {
      admin.vendorProfile?.offeredServices?.forEach((service) => {
        serviceNamesSet.add(service);
      });
    });

    const offeredServiceNames = Array.from(serviceNamesSet);

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
