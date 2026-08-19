import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorService', default: null },
    serviceName: { type: String, required: true },
    profession: { type: String, default: 'Breakdown Specialist' },
    vendorsListIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    assignedVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    locationDetails: {
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      state: { type: String, trim: true }
    },
    description: { type: String, default: 'Breakdown & Repair Service Request' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
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
