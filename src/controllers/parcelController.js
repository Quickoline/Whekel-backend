import Parcel from '../models/Parcel.js';

// User: Create Parcel Order
export const createParcel = async (req, res) => {
  try {
    const { phone, pickup, pickupLocation, packageName, packageWeight, recipientName, recipientPhone, recipientAddress } = req.body;

    const parcel = await Parcel.create({
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

    res.status(201).json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User / Driver: Get My Parcels
export const getMyParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: parcels.length, data: parcels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Parcel Details
export const getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id).populate('userId', 'name phone email');
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    res.json({ success: true, data: parcel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin / Courier Partner: Accept Parcel Dispatch
export const acceptParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    const adminInfo = {
      adminId: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      profilePhoto: req.user.profilePhoto || '',
      profession: 'Courier Partner'
    };

    parcel.acceptedAdmins.push(adminInfo);
    if (parcel.status === 'pending') {
      parcel.status = 'in_transit';
    }

    const updatedParcel = await parcel.save();
    res.json({ success: true, message: 'Parcel accepted for delivery', data: updatedParcel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Parcel Status
export const updateParcelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    if (status) parcel.status = status;
    const updatedParcel = await parcel.save();

    res.json({ success: true, data: updatedParcel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Parcels (ParcelAdmin / SuperAdmin)
export const getAllParcelsAdmin = async (req, res) => {
  try {
    const { status, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter['pickupLocation.city'] = city;

    const parcels = await Parcel.find(filter)
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: parcels.length, data: parcels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Parcel
export const deleteParcelAdmin = async (req, res) => {
  try {
    const parcel = await Parcel.findByIdAndDelete(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    res.json({ success: true, message: 'Parcel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
