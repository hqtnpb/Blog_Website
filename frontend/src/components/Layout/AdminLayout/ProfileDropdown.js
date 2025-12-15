import { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ProfileDropdown.module.scss";

const cx = classNames.bind(styles);

function ProfileDropdown({ isOpen, onClose, user }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    // Clear session
    sessionStorage.clear();
    localStorage.clear();

    // Force redirect to login with page reload
    window.location.href = "/signin";
  };

  if (!isOpen) return null;

  return (
    <div className={cx("dropdown")} ref={dropdownRef}>
      <div className={cx("user-info")}>
        <div className={cx("avatar-large")}>
          <img
            src={user?.profile_img || "https://i.pravatar.cc/80"}
            alt={user?.username || "User"}
          />
        </div>
        <div className={cx("user-details")}>
          <h4 className={cx("user-name")}>
            {user?.username || "Partner Admin"}
          </h4>
          <p className={cx("user-email")}>{user?.email || "N/A"}</p>
        </div>
      </div>

      <div className={cx("divider")}></div>

      <div className={cx("menu-items")}>
        <Link to="/dashboard" className={cx("menu-item")} onClick={onClose}>
          <span className={cx("menu-icon")}>👤</span>
          <span className={cx("menu-text")}>Hồ Sơ Cá Nhân</span>
        </Link>

        <Link
          to="/admin/dashboard"
          className={cx("menu-item")}
          onClick={onClose}
        >
          <span className={cx("menu-icon")}>📊</span>
          <span className={cx("menu-text")}>Bảng điều khiển</span>
        </Link>

        <Link
          to="/admin/settings"
          className={cx("menu-item")}
          onClick={onClose}
        >
          <span className={cx("menu-icon")}>⚙️</span>
          <span className={cx("menu-text")}>Cài Đặt</span>
        </Link>

        <Link
          to="/admin/payments"
          className={cx("menu-item")}
          onClick={onClose}
        >
          <span className={cx("menu-icon")}>💳</span>
          <span className={cx("menu-text")}>Thanh Toán</span>
        </Link>

        <Link to="/admin/reports" className={cx("menu-item")} onClick={onClose}>
          <span className={cx("menu-icon")}>📄</span>
          <span className={cx("menu-text")}>Báo Cáo</span>
        </Link>
      </div>

      <div className={cx("divider")}></div>

      <div className={cx("menu-items")}>
        <button className={cx("menu-item", "help")} onClick={onClose}>
          <span className={cx("menu-icon")}>❓</span>
          <span className={cx("menu-text")}>Trợ Giúp</span>
        </button>

        <button className={cx("menu-item", "logout")} onClick={handleLogout}>
          <span className={cx("menu-icon")}>🚪</span>
          <span className={cx("menu-text")}>Đăng Xuất</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;
