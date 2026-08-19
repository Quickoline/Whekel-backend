import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ['user', 'admin', 'driver'], required: true },
    messageType: {
      type: String,
      enum: ['text', 'image', 'location'],
      default: 'text'
    },
    text: { type: String, default: '' },
    attachment: {
      url: { type: String }
    },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
