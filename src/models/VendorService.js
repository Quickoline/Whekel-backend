import mongoose from 'mongoose';

const vendorServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, default: 'Breakdown & Mobility Support' },
    icon: { type: String, default: 'build' },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const VendorService = mongoose.model('VendorService', vendorServiceSchema);
export default VendorService;
