import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true
    },
    deviceInfo: {
      type: String,
      default: "unknown"
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isValid: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 });

export default mongoose.model("Session", sessionSchema);