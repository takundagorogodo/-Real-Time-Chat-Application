import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import { handleMessageEvents } from "./handlers/messageHandler.js";
import { handleRoomEvents } from "./handlers/roomHandler.js";
import { handleUserEvents } from "./handlers/userHandler.js";
import User from "../models/User.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173" }
  });

  // Authentication middleware
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log("User connected:", socket.user.username);

    // Join user's personal room
    socket.join(userId);
    
    // Update user status to online
    await User.findByIdAndUpdate(userId, { status: "online" });
    io.emit("user_online", userId);

   
    handleMessageEvents(io, socket);
    handleRoomEvents(io, socket);
    handleUserEvents(io, socket);
  });

  return io;
};