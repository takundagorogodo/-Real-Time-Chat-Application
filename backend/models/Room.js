import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null
    },
    isGroup: {
      type: Boolean,
      required: true
    },
    privateKey: {
      type: String,
      unique: true,
      sparse: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Index for fast lookup of user rooms
//roomSchema.index({ members: 1 });
//roomSchema.index({ privateKey: 1 });

export default mongoose.model("Room", roomSchema);