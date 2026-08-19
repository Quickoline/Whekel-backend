import Conversation from '../models/Chat.js';
import Message from '../models/Message.js';

// Get or Create Conversation for Vendor / Order Chat
export const getOrCreateConversation = async (req, res) => {
  try {
    const { conversationId: reqConvId, relatedOrderId, relatedOrderType, partnerId, vendorId, vendorAdminId } = req.body;

    const targetPartnerId = partnerId || vendorAdminId || vendorId || req.user._id;
    const targetOrderType = relatedOrderType || 'vendor';
    const targetOrderId = relatedOrderId || targetPartnerId;

    const conversationId = reqConvId || `conv_${targetOrderType}_${targetOrderId}`;

    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = await Conversation.create({
        conversationId,
        relatedOrderId: targetOrderId,
        relatedOrderType: targetOrderType,
        participants: [
          { userId: req.user._id, userModel: req.accountType === 'Admin' ? 'Admin' : 'UserAuth' },
          { userId: targetPartnerId, userModel: req.accountType === 'Admin' ? 'UserAuth' : 'Admin' }
        ]
      });
    }

    res.json({
      success: true,
      conversationId: conversation.conversationId,
      data: conversation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Chat Message
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
