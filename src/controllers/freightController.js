import Freight from '../models/Freight.js';

// User: Create Freight Order
export const createFreight = async (req, res) => {
  try {
    const { phone, pickup, pickupLocation, packageName, packageWeight, recipientName, recipientPhone, recipientAddress } = req.body;

    const freight = await Freight.create({
      userId: req.user._id,
      phone: phone || req.user.phone,
      pickup,
      pickupLocation,
      packageName,
      packageWeight,
      recipientName,
      recipientPhone,
      recipientAddress,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: freight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User / Driver: Get My Freight Shipments
export const getMyFreight = async (req, res) => {
  try {
    const freightList = await Freight.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: freightList.length, data: freightList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Freight Details
export const getFreightById = async (req, res) => {
  try {
    const freight = await Freight.findById(req.params.id).populate('userId', 'name phone email');
    if (!freight) {
      return res.status(404).json({ success: false, message: 'Freight order not found' });
    }
    res.json({ success: true, data: freight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin / Freight Partner: Accept Freight Order
export const acceptFreight = async (req, res) => {
  try {
    const freight = await Freight.findById(req.params.id);
    if (!freight) {
      return res.status(404).json({ success: false, message: 'Freight order not found' });
    }

    const adminInfo = {
      adminId: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      profilePhoto: req.user.profilePhoto || '',
      profession: 'Freight Logistics Partner'
    };

    freight.acceptedAdmins.push(adminInfo);
    if (freight.status === 'pending') {
      freight.status = 'in_transit';
    }

    const updatedFreight = await freight.save();
    res.json({ success: true, message: 'Freight order accepted', data: updatedFreight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Freight Status
export const updateFreightStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const freight = await Freight.findById(req.params.id);

    if (!freight) {
      return res.status(404).json({ success: false, message: 'Freight order not found' });
    }

    if (status) freight.status = status;
    const updatedFreight = await freight.save();

    res.json({ success: true, data: updatedFreight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Freight Shipments (FreightAdmin / SuperAdmin)
export const getAllFreightAdmin = async (req, res) => {
  try {
    const { status, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter['pickupLocation.city'] = city;

    const freightList = await Freight.find(filter)
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: freightList.length, data: freightList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Freight Order
export const deleteFreightAdmin = async (req, res) => {
  try {
    const freight = await Freight.findByIdAndDelete(req.params.id);
    if (!freight) {
      return res.status(404).json({ success: false, message: 'Freight order not found' });
    }
    res.json({ success: true, message: 'Freight order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
