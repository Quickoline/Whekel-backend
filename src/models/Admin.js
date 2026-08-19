import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'RideAdmin', 'ParcelAdmin', 'FreightAdmin', 'VendorAdmin', 'LocalAdmin'],
      default: 'RideAdmin'
    },
    serviceLocation: {
      city: { type: String, trim: true, default: 'All' },
      district: { type: String, trim: true, default: 'All' },
      pinCode: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: 'All' },
      serviceRadiusKm: { type: Number, default: 100 }
    },
    assignedServices: [{ type: String }],
    vendorProfile: {
      shopName: { type: String, default: '' },
      isVendorActive: { type: Boolean, default: true },
      offeredServices: [{ type: String }],
      pricingEstimate: { type: String, default: 'Contact for Quote' },
      rating: { type: Number, default: 5.0 },
      completedJobs: { type: Number, default: 0 },
      bio: { type: String, default: 'Verified Professional Mobility Vendor' }
    },
    fcmToken: { type: String, default: '' },
    profilePhoto: { type: String, default: '' }
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
