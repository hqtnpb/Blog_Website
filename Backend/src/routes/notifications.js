const notificationsController = require("../controllers/notifications");
const router = require("express").Router();
const verifyJWT = require("../middleWare/authMiddleWare");

router.get(
  "/new-notification",
  verifyJWT,
  notificationsController.newNotification
);
router.post(
  "/get-notifications",
  verifyJWT,
  notificationsController.getNotifications
);
router.post(
  "/all-notifications-count",
  verifyJWT,
  notificationsController.allNotificationsCount
);

router.patch(
  "/mark-notification-read",
  verifyJWT,
  notificationsController.markNotificationRead
);

router.patch(
  "/mark-all-notifications-read",
  verifyJWT,
  notificationsController.markAllNotificationsRead
);

router.delete(
  "/delete-notification/:notificationId",
  verifyJWT,
  notificationsController.deleteNotification
);

module.exports = router;
