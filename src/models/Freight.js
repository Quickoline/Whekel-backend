import mongoose from 'mongoose';

const acceptedAdminSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  name: { type: String },
  phone: { type: String },
  profilePhoto: { type: String },
  profession: { type: String },
  assignedAt: { type: Date, default: Date.now }
});

const freightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    phone: { type: String, required: true },
    pickup: { type: String, required: true },
    pickupLocation: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String },
      pinCode: { type: String }
    },
    packageName: { type: String, required: true },
    packageWeight: { type: Number, required: true }, // heavy bulk weight in kg
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    recipientAddress: { type: String, required: true },
    acceptedAdmins: [acceptedAdminSchema],
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'cancelled', 'on_hold'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Freight = mongoose.model('Freight', freightSchema);
export default Freight;
