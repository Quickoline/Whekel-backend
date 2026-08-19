import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    relatedOrderType: {
      type: String,
      enum: ['ride', 'parcel', 'freight', 'vendor'],
      required: true
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userModel: { type: String, enum: ['UserAuth', 'Admin'], required: true }
      }
    ]
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
