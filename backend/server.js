import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";

import connectDb from "./config/db.js";
import { initializeSocket } from "./socket/index.js";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDb();

const app = express();
const server = http.createServer(app); // Create once here

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", userRoutes);

// Initialize Socket.IO with the server
initializeSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});