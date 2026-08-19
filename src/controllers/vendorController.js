import VendorService from '../models/VendorService.js';
import Admin from '../models/Admin.js';
import Vendor from '../models/Vendor.js';

// Helper: Build Flexible Location Search Filter across city, district, pinCode, state
const buildAdminLocationFilter = (query) => {
  const { city, district, pinCode, state, location, query: generalQuery } = query;

  let locCity = city;
  let locDistrict = district;
  let locPinCode = pinCode;
  let locState = state;
  let rawSearchTerm = generalQuery;

  if (location) {
    if (typeof location === 'object') {
      if (location.city) locCity = location.city;
      if (location.district) locDistrict = location.district;
      if (location.pinCode) locPinCode = location.pinCode;
      if (location.state) locState = location.state;
    } else if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        if (parsed.city) locCity = parsed.city;
        if (parsed.district) locDistrict = parsed.district;
        if (parsed.pinCode) locPinCode = parsed.pinCode;
        if (parsed.state) locState = parsed.state;
      } catch (e) {
        const cityM = String(location).match(/city[:=]\s*([^,}]+)/i);
        const distM = String(location).match(/district[:=]\s*([^,}]+)/i);
        const pinM = String(location).match(/pinCode[:=]\s*([^,}]+)/i);
        const stateM = String(location).match(/state[:=]\s*([^,}]+)/i);

        if (cityM) locCity = cityM[1].trim();
        if (distM) locDistrict = distM[1].trim();
        if (pinM) locPinCode = pinM[1].trim();
        if (stateM) locState = stateM[1].trim();

        if (!cityM && !distM && !pinM && !stateM && String(location).trim()) {
          rawSearchTerm = String(location).trim();
        }
      }
    }
  }

  const conditions = [];

  if (locCity) conditions.push({ 'serviceLocation.city': new RegExp(String(locCity).trim(), 'i') });
  if (locDistrict) conditions.push({ 'serviceLocation.district': new RegExp(String(locDistrict).trim(), 'i') });
  if (locPinCode) conditions.push({ 'serviceLocation.pinCode': new RegExp(String(locPinCode).trim(), 'i') });
  if (locState) conditions.push({ 'serviceLocation.state': new RegExp(String(locState).trim(), 'i') });

  if (rawSearchTerm) {
    const reg = new RegExp(String(rawSearchTerm).trim(), 'i');
    conditions.push(
      { 'serviceLocation.city': reg },
      { 'serviceLocation.district': reg },
      { 'serviceLocation.pinCode': reg },
      { 'serviceLocation.state': reg }
    );
  }

  if (conditions.length === 0) return {};

  return {
    $or: [...conditions, { 'serviceLocation.city': 'All' }]
  };
};

// ==========================================
// PUBLIC VENDOR ORDERS & ASSIGNED PHONE LOOKUP
// ==========================================

