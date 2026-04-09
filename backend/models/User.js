import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,  
      match: /^[A-Z0-9]+$/i  
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /@adityauniversity\.in$/  
    },
    password: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      enum: ["CSE", "ECE", "ME", "CE", "IT", "EEE"],
      required: true
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },
    lastSeen: {
      type: Date
    }
  },
  { timestamps: true }
);


userSchema.index({ rollNumber: 1, branch: 1 });

export default mongoose.model("User", userSchema);