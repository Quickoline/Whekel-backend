import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    phone: { type: String, required: true },
    serviceName: { type: String, required: true },
    profession: { type: String, default: 'Breakdown Specialist' },
    location: { type: String, required: true },
    locationDetails: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String }
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    assignedVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    isActive: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
