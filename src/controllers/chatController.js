import Conversation from '../models/Chat.js';
import Message from '../models/Message.js';

// Get or Create Conversation for an Order
export const getOrCreateConversation = async (req, res) => {
  try {
    const { relatedOrderId, relatedOrderType, partnerId } = req.body;

    const conversationId = `conv_${relatedOrderType}_${relatedOrderId}`;

    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = await Conversation.create({
        conversationId,
        relatedOrderId,
        relatedOrderType,
        participants: [
          { userId: req.user._id, userModel: req.accountType === 'Admin' ? 'Admin' : 'UserAuth' },
          { userId: partnerId, userModel: req.accountType === 'Admin' ? 'UserAuth' : 'Admin' }
        ]
      });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, messageType, text, attachment } = req.body;

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      senderRole: req.user.role || (req.accountType === 'Admin' ? 'admin' : 'user'),
      messageType: messageType || 'text',
      text: text || '',
      attachment: attachment || null
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Messages for Conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Messages as Read
export const markMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user._id } },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
