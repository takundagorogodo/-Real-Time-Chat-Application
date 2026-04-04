import User from "../../models/User.js";

export const handleUserEvents = (io, socket) => {
  const userId = socket.user._id.toString();


  socket.on("typing_start", (roomId) => {
    socket.to(roomId).emit("user_typing", {
      userId,
      username: socket.user.username
    });
  });

  socket.on("typing_stop", (roomId) => {
    socket.to(roomId).emit("user_stop_typing", { userId });
  });


  socket.on("disconnect", async () => {
    try {
      const sockets = await io.in(userId).fetchSockets();
      if (sockets.length === 0) {
        await User.findByIdAndUpdate(userId, {
          status: "offline",
          lastSeen: new Date(),
        });
        io.emit("user_offline", userId);
      }
      console.log("User disconnected:", socket.user.username);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  });
};