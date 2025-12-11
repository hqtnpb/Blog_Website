import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faHotel,
  faCalendarCheck,
  faArrowTrendUp,
  faChartLine,
  faUsers,
  faArrowUp,
  faSpinner,
  faTrophy,
  faPercentage,
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
  getDashboardStats,
  getPartnerHotels,
  getRevenueAnalytics,
  getOccupancyRate,
  getTopRooms,
} from "~/common/partnerApi";
import styles from "./AdminDashboard.module.scss";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [topRooms, setTopRooms] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAnalyticsData();
    }
  }, [selectedPeriod, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, hotelsData] = await Promise.all([
        getDashboardStats(),
        getPartnerHotels(),
      ]);
      setStats(statsData.stats);
      setHotels(hotelsData);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const [revenueRes, occupancyRes, topRoomsRes] = await Promise.all([
        getRevenueAnalytics({ period: selectedPeriod }),
        getOccupancyRate(),
        getTopRooms(5),
      ]);

      // Revenue data is already formatted from backend
      const formattedRevenue = (revenueRes || []).map((item) => ({
        label: item.date,
        revenue: item.revenue,
        bookings: item.bookings,
      }));

      setRevenueData(formattedRevenue);
      setOccupancy(
        occupancyRes?.data || {
          occupancyRate: 0,
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
        }
      );
      setTopRooms(topRoomsRes?.data || []);
    } catch (err) {
      console.error("Analytics error:", err);
      setRevenueData([]);
      setOccupancy({ occupancyRate: 0, totalRooms: 0, occupiedRooms: 0 });
      setTopRooms([]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>⚠️ {error}</p>
        <button className={styles.retryBtn} onClick={fetchDashboardData}>
          Thử lại
        </button>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalBookings = stats?.totalBookings || 0;
  const totalHotels = hotels.length;
  const avgBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const recentBookings = stats?.recentBookings || [];
  const revenueByHotel = stats?.revenueByHotel || [];

  // Create a map of hotel revenue for quick lookup
  const revenueMap = {};
  revenueByHotel.forEach((item) => {
    revenueMap[item.hotelId] = item.revenue;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.title}>Bảng Điều Khiển Đối Tác</h1>
          <p className={styles.subtitle}>
            Chào mừng trở lại! Đây là tổng quan hoạt động của bạn.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <motion.div className={styles.statCard} variants={itemVariants}>
          <div
            className={styles.statIcon}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tổng Doanh Thu</p>
            <h2 className={styles.statValue}>{formatCurrency(totalRevenue)}</h2>
            <div className={styles.statTrend}>
              <FontAwesomeIcon icon={faArrowUp} className={styles.trendUp} />
              <span>+12.5% so với tháng trước</span>
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} variants={itemVariants}>
          <div
            className={styles.statIcon}
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Tổng Đặt Phòng</p>
            <h2 className={styles.statValue}>{formatNumber(totalBookings)}</h2>
            <div className={styles.statTrend}>
              <FontAwesomeIcon icon={faArrowUp} className={styles.trendUp} />
              <span>+8.2% so với tháng trước</span>
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} variants={itemVariants}>
          <div
            className={styles.statIcon}
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
          >
            <FontAwesomeIcon icon={faHotel} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Khách Sạn</p>
            <h2 className={styles.statValue}>{totalHotels}</h2>
            <div className={styles.statTrend}>
              <span>Đang hoạt động</span>
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} variants={itemVariants}>
          <div
            className={styles.statIcon}
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            }}
          >
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Trung Bình/Đặt Phòng</p>
            <h2 className={styles.statValue}>{formatCurrency(avgBooking)}</h2>
            <div className={styles.statTrend}>
              <FontAwesomeIcon icon={faArrowUp} className={styles.trendUp} />
              <span>+5.1% so với tháng trước</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Revenue Trend Chart */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Xu Hướng Doanh Thu</h3>
            <div className={styles.periodSelector}>
              <button
                className={`${styles.periodBtn} ${
                  selectedPeriod === "day" ? styles.active : ""
                }`}
                onClick={() => setSelectedPeriod("day")}
              >
                Ngày
              </button>
              <button
                className={`${styles.periodBtn} ${
                  selectedPeriod === "week" ? styles.active : ""
                }`}
                onClick={() => setSelectedPeriod("week")}
              >
                Tuần
              </button>
              <button
                className={`${styles.periodBtn} ${
                  selectedPeriod === "month" ? styles.active : ""
                }`}
                onClick={() => setSelectedPeriod("month")}
              >
                Tháng
              </button>
            </div>
          </div>
          <div className={styles.chartContent}>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff5b26"
                    strokeWidth={3}
                    name="Doanh thu"
                    dot={{ fill: "#ff5b26", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <p>Chưa có dữ liệu doanh thu</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Occupancy Rate & Top Rooms */}
        <div className={styles.chartsColumn}>
          {/* Occupancy Rate */}
          <motion.div
            className={styles.chartCard}
            variants={itemVariants}
            style={{ marginBottom: "2.4rem" }}
          >
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Tỷ Lệ Lấp Đầy</h3>
              <FontAwesomeIcon
                icon={faPercentage}
                className={styles.chartIcon}
              />
            </div>
            <div className={styles.chartContent}>
              {occupancy ? (
                <div className={styles.occupancyDisplay}>
                  <div className={styles.occupancyCircle}>
                    <svg viewBox="0 0 100 100" className={styles.progressRing}>
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        strokeDasharray={`${
                          (occupancy.occupancyRate / 100) * 283
                        } 283`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ff5b26" />
                          <stop offset="100%" stopColor="#ff8c42" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className={styles.occupancyValue}>
                      <span className={styles.occupancyNumber}>
                        {occupancy.occupancyRate}%
                      </span>
                      <span className={styles.occupancyLabel}>Lấp đầy</span>
                    </div>
                  </div>
                  <div className={styles.occupancyStats}>
                    <div className={styles.occupancyStat}>
                      <span className={styles.occupancyStatLabel}>
                        Phòng đang thuê:
                      </span>
                      <span className={styles.occupancyStatValue}>
                        {occupancy.bookedRooms}
                      </span>
                    </div>
                    <div className={styles.occupancyStat}>
                      <span className={styles.occupancyStatLabel}>
                        Tổng phòng:
                      </span>
                      <span className={styles.occupancyStatValue}>
                        {occupancy.totalRooms}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>Đang tải...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Rooms */}
          <motion.div className={styles.chartCard} variants={itemVariants}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Top Phòng</h3>
              <FontAwesomeIcon icon={faTrophy} className={styles.chartIcon} />
            </div>
            <div className={styles.chartContent}>
              {topRooms.length > 0 ? (
                <div className={styles.topRoomsList}>
                  {topRooms.map((room, index) => (
                    <div key={room._id} className={styles.topRoomItem}>
                      <div className={styles.topRoomRank}>#{index + 1}</div>
                      <div className={styles.topRoomInfo}>
                        <h4 className={styles.topRoomName}>
                          {room.roomNumber} - {room.roomType}
                        </h4>
                        <p className={styles.topRoomHotel}>{room.hotelName}</p>
                      </div>
                      <div className={styles.topRoomStats}>
                        <span className={styles.topRoomRevenue}>
                          {formatCurrency(room.revenue)}
                        </span>
                        <span className={styles.topRoomBookings}>
                          {room.bookings} đặt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Revenue by Hotel Bar Chart */}
      <div className={styles.chartsRow}>
        {/* Revenue by Hotel */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Doanh Thu Theo Khách Sạn</h3>
            <FontAwesomeIcon
              icon={faArrowTrendUp}
              className={styles.chartIcon}
            />
          </div>
          <div className={styles.chartContent}>
            {revenueByHotel.length > 0 ? (
              <div className={styles.barChart}>
                {revenueByHotel.map((hotel, index) => {
                  const maxRevenue = Math.max(
                    ...revenueByHotel.map((h) => h.revenue)
                  );
                  const percentage = (hotel.revenue / maxRevenue) * 100;
                  const colors = [
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  ];

                  return (
                    <div key={hotel.hotelId} className={styles.barItem}>
                      <div className={styles.barInfo}>
                        <span className={styles.barLabel}>
                          {hotel.hotelName || `Hotel ${index + 1}`}
                        </span>
                        <span className={styles.barValue}>
                          {formatCurrency(hotel.revenue)}
                        </span>
                      </div>
                      <div className={styles.barTrack}>
                        <motion.div
                          className={styles.barFill}
                          style={{ background: colors[index % colors.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Chưa có dữ liệu doanh thu</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div className={styles.chartCard} variants={itemVariants}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Đặt Phòng Gần Đây</h3>
            <FontAwesomeIcon icon={faUsers} className={styles.chartIcon} />
          </div>
          <div className={styles.chartContent}>
            {recentBookings.length > 0 ? (
              <div className={styles.bookingsList}>
                {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    className={styles.bookingItem}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={styles.bookingIcon}>
                      <FontAwesomeIcon icon={faHotel} />
                    </div>
                    <div className={styles.bookingInfo}>
                      <h4 className={styles.bookingHotel}>
                        {booking.hotel?.name || "Hotel"}
                      </h4>
                      <p className={styles.bookingDetails}>
                        {booking.user?.username || "Guest"} •{" "}
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div className={styles.bookingPrice}>
                      {formatCurrency(booking.totalPrice)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Chưa có đặt phòng nào</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hotels Grid */}
      <motion.div className={styles.hotelsSection} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Khách Sạn Của Bạn</h3>
          <button
            className={styles.viewAllBtn}
            onClick={() => (window.location.href = "/admin/hotels")}
          >
            Xem Tất Cả
          </button>
        </div>
        <div className={styles.hotelsGrid}>
          {hotels.length > 0 ? (
            hotels.slice(0, 6).map((hotel, index) => {
              const hotelRevenue = revenueMap[hotel._id] || 0;
              const roomCount = hotel.rooms?.length || 0;

              return (
                <motion.div
                  key={hotel._id}
                  className={styles.hotelCard}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Hotel Image */}
                  <div className={styles.hotelImageWrapper}>
                    {hotel.images && hotel.images.length > 0 ? (
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className={styles.hotelImage}
                      />
                    ) : (
                      <div className={styles.hotelIconWrapper}>
                        <FontAwesomeIcon
                          icon={faHotel}
                          className={styles.hotelIcon}
                        />
                      </div>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className={styles.hotelCardContent}>
                    <h4 className={styles.hotelName}>
                      {hotel.name || `Hotel ${index + 1}`}
                    </h4>

                    {hotel.description && (
                      <p className={styles.hotelDescription}>
                        {hotel.description.length > 80
                          ? hotel.description.substring(0, 80) + "..."
                          : hotel.description}
                      </p>
                    )}

                    <p className={styles.hotelRevenue}>
                      {hotelRevenue > 0
                        ? formatCurrency(hotelRevenue)
                        : "Chưa có doanh thu"}
                    </p>

                    <div className={styles.hotelStats}>
                      <div className={styles.hotelStat}>
                        <FontAwesomeIcon icon={faHotel} />
                        <span>{roomCount} Phòng</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>Chưa có khách sạn nào</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AdminDashboard;
