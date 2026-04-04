export const handleRoomEvents = (io, socket) => {
  // Join room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.username} joined room ${roomId}`);
  });

  // Leave room (optional)
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.user.username} left room ${roomId}`);
  });
};