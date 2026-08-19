import Fleet from '../models/Fleet.js';

// Admin / Driver: Register New Vehicle / Fleet
export const createVehicle = async (req, res) => {
  try {
    const { name, model, number, type, fuelType, acType, sleeperType, seatCapacity, routes } = req.body;

    const existingVehicle = await Fleet.findOne({ number });
    if (existingVehicle) {
      return res.status(400).json({ success: false, message: 'Vehicle number already registered' });
    }

    const vehicle = await Fleet.create({
      adminId: req.user._id,
      name,
      model,
      number,
      type,
      fuelType,
      acType,
      sleeperType: sleeperType || 'Non Sleeper',
      seatCapacity,
      routes: routes || []
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Fleets (Public / Passengers can view available vehicles & schedules)
export const getAllVehicles = async (req, res) => {
  try {
    const { type, fuelType, acType } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (fuelType) filter.fuelType = fuelType;
    if (acType) filter.acType = acType;

    const vehicles = await Fleet.find(filter).populate('adminId', 'name phone role');
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Fleet Vehicles (Driver / Partner / Admin)
export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Fleet.find({ adminId: req.user._id });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Vehicle Details
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Fleet.findById(req.params.id).populate('adminId', 'name phone email profilePhoto');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Vehicle Details / Bus Routes
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Fleet.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    Object.assign(vehicle, req.body);
    const updated = await vehicle.save();

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Fleet.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
