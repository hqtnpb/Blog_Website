import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faUsers,
  faUserTie,
  faHotel,
  faCalendarCheck,
  faDollarSign,
  faBars,
  faTimes,
  faSignOutAlt,
  faCog,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./SystemAdminLayout.module.scss";
import toast from "react-hot-toast";

const cx = classNames.bind(styles);

const menuItems = [
  {
    path: "/system-admin/dashboard",
    icon: faDashboard,
    label: "Dashboard",
  },
  {
    path: "/system-admin/users",
    icon: faUsers,
    label: "Users",
  },
  {
    path: "/system-admin/partners",
    icon: faUserTie,
    label: "Partners",
  },
  {
    path: "/system-admin/blogs",
    icon: faNewspaper,
    label: "Blogs",
  },
  {
    path: "/system-admin/hotels",
    icon: faHotel,
    label: "Hotels",
  },
  {
    path: "/system-admin/bookings",
    icon: faCalendarCheck,
    label: "Bookings",
  },
  {
    path: "/system-admin/payments",
    icon: faDollarSign,
    label: "Payments",
  },
  {
    path: "/system-admin/settings",
    icon: faCog,
    label: "Settings",
  },
];

function SystemAdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userSession = sessionStorage.getItem("user");
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        setUser(userData);

        // Check if user is admin
        if (userData.role !== "admin") {
          toast.error("Access denied. Admin only.");
          navigate("/hotels");
        }
      } catch (error) {
        console.error("Error parsing user session:", error);
        navigate("/signin");
      }
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logged out successfully");
    // Force redirect to login with page reload
    window.location.href = "/signin";
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={cx("layout")}>
      {/* Sidebar */}
      <aside className={cx("sidebar", { collapsed: !sidebarOpen })}>
        <div className={cx("sidebarHeader")}>
          <h2>System Admin</h2>
          <button
            className={cx("toggleBtn")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
          </button>
        </div>

        <nav className={cx("navigation")}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cx("navItem", { active: isActivePath(item.path) })}
            >
              <FontAwesomeIcon icon={item.icon} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={cx("sidebarFooter")}>
          <button onClick={handleLogout} className={cx("logoutBtn")}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cx("main", { expanded: !sidebarOpen })}>
        <div className={cx("topbar")}>
          <button
            className={cx("mobileToggle")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className={cx("userInfo")}>
            {user && (
              <>
                <img
                  src={user.profile_img || "/default-avatar.png"}
                  alt={user.username}
                />
                <div className={cx("userDetails")}>
                  <span className={cx("userName")}>@{user.username}</span>
                  <span className={cx("userRole")}>System Administrator</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={cx("content")}>{children}</div>
      </main>
    </div>
  );
}

export default SystemAdminLayout;
