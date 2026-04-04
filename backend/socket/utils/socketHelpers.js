export const emitToRoomMembers = (io, roomId, event, data, excludeSocketId = null) => {
  if (excludeSocketId) {
    io.to(roomId).except(excludeSocketId).emit(event, data);
  } else {
    io.to(roomId).emit(event, data);
  }
};

export const getUserSockets = async (io, userId) => {
  const sockets = await io.in(userId.toString()).fetchSockets();
  return sockets;
};