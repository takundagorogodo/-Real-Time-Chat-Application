import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      default: null
    },

    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text"
    },

    isEdited: {
      type: Boolean,
      default: false
    },

    version: {
      type: Number,
      default: 1
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deletedAt: {
      type: Date,
      default: null
    },

 
    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

 
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        emoji: String
      }
    ]
  },
  {
    timestamps: true
  }
);

messageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);