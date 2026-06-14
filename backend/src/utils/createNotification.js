const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotification = async (req, data) => {
  try {
    const { sender, receiver, type, post, message } = data;

    if (!sender || !receiver || sender.toString() === receiver.toString()) {
      return null;
    }

    const notification = await Notification.create({
      sender,
      receiver,
      type,
      post,
      message,
      isRead: false,
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "username avatar")
      .populate("post", "title mediaUrl image");

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const receiverSocketId = onlineUsers?.get(receiver.toString());

    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("new_notification", populatedNotification);
      io.to(receiverSocketId).emit("notification", populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.log("Create notification error:", error);
    return null;
  }
};

module.exports = createNotification;
