import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckDouble,
  faTrash,
  faFilter,
  faSpinner,
  faEnvelope,
  faEnvelopeOpen,
  faCalendarCheck,
  faCalendarTimes,
  faStar,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import styles from "./AdminNotifications.module.scss";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../common/partnerApi";

const cx = classNames.bind(styles);

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter, currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(currentPage, filter, 10);
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
      setHasMore(data.hasMore);
    } catch (error) {
      toast.error(error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, seen: true } : notif
        )
      );
      toast.success("Marked as read");
    } catch (error) {
      toast.error(error.message || "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, seen: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.message || "Failed to mark all as read");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      setDeleting(notificationId);
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      toast.success("Notification deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete notification");
    } finally {
      setDeleting(null);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return { icon: faStar, color: "#ffd700" };
      case "comment":
        return { icon: faEnvelope, color: "#ff5b26" };
      case "reply":
        return { icon: faEnvelopeOpen, color: "#ff8c42" };
      case "booking":
        return { icon: faCalendarCheck, color: "#4caf50" };
      case "cancellation":
        return { icon: faCalendarTimes, color: "#f44336" };
      default:
        return { icon: faBell, color: "#666" };
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, user, blog } = notification;
    const username = user?.personal_info?.username || "Someone";

    switch (type) {
      case "like":
        return `${username} liked your post "${blog?.title || "Untitled"}"`;
      case "comment":
        return `${username} commented on "${blog?.title || "Untitled"}"`;
      case "reply":
        return `${username} replied to your comment`;
      case "booking":
        return `New booking received from ${username}`;
      case "cancellation":
        return `${username} cancelled a booking`;
      default:
        return "New notification";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const unreadCount = notifications.filter((n) => !n.seen).length;

  if (loading && currentPage === 1) {
    return (
      <div className={cx("loading-container")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loading-icon")} />
        <p>Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className={cx("notifications-container")}>
      {/* Header */}
      <div className={cx("header")}>
        <div className={cx("header-left")}>
          <FontAwesomeIcon icon={faBell} className={cx("header-icon")} />
          <h1 className={cx("title")}>Notifications</h1>
          {unreadCount > 0 && (
            <span className={cx("unread-badge")}>{unreadCount} unread</span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            className={cx("mark-all-btn")}
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead || unreadCount === 0}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            {markingAllRead ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={cx("filters")}>
        <FontAwesomeIcon icon={faFilter} className={cx("filter-icon")} />
        <div className={cx("filter-tabs")}>
          {["all", "like", "comment", "reply", "booking", "cancellation"].map(
            (filterType) => (
              <button
                key={filterType}
                className={cx("filter-tab", { active: filter === filterType })}
                onClick={() => handleFilterChange(filterType)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className={cx("notifications-list")}>
        {notifications.length === 0 ? (
          <div className={cx("empty-state")}>
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className={cx("empty-icon")}
            />
            <h3>No notifications</h3>
            <p>
              {filter === "all"
                ? "You're all caught up!"
                : `No ${filter} notifications found`}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const { icon, color } = getNotificationIcon(notification.type);
            return (
              <div
                key={notification._id}
                className={cx("notification-card", {
                  unread: !notification.seen,
                })}
              >
                <div
                  className={cx("notification-icon")}
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <FontAwesomeIcon icon={icon} />
                </div>

                <div className={cx("notification-content")}>
                  <div className={cx("notification-header")}>
                    <div className={cx("user-info")}>
                      {notification.user?.personal_info?.profile_img && (
                        <img
                          src={notification.user.personal_info.profile_img}
                          alt="User"
                          className={cx("user-avatar")}
                        />
                      )}
                      <p className={cx("notification-message")}>
                        {getNotificationMessage(notification)}
                      </p>
                    </div>
                    <span className={cx("notification-time")}>
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  {notification.comment && (
                    <div className={cx("notification-preview")}>
                      <p>"{notification.comment.comment}"</p>
                    </div>
                  )}

                  {notification.reply && (
                    <div className={cx("notification-preview")}>
                      <p>"{notification.reply.comment}"</p>
                    </div>
                  )}
                </div>

                <div className={cx("notification-actions")}>
                  {!notification.seen && (
                    <button
                      className={cx("action-btn", "read-btn")}
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <FontAwesomeIcon icon={faEnvelopeOpen} />
                    </button>
                  )}
                  <button
                    className={cx("action-btn", "delete-btn")}
                    onClick={() => handleDelete(notification._id)}
                    disabled={deleting === notification._id}
                    title="Delete"
                  >
                    <FontAwesomeIcon
                      icon={deleting === notification._id ? faSpinner : faTrash}
                      spin={deleting === notification._id}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={cx("pagination")}>
          <button
            className={cx("page-btn")}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={cx("page-info")}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={cx("page-btn")}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={!hasMore}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
