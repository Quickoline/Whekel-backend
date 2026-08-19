export const initializeSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // CHAT EVENTS
    socket.on('join_chat', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`[Socket.io] User ${socket.id} joined chat room: ${conversationId}`);
    });

    socket.on('send_message', (data) => {
      // Data format: { conversationId, senderId, senderRole, text, attachment, createdAt }
      io.to(data.conversationId).emit('receive_message', data);
    });

    socket.on('typing', ({ conversationId, userId, isTyping }) => {
      socket.to(conversationId).emit('user_typing', { userId, isTyping });
    });

    // WEBRTC AUDIO CALL EVENTS
    socket.on('join_call_room', ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`[Socket.io] User ${userId} (${socket.id}) joined call room: ${roomId}`);
      socket.to(roomId).emit('peer_joined', { userId, socketId: socket.id });
    });

    socket.on('call_offer', ({ roomId, offer, callerId }) => {
      socket.to(roomId).emit('incoming_call_offer', { offer, callerId });
    });

    socket.on('call_answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('call_accepted_answer', { answer });
    });

    socket.on('ice_candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('received_ice_candidate', { candidate });
    });

    socket.on('end_call', ({ roomId }) => {
      io.to(roomId).emit('call_ended');
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};
