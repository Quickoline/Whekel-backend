import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    currentLocation: { type: String, required: true },
    destination: { type: String, required: true },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleName: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    fuelType: { type: String, required: true },
    acType: { type: String, required: true },
    seatCapacity: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'called', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    assignedLocalAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    adminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
