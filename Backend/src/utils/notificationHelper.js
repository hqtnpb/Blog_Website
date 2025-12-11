/**
 * Real-time Notification Helper
 * Sends notifications via Socket.IO to connected users
 */

/**
 * Send notification to a specific user
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification data
 */
const sendNotificationToUser = (userId, notification) => {
  try {
    const io = global.io;
    const connectedUsers = global.connectedUsers;

    if (!io || !connectedUsers) {
      console.warn("⚠️ Socket.IO not initialized");
      return false;
    }

    const userIdStr = userId.toString();
    const socketId = connectedUsers.get(userIdStr);

    console.log(`📤 Attempting to send notification to user ${userIdStr}`);
    console.log(`🔍 Looking for socket ID for user ${userIdStr}`);
    console.log(`🗺️ All connected users:`, Array.from(connectedUsers.keys()));
    console.log(`🔌 Found socket ID:`, socketId || "NOT FOUND");

    if (socketId) {
      io.to(socketId).emit("notification", {
        ...notification,
        timestamp: new Date(),
        read: false,
      });
      console.log(
        `✅ Notification sent to user ${userIdStr} via socket ${socketId}`
      );
      console.log(`📬 Notification type:`, notification.type);
      console.log(`📬 Notification title:`, notification.title);
      return true;
    } else {
      console.log(`⚠️ User ${userIdStr} not connected to socket`);
      console.log(
        `⚠️ Available users:`,
        Array.from(connectedUsers.keys()).join(", ")
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return false;
  }
};

/**
 * Send notification to multiple users
 * @param {array} userIds - Array of user IDs
 * @param {object} notification - Notification data
 */
const sendNotificationToUsers = (userIds, notification) => {
  try {
    const io = global.io;
    const connectedUsers = global.connectedUsers;

    if (!io || !connectedUsers) {
      console.warn("⚠️ Socket.IO not initialized");
      return 0;
    }

    console.log(
      `📤 Attempting to send notification to ${userIds.length} users`
    );
    console.log(
      "🔌 Connected users in map:",
      Array.from(connectedUsers.keys())
    );

    let sentCount = 0;

    userIds.forEach((userId) => {
      const userIdStr = userId.toString();
      const socketId = connectedUsers.get(userIdStr);
      console.log(
        `  - User ${userIdStr}: ${socketId ? `✅ Connected (${socketId})` : "❌ Not connected"}`
      );

      if (socketId) {
        io.to(socketId).emit("notification", {
          ...notification,
          timestamp: new Date(),
          read: false,
        });
        sentCount++;
      }
    });

    console.log(`✅ Notification sent to ${sentCount}/${userIds.length} users`);
    return sentCount;
  } catch (error) {
    console.error("❌ Error sending notifications:", error);
    return 0;
  }
};

/**
 * Broadcast notification to all connected users
 * @param {object} notification - Notification data
 */
const broadcastNotification = (notification) => {
  try {
    const io = global.io;

    if (!io) {
      console.warn("⚠️ Socket.IO not initialized");
      return false;
    }

    io.emit("notification", {
      ...notification,
      timestamp: new Date(),
      read: false,
    });

    console.log("✅ Notification broadcasted to all users");
    return true;
  } catch (error) {
    console.error("❌ Error broadcasting notification:", error);
    return false;
  }
};

/**
 * Notification types
 */
const NotificationTypes = {
  BOOKING_CREATED: "booking_created",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_CANCELLED: "booking_cancelled",
  BOOKING_STATUS_CHANGED: "booking_status_changed",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  REVIEW_RECEIVED: "review_received",
  REVIEW_REPLY: "review_reply",
  BLOG_COMMENT: "blog_comment",
  BLOG_LIKE: "blog_like",
  SYSTEM_ANNOUNCEMENT: "system_announcement",
};

/**
 * Create notification object
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data
 */
const createNotification = (type, title, message, data = {}) => {
  return {
    type,
    title,
    message,
    data,
    timestamp: new Date(),
    read: false,
  };
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToUsers,
  broadcastNotification,
  NotificationTypes,
  createNotification,
};
