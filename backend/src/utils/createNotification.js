const Notification = require("../models/Notification");

const createNotification = async (
  req,
  { sender, receiver, post = null, type, message }
) => {
  if (!sender || !receiver || !type || !message) return null;

  if (sender.toString() === receiver.toString()) return null;

  const notification = await Notification.create({
    sender,
    receiver,
    post,
    type,
    message,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "username avatar")
    .populate("receiver", "username avatar")
    .populate("post", "title content media authorName");

  const io = req.app.get("io");
  const onlineUsers = req.app.get("onlineUsers");

  if (!io || !onlineUsers) return populatedNotification;

  const receiverSocketId = onlineUsers.get(receiver.toString());

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("new_notification", populatedNotification);
  }

  return populatedNotification;
};

module.exports = createNotification;
