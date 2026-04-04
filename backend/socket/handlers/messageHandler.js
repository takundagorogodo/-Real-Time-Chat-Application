import Message from "../../models/Message.js";
import Room from "../../models/Room.js";

export const handleMessageEvents = (io, socket) => {
  const userId = socket.user._id.toString();

  // Send private message
  socket.on("private_message", async ({ receiverId, content, messageType = "text" }) => {
    try {
      if (!receiverId || !content) return;

      const privateKey = [userId, receiverId].sort().join("_");
      let room = await Room.findOne({ privateKey });

      if (!room) {
        room = await Room.create({
          isGroup: false,
          privateKey,
          members: [userId, receiverId],
          createdBy: userId,
        });
      }

      const message = await Message.create({
        roomId: room._id,
        senderId: userId,
        content,
        messageType,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'username')
        .lean();

      const messageToSend = {
        _id: populatedMessage._id.toString(),
        roomId: populatedMessage.roomId.toString(),
        senderId: populatedMessage.senderId._id.toString(),
        content: populatedMessage.content,
        messageType: populatedMessage.messageType,
        isEdited: populatedMessage.isEdited,
        isDeleted: populatedMessage.isDeleted,
        createdAt: populatedMessage.createdAt,
        seenBy: populatedMessage.seenBy || [],
        deliveredTo: populatedMessage.deliveredTo || []
      };

      io.to(userId).to(receiverId).emit("receive_private_message", messageToSend);
    } catch (err) {
      console.error("Private message error:", err);
    }
  });

  // Edit message
  socket.on("edit_message", async ({ messageId, newContent }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.senderId.toString() !== userId || message.isDeleted) return;

      message.content = newContent;
      message.isEdited = true;
      message.version += 1;
      await message.save();

      const updatedMessage = message.toObject();
      updatedMessage.senderId = updatedMessage.senderId.toString();
      
      io.to(message.roomId.toString()).emit("message_edited", updatedMessage);
    } catch (err) {
      console.error("Edit error:", err);
    }
  });

  // Delete message
  socket.on("delete_message", async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.senderId.toString() !== userId) return;

      message.isDeleted = true;
      message.deletedAt = new Date();
      message.deletedBy = userId;
      message.content = null;
      await message.save();

      io.to(message.roomId.toString()).emit("message_deleted", { messageId });
    } catch (err) {
      console.error("Delete error:", err);
    }
  });

  // Mark message as seen
  socket.on("mark_seen", async (roomId) => {
    try {
      await Message.updateMany(
        {
          roomId,
          senderId: { $ne: userId },
          seenBy: { $ne: userId },
          isDeleted: false
        },
        { $addToSet: { seenBy: userId } }
      );

      io.to(roomId).emit("message_seen_update", { roomId, userId });
    } catch (err) {
      console.error("Seen error:", err);
    }
  });

  // Message delivered
  socket.on("message_delivered", async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      if (!message.deliveredTo.includes(userId)) {
        message.deliveredTo.push(userId);
        await message.save();
      }

      io.to(message.roomId.toString()).emit("message_status_update", {
        messageId,
        deliveredTo: message.deliveredTo,
        seenBy: message.seenBy
      });
    } catch (err) {
      console.error("Delivery error:", err);
    }
  });
};