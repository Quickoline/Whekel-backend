import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true },
    serviceType: {
      type: String,
      enum: ['Ride', 'Parcel', 'Freight', 'Vendor', 'All', 'Other'],
      required: true
    },
    location: { type: String, required: true },
    additionalInfo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
