import TourOption from '../models/TourOption.js';
import Tour from '../models/Tour.js';
import MiniTransport from '../models/MiniTransport.js';

// ==========================================
// 1. LOCALADMIN: TOUR DROPDOWN OPTIONS MANAGEMENT
// ==========================================

export const createTourOption = async (req, res) => {
  try {
    const { vehicleName, vehicleModel, fuelType, acType, seatCapacity, basePrice } = req.body;

    if (!vehicleName || !vehicleModel || !fuelType || !acType || !seatCapacity) {
      return res.status(400).json({
        success: false,
        message: 'vehicleName, vehicleModel, fuelType, acType, and seatCapacity are required'
      });
    }

    const option = await TourOption.create({
      createdBy: req.user._id,
      vehicleName,
      vehicleModel,
      fuelType,
      acType,
      seatCapacity,
      basePrice: basePrice || 0
    });

    res.status(201).json({
      success: true,
      message: 'Tour vehicle option created by LocalAdmin',
      data: option
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTourOptions = async (req, res) => {
  try {
    const options = await TourOption.find({ isActive: true }).sort({ createdAt: -1 });

    const vehicleNames = Array.from(new Set(options.map((o) => o.vehicleName)));
    const vehicleModels = Array.from(new Set(options.map((o) => o.vehicleModel)));
    const fuelTypes = Array.from(new Set(options.map((o) => o.fuelType)));
    const acTypes = Array.from(new Set(options.map((o) => o.acType)));
    const seatCapacities = Array.from(new Set(options.map((o) => o.seatCapacity)));

    res.json({
      success: true,
      count: options.length,
      data: {
        options,
        dropdowns: {
          vehicleNames,
          vehicleModels,
          fuelTypes,
          acTypes,
          seatCapacities
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTourOption = async (req, res) => {
  try {
    const option = await TourOption.findByIdAndDelete(req.params.id);
    if (!option) {
      return res.status(404).json({ success: false, message: 'Tour option not found' });
    }
    res.json({ success: true, message: 'Tour vehicle option removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. USER: TOUR BOOKING & USER HISTORY
// ==========================================

export const createTourBooking = async (req, res) => {
  try {
    const {
      currentLocation,
      destination,
      pinCode,
      phone,
      vehicleName,
      vehicleModel,
      fuelType,
      acType,
      seatCapacity
    } = req.body;

    if (!currentLocation || !destination || !pinCode || !phone || !vehicleName || !vehicleModel || !fuelType || !acType || !seatCapacity) {
      return res.status(400).json({
        success: false,
        message: 'currentLocation, destination, pinCode, phone, vehicleName, vehicleModel, fuelType, acType, seatCapacity are required'
      });
    }

    const booking = await Tour.create({
      userId: req.user._id,
      currentLocation,
      destination,
      pinCode,
      phone,
      vehicleName,
      vehicleModel,
      fuelType,
      acType,
      seatCapacity,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Tour booking request submitted successfully. LocalAdmin will call you directly.',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTourBookings = async (req, res) => {
  try {
    const bookings = await Tour.find({ userId: req.user._id })
      .populate('assignedLocalAdminId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTourBookings = async (req, res) => {
  try {
    const { status, pinCode } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (pinCode) filter.pinCode = pinCode;

    const bookings = await Tour.find(filter)
      .populate('userId', 'name phone email profilePhoto')
      .populate('assignedLocalAdminId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTourStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const booking = await Tour.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Tour booking not found' });
    }

    if (status) booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    booking.assignedLocalAdminId = req.user._id;

    const updated = await booking.save();

    res.json({
      success: true,
      message: 'Tour booking status updated by LocalAdmin',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. USER: MINI TRANSPORT BOOKING & USER HISTORY
// ==========================================

export const createMiniTransportBooking = async (req, res) => {
  try {
    const { currentLocation, destination, pinCode, phone, goodsType } = req.body;

    if (!currentLocation || !destination || !pinCode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'currentLocation, destination, pinCode, phone are required'
      });
    }

    const booking = await MiniTransport.create({
      userId: req.user._id,
      currentLocation,
      destination,
      pinCode,
      phone,
      goodsType: goodsType || 'General Freight / Items',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Mini Transport booking request submitted successfully. LocalAdmin will call you directly.',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyMiniTransportBookings = async (req, res) => {
  try {
    const bookings = await MiniTransport.find({ userId: req.user._id })
      .populate('assignedLocalAdminId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMiniTransportBookings = async (req, res) => {
  try {
    const { status, pinCode } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (pinCode) filter.pinCode = pinCode;

    const bookings = await MiniTransport.find(filter)
      .populate('userId', 'name phone email profilePhoto')
      .populate('assignedLocalAdminId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMiniTransportStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const booking = await MiniTransport.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Mini Transport booking not found' });
    }

    if (status) booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    booking.assignedLocalAdminId = req.user._id;

    const updated = await booking.save();

    res.json({
      success: true,
      message: 'Mini Transport booking status updated by LocalAdmin',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
