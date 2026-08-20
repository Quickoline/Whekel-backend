import mongoose from 'mongoose';

const miniTransportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    currentLocation: { type: String, required: true },
    destination: { type: String, required: true },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
    goodsType: { type: String, default: 'General Freight / Items' },
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

const MiniTransport = mongoose.model('MiniTransport', miniTransportSchema);
export default MiniTransport;
