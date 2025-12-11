import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(
      process.env.REACT_APP_SERVER_DOMAIN?.replace("/api", "") ||
        "http://localhost:8000",
      {
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    );

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setConnected(true);

      // Join with user ID if logged in
      const userDataStr = sessionStorage.getItem("user");
      console.log(
        "👤 User data from session:",
        userDataStr ? "Found" : "Not found"
      );

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          console.log("👤 Parsed user data:", userData);

          // Get userId from token or session data
          let userId = userData._id || userData.id;

          // If no direct userId, decode from JWT token
          if (!userId && userData.accessToken) {
            try {
              const tokenPayload = JSON.parse(
                atob(userData.accessToken.split(".")[1])
              );
              userId = tokenPayload.id;
              console.log("👤 User ID from token:", userId);
            } catch (tokenError) {
              console.error("❌ Error decoding token:", tokenError);
            }
          }

          if (userId) {
            socketInstance.emit("join", userId);
            console.log(`✅ Joined socket room for user ${userId}`);
          } else {
            console.warn("⚠️ No user ID found in session data or token");
          }
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
        }
      } else {
        console.warn("⚠️ No user data in sessionStorage");
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    // Listen for notifications
    socketInstance.on("notification", (notification) => {
      console.log("🔔 Received notification:", notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      const { type, title, message } = notification;

      switch (type) {
        case "payment_success":
          toast.success(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "💳",
            }
          );
          break;

        case "booking_confirmed":
          toast.success(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "✅",
            }
          );
          break;

        case "booking_cancelled":
          toast.error(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "❌",
            }
          );
          break;

        case "booking_status_changed":
          toast(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "📝",
            }
          );
          break;

        case "payment_failed":
          toast.error(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "❌",
            }
          );
          break;

        case "review_received":
        case "review_reply":
          toast.success(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "⭐",
            }
          );
          break;

        case "blog_comment":
          toast(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 5000,
              icon: "💬",
            }
          );
          break;

        case "blog_like":
          toast.success(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 4000,
              icon: "❤️",
            }
          );
          break;

        default:
          toast(
            <div>
              <strong>{title}</strong>
              <br />
              {message}
            </div>,
            {
              duration: 4000,
              icon: "🔔",
            }
          );
      }
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
