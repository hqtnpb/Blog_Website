import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHotel,
  faCalendarCheck,
  faDollarSign,
  faChartLine,
  faUserTie,
  faStar,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import {
  getPlatformStats,
  getRevenueReport,
  getUsersReport,
} from "~/common/adminApi";
import styles from "./SystemAdminDashboard.module.scss";

const COLORS = ["#ff5b26", "#ff8a65", "#ffab91", "#4CAF50", "#2196F3"];

function SystemAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, revenueData, usersData] = await Promise.all([
        getPlatformStats(),
        getRevenueReport({ period: "monthly" }),
        getUsersReport(),
      ]);

      setStats(statsData);

      // Format revenue data for chart
      const formattedRevenue = (revenueData.report || []).map((item) => ({
        label: `${item._id.year}/${item._id.month || ""}`,
        revenue: item.totalRevenue / 1000000, // Convert to millions
        bookings: item.bookingCount,
      }));
      setRevenueData(formattedRevenue);

      // Format users data for pie chart
      const formattedUsers = (usersData.usersByRole || []).map((item) => ({
        name:
          item._id === "user"
            ? "Users"
            : item._id === "partner"
            ? "Partners"
            : "Admins",
        value: item.count,
      }));
      setUsersData(formattedUsers);

      toast.success("Dashboard loaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>System Admin Dashboard</h1>
        <p>Platform-wide statistics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.statIcon} style={{ background: "#ff5b26" }}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats?.users || 0}</h3>
            <p>Total Users</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.statIcon} style={{ background: "#4CAF50" }}>
            <FontAwesomeIcon icon={faUserTie} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats?.partners || 0}</h3>
            <p>Total Partners</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.statIcon} style={{ background: "#2196F3" }}>
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats?.hotels || 0}</h3>
            <p>Total Hotels</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.statIcon} style={{ background: "#FF9800" }}>
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats?.bookings || 0}</h3>
            <p>Total Bookings</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.statIcon} style={{ background: "#9C27B0" }}>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className={styles.statInfo}>
            <h3>{formatCurrency(stats?.totalRevenue || 0)}</h3>
            <p>Total Revenue</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.statIcon} style={{ background: "#FFC107" }}>
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats?.reviews || 0}</h3>
            <p>Total Reviews</p>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2>
            <FontAwesomeIcon icon={faChartLine} /> Revenue Trend (Millions VND)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)}M VND`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff5b26"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Users Distribution */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2>
            <FontAwesomeIcon icon={faUsers} /> Users Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {usersData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity Stats */}
      <div className={styles.activityGrid}>
        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3>Recent Activity (30 days)</h3>
          <div className={styles.activityItem}>
            <span>New Bookings:</span>
            <strong>{stats?.recentBookings || 0}</strong>
          </div>
          <div className={styles.activityItem}>
            <span>Active Bookings:</span>
            <strong>{stats?.activeBookings || 0}</strong>
          </div>
          <div className={styles.activityItem}>
            <span>Avg Booking Value:</span>
            <strong>{formatCurrency(stats?.avgBookingValue || 0)}</strong>
          </div>
        </motion.div>

        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <h3>Platform Resources</h3>
          <div className={styles.activityItem}>
            <span>Total Rooms:</span>
            <strong>{stats?.rooms || 0}</strong>
          </div>
          <div className={styles.activityItem}>
            <span>Avg Rooms per Hotel:</span>
            <strong>
              {stats?.hotels > 0 ? (stats.rooms / stats.hotels).toFixed(1) : 0}
            </strong>
          </div>
          <div className={styles.activityItem}>
            <span>Avg Reviews per Hotel:</span>
            <strong>
              {stats?.hotels > 0
                ? (stats.reviews / stats.hotels).toFixed(1)
                : 0}
            </strong>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SystemAdminDashboard;
