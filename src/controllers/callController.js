import Call from '../models/Call.js';

// Initiate Audio Call Session
export const initiateCall = async (req, res) => {
  try {
    const { receiverId, receiverType, callType, relatedOrderId, relatedOrderType } = req.body;

    const callerType = req.accountType || 'User';
    const roomId = `room_${relatedOrderType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const call = await Call.create({
      callerId: req.user._id,
      callerType,
      receiverId,
      receiverType,
      callType: callType || 'user-to-admin',
      status: 'initiated',
      roomId,
      relatedOrderId,
      relatedOrderType
    });

    res.status(201).json({
      success: true,
      message: 'Audio call initiated',
      data: call
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User / Driver Call Logs
export const getMyCallLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: calls.length, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Call Status / End Call
export const updateCallStatus = async (req, res) => {
  try {
    const { status, duration } = req.body;
    const call = await Call.findById(req.params.id);

    if (!call) {
      return res.status(404).json({ success: false, message: 'Call log not found' });
    }

    if (status) call.status = status;
    if (duration !== undefined) call.duration = duration;

    const updatedCall = await call.save();
    res.json({ success: true, data: updatedCall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Call Log by Room ID
export const getCallByRoomId = async (req, res) => {
  try {
    const call = await Call.findOne({ roomId: req.params.roomId });
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }
    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
