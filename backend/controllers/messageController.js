import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = 20;
    const skip = page * limit;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "username")
      .lean();

  
    const formattedMessages = messages.map(msg => ({
      _id: msg._id.toString(),
      roomId: msg.roomId.toString(),
      senderId: msg.senderId._id.toString(),
      content: msg.content,
      messageType: msg.messageType,
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
      seenBy: msg.seenBy || [],
      deliveredTo: msg.deliveredTo || []
    }));

    res.status(200).json(formattedMessages.reverse());
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};