export const getPublicVendorOrders = async (req, res) => {
  try {
    const { profession, serviceName } = req.query;
    const targetProfession = profession || serviceName;

    const locationFilter = buildAdminLocationFilter(req.query);

    // Strictly query VendorAdmin accounts offering targetProfession matching any location criteria
    const matchingAdmins = await Admin.find({
      role: 'VendorAdmin',
      'vendorProfile.isVendorActive': true,
      ...(targetProfession ? {
        $or: [
          { 'vendorProfile.offeredServices': new RegExp(targetProfession, 'i') },
          { assignedServices: new RegExp(targetProfession, 'i') }
        ]
      } : {}),
      ...locationFilter
    }).select('-password');

    // Find existing vendor orders/requests
    const orderFilter = {};
    if (targetProfession) {
      orderFilter.$or = [
        { profession: new RegExp(targetProfession, 'i') },
        { serviceName: new RegExp(targetProfession, 'i') }
      ];
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
// DROPDOWN OPTIONS FOR FRONTEND APP & ADMIN
// ==========================================

export const getVendorDropdownOptions = async (req, res) => {
  try {
    const services = await VendorService.find({ isActive: true });

    const vendorAdmins = await Admin.find({
      role: 'VendorAdmin'
    }).select('serviceLocation');

    const locationsMap = new Map();
    vendorAdmins.forEach((v) => {
      if (v.serviceLocation?.city && v.serviceLocation.city !== 'All') {
        const key = `${v.serviceLocation.city}-${v.serviceLocation.district || ''}-${v.serviceLocation.pinCode || ''}-${v.serviceLocation.state || ''}`;
        locationsMap.set(key, {
          city: v.serviceLocation.city || '',
          district: v.serviceLocation.district || '',
          pinCode: v.serviceLocation.pinCode || '',
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

    res.status(201).json({ success: true, message: 'Master vendor service created by SuperAdmin', data: service });
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

    if (admin.role !== 'VendorAdmin') {
      return res.status(403).json({ success: false, message: 'Only VendorAdmin accounts can choose services to deliver' });
    }

    if (offeredServices) admin.vendorProfile.offeredServices = offeredServices;
    if (pricingEstimate) admin.vendorProfile.pricingEstimate = pricingEstimate;
    if (bio) admin.vendorProfile.bio = bio;
    if (isVendorActive !== undefined) admin.vendorProfile.isVendorActive = isVendorActive;

    if (serviceLocation) {
      admin.serviceLocation = {
        city: serviceLocation.city ? serviceLocation.city.trim() : admin.serviceLocation.city,
        district: serviceLocation.district ? serviceLocation.district.trim() : admin.serviceLocation.district,
        pinCode: serviceLocation.pinCode ? serviceLocation.pinCode.trim() : admin.serviceLocation.pinCode,
        state: serviceLocation.state ? serviceLocation.state.trim() : admin.serviceLocation.state,
        serviceRadiusKm: serviceLocation.serviceRadiusKm || admin.serviceLocation.serviceRadiusKm
      };
    }

    const updatedAdmin = await admin.save();

    res.json({
      success: true,
      message: 'VendorAdmin offered services & location settings updated successfully',
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
// 3. USER FLOW: SEARCH LOCATION -> SERVICES -> PROFILES
// ==========================================

export const getAvailableLocations = async (req, res) => {
  try {
    const vendorAdmins = await Admin.find({
      role: 'VendorAdmin',
      'vendorProfile.isVendorActive': true
    }).select('serviceLocation');

    const locationsMap = new Map();
    vendorAdmins.forEach((v) => {
      if (v.serviceLocation?.city && v.serviceLocation.city !== 'All') {
        const key = `${v.serviceLocation.city}-${v.serviceLocation.district || ''}-${v.serviceLocation.pinCode || ''}-${v.serviceLocation.state || ''}`;
        locationsMap.set(key, {
          city: v.serviceLocation.city || '',
          district: v.serviceLocation.district || '',
          pinCode: v.serviceLocation.pinCode || '',
          state: v.serviceLocation.state || ''
        });
      }
    });

    const locations = Array.from(locationsMap.values());

    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableServicesByLocation = async (req, res) => {
  try {
    const locationFilter = buildAdminLocationFilter(req.query);

    const vendorAdmins = await Admin.find({
      role: 'VendorAdmin',
      'vendorProfile.isVendorActive': true,
      ...locationFilter
    }).select('vendorProfile.offeredServices');

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
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorAdminProfiles = async (req, res) => {
  try {
    const { serviceName } = req.query;

    if (!serviceName) {
      return res.status(400).json({ success: false, message: 'serviceName parameter is required' });
    }

    const locationFilter = buildAdminLocationFilter(req.query);

    const vendorAdmins = await Admin.find({
      role: 'VendorAdmin',
      'vendorProfile.isVendorActive': true,
      'vendorProfile.offeredServices': new RegExp(serviceName, 'i'),
      ...locationFilter
    }).select('-password');

    res.json({
      success: true,
      serviceName,
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
      location: typeof location === 'string' ? location : (locationDetails?.city || 'Location'),
      locationDetails: locationDetails || { city: '', district: '', pinCode: '', state: '' },
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
    const { status } = req.query;
    const locationFilter = buildAdminLocationFilter(req.query);

    const filter = { ...locationFilter };
    if (status) filter.status = status;

    const requests = await Vendor.find(filter)
      .populate('userId', 'name phone email')
      .populate('assignedVendorId', 'name phone role vendorProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
