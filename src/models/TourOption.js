import mongoose from 'mongoose';

const tourOptionSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    vehicleName: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'EV', 'CNG'], required: true },
    acType: { type: String, enum: ['AC', 'Non-AC'], required: true },
    seatCapacity: { type: String, required: true },
    basePrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const TourOption = mongoose.model('TourOption', tourOptionSchema);
export default TourOption;
