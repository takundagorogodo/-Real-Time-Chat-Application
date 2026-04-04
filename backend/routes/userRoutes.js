import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Room from "../models/Room.js";

const router = express.Router();

// Get all users except current user
router.get("/users", protect, async (req, res) => {
  try {
    console.log("Fetching users, current user:", req.user.userId);
    const users = await User.find({ 
      _id: { $ne: req.user.userId } 
    }).select("-password");
    console.log("Users found:", users.length);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get or create private room with another user
router.get("/rooms/private/:userId", protect, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;

    console.log("Creating/fetching room between:", currentUserId, "and", otherUserId);

    // Create a unique key for the private room
    const privateKey = [currentUserId, otherUserId].sort().join("_");

    // Try to find existing room
    let room = await Room.findOne({ privateKey });

    // If no room exists, create one
    if (!room) {
      console.log("Creating new room with key:", privateKey);
      room = await Room.create({
        isGroup: false,
        privateKey,
        members: [currentUserId, otherUserId],
        createdBy: currentUserId,
      });
      console.log("Room created:", room._id);
    } else {
      console.log("Existing room found:", room._id);
    }

    res.json(room);
  } catch (err) {
    console.error("Error creating/fetching room:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;