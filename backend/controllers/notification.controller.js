import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ to: req.userId })
      .sort({ createdAt: -1 })
      .populate("from", "username profileImg");

    // Only mark what's being returned, so one that arrives mid-request stays unread.
    await Notification.updateMany(
      { _id: { $in: notifications.map(({ _id }) => _id) }, read: false },
      { read: true }
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error(`Error in getNotifications controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ to: req.userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteNotifications controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
