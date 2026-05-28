const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "username avatar")
      .populate("post", "title content media authorName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot get notifications",
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        receiver: userId,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot mark as read",
      error: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;

    await Notification.updateMany(
      { receiver: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot mark all as read",
      error: error.message,
    });
  }
};
