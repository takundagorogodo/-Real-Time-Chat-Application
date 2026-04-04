import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
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

// // Indexes
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ username: 1 }, { unique: true });

export default mongoose.model("User", userSchema);