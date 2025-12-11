import { useState, useEffect, useCallback } from "react";
import classNames from "classnames/bind";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import SearchModal from "./SearchModal";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState(null);

  // Load user info from session
  useEffect(() => {
    const userSession = sessionStorage.getItem("user");
    if (userSession) {
      try {
        setUser(JSON.parse(userSession));
      } catch (error) {
        console.error("Error parsing user session:", error);
      }
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch unread notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("access_token");

      // Skip if no token
      if (!token) {
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_DOMAIN}/notifications/get-notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const unreadCount =
          data.notifications?.filter((n) => !n.seen).length || 0;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotificationCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      setShowSearch(true);
    }
    // Close modal on Escape
    if (e.key === "Escape") {
      setShowSearch(false);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim().length >= 2) {
      setShowSearch(true);
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    // Don't clear query to allow user to modify and search again
  };

  // Debug function to test search API directly
  const testSearchAPI = async () => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      alert("No token found! Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_DOMAIN}/search-rooms?q=203`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.rooms && data.rooms.length > 0) {
        alert(`Success! Found ${data.rooms.length} rooms`);
      } else {
        alert("No rooms found");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className={cx("admin-wrapper")}>
      {/* Sidebar */}
      <aside className={cx("sidebar")}>
        <div className={cx("logo")}>
          <h1 className={cx("logo-text")}>PathWay</h1>
        </div>

        <nav className={cx("nav-menu")}>
          <Link
            to="/admin/dashboard"
            className={cx("nav-item", {
              active: location.pathname === "/admin/dashboard",
            })}
          >
            <span className={cx("nav-icon")}>📊</span>
            <span className={cx("nav-text")}>Bảng điều khiển</span>
          </Link>

          <Link
            to="/admin/hotels"
            className={cx("nav-item", {
              active: location.pathname === "/admin/hotels",
            })}
          >
            <span className={cx("nav-icon")}>🏨</span>
            <span className={cx("nav-text")}>Khách Sạn</span>
          </Link>

          <Link
            to="/admin/rooms"
            className={cx("nav-item", {
              active: location.pathname === "/admin/rooms",
            })}
          >
            <span className={cx("nav-icon")}>🛏️</span>
            <span className={cx("nav-text")}>Phòng</span>
          </Link>

          <Link
            to="/admin/bookings"
            className={cx("nav-item", {
              active: location.pathname === "/admin/bookings",
            })}
          >
            <span className={cx("nav-icon")}>📅</span>
            <span className={cx("nav-text")}>Đặt Phòng</span>
          </Link>

          <Link
            to="/admin/reviews"
            className={cx("nav-item", {
              active: location.pathname === "/admin/reviews",
            })}
          >
            <span className={cx("nav-icon")}>⭐</span>
            <span className={cx("nav-text")}>Đánh Giá</span>
          </Link>

          <Link
            to="/admin/calendar"
            className={cx("nav-item", {
              active: location.pathname === "/admin/calendar",
            })}
          >
            <span className={cx("nav-icon")}>📅</span>
            <span className={cx("nav-text")}>Lịch Phòng</span>
          </Link>

          <Link
            to="/admin/notifications"
            className={cx("nav-item", {
              active: location.pathname === "/admin/notifications",
            })}
          >
            <span className={cx("nav-icon")}>🔔</span>
            <span className={cx("nav-text")}>Thông Báo</span>
          </Link>

          <Link
            to="/admin/payments"
            className={cx("nav-item", {
              active: location.pathname === "/admin/payments",
            })}
          >
            <span className={cx("nav-icon")}>💳</span>
            <span className={cx("nav-text")}>Thanh Toán</span>
          </Link>

          <Link
            to="/admin/reports"
            className={cx("nav-item", {
              active: location.pathname === "/admin/reports",
            })}
          >
            <span className={cx("nav-icon")}>📊</span>
            <span className={cx("nav-text")}>Báo Cáo</span>
          </Link>

          <Link
            to="/admin/settings"
            className={cx("nav-item", {
              active: location.pathname === "/admin/settings",
            })}
          >
            <span className={cx("nav-icon")}>⚙️</span>
            <span className={cx("nav-text")}>Cài Đặt</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={cx("main-content")}>
        {/* Header */}
        <header className={cx("header")}>
          <h2 className={cx("page-title")}>Partner Admin</h2>

          <div className={cx("header-actions")}>
            <div className={cx("search-box")}>
              <input
                type="text"
                placeholder="Tìm kiếm khách sạn, phòng, đặt phòng... (Nhấn Enter)"
                className={cx("search-input")}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
              />
              {searchQuery && (
                <button
                  className={cx("clear-search")}
                  onClick={() => setSearchQuery("")}
                  title="Xóa"
                >
                  ✕
                </button>
              )}
              <button
                className={cx("search-icon")}
                onClick={handleSearchIconClick}
                title="Tìm kiếm (Enter)"
              >
                🔍
              </button>
            </div>

            <Link
              to="/admin/settings"
              className={cx("icon-btn")}
              title="Cài đặt"
            >
              ⚙️
            </Link>

            {/* Temporary test button
            <button
              onClick={testSearchAPI}
              className={cx("icon-btn")}
              title="Test Search API"
              style={{ background: "#ff5b26", color: "white" }}
            >
              🧪
            </button> */}

            <div className={cx("notification-wrapper")}>
              <button
                className={cx("icon-btn", "notification", {
                  active: showNotifications,
                })}
                title="Thông báo"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {notificationCount > 0 && (
                  <span className={cx("badge")}>{notificationCount}</span>
                )}
              </button>
              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            <div className={cx("profile-wrapper")}>
              <div
                className={cx("profile-avatar", { active: showProfile })}
                title="Profile"
                onClick={() => setShowProfile(!showProfile)}
              >
                <img
                  src={user?.profile_img || "https://i.pravatar.cc/60"}
                  alt={user?.username || "Profile"}
                />
              </div>
              <ProfileDropdown
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                user={user}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={cx("content")}>{children}</div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={handleCloseSearch}
        searchQuery={searchQuery}
      />
    </div>
  );
}

export default AdminLayout;
