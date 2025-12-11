import { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./NotificationDropdown.module.scss";
import axios from "axios";

const cx = classNames.bind(styles);

function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("access_token");

      // Skip if no token
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_DOMAIN}/notifications/get-notifications`,
        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("access_token");
      await axios.patch(
        `${process.env.REACT_APP_SERVER_DOMAIN}/notifications/mark-notification-read`,
        { notificationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, seen: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = sessionStorage.getItem("access_token");
      await axios.delete(
        `${process.env.REACT_APP_SERVER_DOMAIN}/notifications/delete-notification/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      await axios.patch(
        `${process.env.REACT_APP_SERVER_DOMAIN}/notifications/mark-all-notifications-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, seen: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "reply":
        return "↩️";
      case "booking":
        return "📅";
      case "payment":
        return "💳";
      case "review":
        return "⭐";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  const getNotificationMessage = (notification) => {
    const username = notification.user?.personal_info?.username || "Ai đó";
    const blogTitle = notification.blog?.title || "bài viết";

    switch (notification.type) {
      case "like":
        return `${username} đã thích ${blogTitle}`;
      case "comment":
        return `${username} đã bình luận về ${blogTitle}`;
      case "reply":
        return `${username} đã trả lời bình luận của bạn`;
      default:
        return notification.message || "Bạn có thông báo mới";
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
    return notifDate.toLocaleDateString("vi-VN");
  };

  const unreadCount = notifications.filter((n) => !n.seen).length;

  if (!isOpen) return null;

  return (
    <div className={cx("dropdown")} ref={dropdownRef}>
      <div className={cx("dropdown-header")}>
        <h3 className={cx("title")}>Thông Báo</h3>
        {unreadCount > 0 && (
          <button className={cx("mark-all-btn")} onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className={cx("notifications-list")}>
        {loading ? (
          <div className={cx("loading")}>Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className={cx("empty")}>
            <span className={cx("empty-icon")}>🔔</span>
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={cx("notification-item", {
                unread: !notification.read,
              })}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className={cx("notif-icon")}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className={cx("notif-content")}>
                <p className={cx("notif-message")}>
                  {getNotificationMessage(notification)}
                </p>
                <span className={cx("notif-time")}>
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <button
                className={cx("delete-btn")}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification._id);
                }}
                title="Xóa thông báo"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className={cx("dropdown-footer")}>
          <button className={cx("view-all-btn")}>Xem tất cả thông báo</button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
