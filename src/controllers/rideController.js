import Ride from '../models/Ride.js';

// User: Create Ride Request
export const createRide = async (req, res) => {
  try {
    const { vehicleType, vehicleName, pickup, drop, stops, fare, busSchedule } = req.body;

    const ride = await Ride.create({
      userId: req.user._id,
      vehicleType,
      vehicleName: vehicleName || 'Standard Vehicle',
      pickup,
      drop,
      stops: stops || [],
      fare: fare || 100,
      status: 'pending',
      busSchedule: busSchedule || null
    });

    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User / Driver: Get My Rides
export const getMyRides = async (req, res) => {
  try {
    const filter = req.accountType === 'User' ? { userId: req.user._id } : { adminId: req.user._id };
    const rides = await Ride.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public / User / Admin: Get Ride by ID
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('userId', 'name phone email profilePhoto')
      .populate('adminId', 'name phone profilePhoto role');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin / Driver: Accept Ride (LocalAdmin or RideAdmin)
export const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Ride is already ${ride.status}` });
    }

    ride.adminId = req.user._id;
    ride.status = 'accepted';
    const updatedRide = await ride.save();

    res.json({ success: true, message: 'Ride accepted successfully', data: updatedRide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User / Admin: Update Ride Status (in-progress, completed, cancelled)
export const updateRideStatus = async (req, res) => {
  try {
    const { status, fare } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (status) ride.status = status;
    if (fare !== undefined) ride.fare = fare;

    const updatedRide = await ride.save();
    res.json({ success: true, data: updatedRide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Rides (RideAdmin / LocalAdmin / SuperAdmin)
export const getAllRidesAdmin = async (req, res) => {
  try {
    const { vehicleType, status } = req.query;
    const filter = {};
    if (vehicleType) filter.vehicleType = vehicleType;
    if (status) filter.status = status;

    const rides = await Ride.find(filter)
      .populate('userId', 'name phone email')
      .populate('adminId', 'name phone role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Ride
export const deleteRideAdmin = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    res.json({ success: true, message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
