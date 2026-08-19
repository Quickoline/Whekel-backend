import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    callerType: { type: String, enum: ['User', 'Admin'], required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverType: { type: String, enum: ['User', 'Admin'], required: true },
    callType: { type: String, enum: ['user-to-admin', 'admin-to-user'], required: true },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'accepted', 'rejected', 'ended', 'missed', 'cancelled'],
      default: 'initiated'
    },
    roomId: { type: String, required: true },
    duration: { type: Number, default: 0 }, // in seconds
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    relatedOrderType: {
      type: String,
      enum: ['ride', 'parcel', 'freight', 'vendor'],
      required: true
    }
  },
  { timestamps: true }
);

const Call = mongoose.model('Call', callSchema);
export default Call;
