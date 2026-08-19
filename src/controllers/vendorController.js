import Vendor from '../models/Vendor.js';

// User: Create Vendor Support Service Request
export const createVendorRequest = async (req, res) => {
  try {
    const { phone, profession, location, locationDetails, description } = req.body;

    const vendorReq = await Vendor.create({
      userId: req.user._id,
      phone: phone || req.user.phone,
      profession,
      location,
      locationDetails,
      description,
      status: 'pending',
      isActive: 'active'
    });

    res.status(201).json({ success: true, data: vendorReq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User: Get My Vendor Requests
export const getMyVendorRequests = async (req, res) => {
  try {
    const requests = await Vendor.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Vendor Request Details
export const getVendorRequestById = async (req, res) => {
  try {
    const request = await Vendor.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('assignedVendorId', 'name phone profession profilePhoto');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Vendor request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vendor Admin / Provider: Accept Vendor Service Request
export const acceptVendorRequest = async (req, res) => {
  try {
    const vendorReq = await Vendor.findById(req.params.id);
    if (!vendorReq) {
      return res.status(404).json({ success: false, message: 'Vendor request not found' });
    }

    vendorReq.assignedVendorId = req.user._id;
    vendorReq.status = 'accepted';

    const updated = await vendorReq.save();
    res.json({ success: true, message: 'Vendor assigned successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Vendor Request Status
export const updateVendorStatus = async (req, res) => {
  try {
    const { status, isActive } = req.body;
    const vendorReq = await Vendor.findById(req.params.id);

    if (!vendorReq) {
      return res.status(404).json({ success: false, message: 'Vendor request not found' });
    }

    if (status) vendorReq.status = status;
    if (isActive) vendorReq.isActive = isActive;

    const updated = await vendorReq.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Vendor Requests (VendorAdmin / SuperAdmin)
export const getAllVendorAdmin = async (req, res) => {
  try {
    const { profession, status, city } = req.query;
    const filter = {};
    if (profession) filter.profession = new RegExp(profession, 'i');
    if (status) filter.status = status;
    if (city) filter['locationDetails.city'] = city;

    const requests = await Vendor.find(filter)
      .populate('userId', 'name phone email')
      .populate('assignedVendorId', 'name phone role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Vendor Request
export const deleteVendorAdmin = async (req, res) => {
  try {
    const request = await Vendor.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Vendor request not found' });
    }
    res.json({ success: true, message: 'Vendor request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
