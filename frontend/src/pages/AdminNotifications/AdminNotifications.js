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
      toast.success("Đã đánh dấu là đã đọc");
    } catch (error) {
      toast.error(error.message || "Không thể đánh dấu là đã đọc");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, seen: true }))
      );
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error(error.message || "Không thể đánh dấu tất cả là đã đọc");
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
      toast.success("Đã xóa thông báo");
    } catch (error) {
      toast.error(error.message || "Không thể xóa thông báo");
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
        return `${username} đã thích bài viết "${
          blog?.title || "Không có tiêu đề"
        }"`;
      case "comment":
        return `${username} đã bình luận về "${
          blog?.title || "Không có tiêu đề"
        }"`;
      case "reply":
        return `${username} đã trả lời bình luận của bạn`;
      case "booking":
        return `Đơn đặt phòng mới từ ${username}`;
      case "cancellation":
        return `${username} đã hủy đơn đặt phòng`;
      default:
        return "Thông báo mới";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
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
          <h1 className={cx("title")}>Thông báo</h1>
          {unreadCount > 0 && (
            <span className={cx("unread-badge")}>{unreadCount} chưa đọc</span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            className={cx("mark-all-btn")}
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead || unreadCount === 0}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            {markingAllRead ? "Đang đánh dấu..." : "Đánh dấu tất cả là đã đọc"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={cx("filters")}>
        <FontAwesomeIcon icon={faFilter} className={cx("filter-icon")} />
        <div className={cx("filter-tabs")}>
          {[
            { key: "all", label: "Tất cả" },
            { key: "like", label: "Thích" },
            { key: "comment", label: "Bình luận" },
            { key: "reply", label: "Trả lời" },
            { key: "booking", label: "Đặt phòng" },
            { key: "cancellation", label: "Hủy đơn" },
          ].map((filterType) => (
            <button
              key={filterType.key}
              className={cx("filter-tab", {
                active: filter === filterType.key,
              })}
              onClick={() => handleFilterChange(filterType.key)}
            >
              {filterType.label}
            </button>
          ))}
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
            <h3>Không có thông báo</h3>
            <p>
              {filter === "all"
                ? "Bạn đã xem hết thông báo!"
                : `Không tìm thấy thông báo ${
                    filter === "like"
                      ? "thích"
                      : filter === "comment"
                      ? "bình luận"
                      : filter === "reply"
                      ? "trả lời"
                      : filter === "booking"
                      ? "đặt phòng"
                      : "hủy đơn"
                  }`}
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
                      title="Đánh dấu là đã đọc"
                    >
                      <FontAwesomeIcon icon={faEnvelopeOpen} />
                    </button>
                  )}
                  <button
                    className={cx("action-btn", "delete-btn")}
                    onClick={() => handleDelete(notification._id)}
                    disabled={deleting === notification._id}
                    title="Xóa"
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
