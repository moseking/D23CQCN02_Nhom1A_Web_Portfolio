const Notification = require("../models/Notification");

const createNotification = async ({
  req,
  sender,
  receiver,
  type,
  post = null,
}) => {
  if (sender.toString() === receiver.toString()) return null;

  const notification = await Notification.create({
    sender,
    receiver,
    type,
    post,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "username avatar")
    .populate("post", "caption image video");

  const io = req.app.get("io");
  const onlineUsers = req.app.get("onlineUsers");

  const receiverSocketId = onlineUsers.get(receiver.toString());

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("new_notification", populatedNotification);
  }

  return populatedNotification;
};

module.exports = createNotification;
