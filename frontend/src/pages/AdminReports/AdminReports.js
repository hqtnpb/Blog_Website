import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExport,
  faSpinner,
  faCalendar,
  faFilter,
  faDownload,
  faChartLine,
  faFileInvoice,
  faHotel,
  faCheckCircle,
  faDollarSign,
  faChartBar,
  faPercentage,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import {
  getPartnerHotels,
  getDashboardStats,
  getRevenueAnalytics,
  getOccupancyRate,
  exportRevenueReport,
  exportBookingsReport,
  exportReviewsReport,
  exportOccupancyReport,
} from "~/common/partnerApi";
import styles from "./AdminReports.module.scss";

const cx = classNames.bind(styles);

function AdminReports() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Charts State
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const [filters, setFilters] = useState({
    reportType: "revenue",
    hotelId: "all",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    format: "csv",
    period: "daily",
  });

  useEffect(() => {
    fetchHotels();
    fetchDashboardStats();
    fetchChartsData();
  }, []);

  useEffect(() => {
    fetchChartsData();
  }, [filters.hotelId, filters.startDate, filters.endDate, filters.period]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getPartnerHotels();
      setHotels(data);
    } catch (error) {
      toast.error("Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Không thể tải thống kê tổng quan");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchChartsData = async () => {
    try {
      setChartsLoading(true);
      const [revenueRes, occupancyRes] = await Promise.all([
        getRevenueAnalytics({
          hotelId: filters.hotelId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          period: filters.period,
        }),
        getOccupancyRate({
          hotelId: filters.hotelId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);
      setRevenueData(revenueRes);
      // occupancyRes.data contains the full object with chartData array
      setOccupancyData(occupancyRes?.data?.chartData || []);
    } catch (error) {
      console.error("Error fetching charts data:", error);
      toast.error("Không thể tải dữ liệu biểu đồ");
    } finally {
      setChartsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    if (startDate > endDate) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    try {
      setGenerating(filters.reportType);
      let reportData;

      switch (filters.reportType) {
        case "revenue":
          reportData = await exportRevenueReport({
            hotelId: filters.hotelId,
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
          break;
        case "bookings":
          reportData = await exportBookingsReport({
            hotelId: filters.hotelId,
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
          break;
        case "reviews":
          reportData = await exportReviewsReport({
            hotelId: filters.hotelId,
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
          break;
        case "occupancy":
          reportData = await exportOccupancyReport({
            hotelId: filters.hotelId,
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
          break;
        default:
          throw new Error("Loại báo cáo không hợp lệ");
      }

      if (filters.format === "csv") {
        downloadCSV(reportData.data, getReportFileName());
      } else {
        downloadExcel(reportData.data, getReportFileName());
      }

      toast.success("Báo cáo đã được tạo thành công!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Không thể tạo báo cáo");
    } finally {
      setGenerating(null);
    }
  };

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const downloadExcel = (data, filename) => {
    downloadCSV(data, filename);
    toast.info("Excel export coming soon - Downloaded as CSV");
  };

  const getReportFileName = () => {
    const hotel =
      filters.hotelId === "all"
        ? "all-hotels"
        : hotels.find((h) => h._id === filters.hotelId)?.name || "hotel";

    const sanitizedHotel = hotel
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    const type = filters.reportType;
    const date = new Date().toISOString().split("T")[0];
    return `${type}-report-${sanitizedHotel}-${date}`;
  };

  const reportTypes = [
    {
      id: "revenue",
      name: "Báo Cáo Doanh Thu",
      icon: faChartLine,
      description: "Tổng hợp doanh thu theo thời gian",
      color: "#10b981",
    },
    {
      id: "bookings",
      name: "Báo Cáo Đặt Phòng",
      icon: faFileInvoice,
      description: "Chi tiết các đơn đặt phòng",
      color: "#3b82f6",
    },
    {
      id: "reviews",
      name: "Báo Cáo Đánh Giá",
      icon: faHotel,
      description: "Tổng hợp đánh giá khách hàng",
      color: "#f59e0b",
    },
    {
      id: "occupancy",
      name: "Báo Cáo Công Suất",
      icon: faCheckCircle,
      description: "Tỷ lệ lấp đầy phòng",
      color: "#8b5cf6",
    },
  ];

  if (loading) {
    return (
      <div className={cx("loading-container")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loading-icon")} />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={cx("reports-container")}>
      {/* Header */}
      <div className={cx("header")}>
        <div className={cx("header-left")}>
          <FontAwesomeIcon icon={faFileExport} className={cx("header-icon")} />
          <div>
            <h1 className={cx("title")}>Báo Cáo & Phân Tích</h1>
            <p className={cx("subtitle")}>
              Thống kê tổng quan và báo cáo chi tiết cho khách sạn của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={cx("stats-grid")}>
        <div className={cx("stat-card", "revenue")}>
          <div className={cx("stat-icon")}>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className={cx("stat-content")}>
            <p className={cx("stat-label")}>Tổng Doanh Thu</p>
            {statsLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <>
                <h2 className={cx("stat-value")}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(stats?.totalRevenue || 0)}
                </h2>
                <p className={cx("stat-change", "positive")}>
                  +{stats?.revenueGrowth || 0}% so với tháng trước
                </p>
              </>
            )}
          </div>
        </div>

        <div className={cx("stat-card", "bookings")}>
          <div className={cx("stat-icon")}>
            <FontAwesomeIcon icon={faChartBar} />
          </div>
          <div className={cx("stat-content")}>
            <p className={cx("stat-label")}>Tổng Đặt Phòng</p>
            {statsLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <>
                <h2 className={cx("stat-value")}>
                  {stats?.totalBookings || 0}
                </h2>
                <p className={cx("stat-change", "positive")}>
                  +{stats?.bookingGrowth || 0}% so với tháng trước
                </p>
              </>
            )}
          </div>
        </div>

        <div className={cx("stat-card", "occupancy")}>
          <div className={cx("stat-icon")}>
            <FontAwesomeIcon icon={faPercentage} />
          </div>
          <div className={cx("stat-content")}>
            <p className={cx("stat-label")}>Tỷ Lệ Lấp Đầy</p>
            {statsLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <>
                <h2 className={cx("stat-value")}>
                  {stats?.occupancyRate || 0}%
                </h2>
                <p className={cx("stat-change")}>
                  {stats?.totalRooms || 0} phòng đang hoạt động
                </p>
              </>
            )}
          </div>
        </div>

        <div className={cx("stat-card", "rating")}>
          <div className={cx("stat-icon")}>
            <FontAwesomeIcon icon={faStar} />
          </div>
          <div className={cx("stat-content")}>
            <p className={cx("stat-label")}>Đánh Giá Trung Bình</p>
            {statsLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <>
                <h2 className={cx("stat-value")}>
                  {stats?.averageRating?.toFixed(1) || 0}/5
                </h2>
                <p className={cx("stat-change")}>
                  Từ {stats?.totalReviews || 0} đánh giá
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={cx("charts-section")}>
        <div className={cx("charts-header")}>
          <h2 className={cx("section-title")}>
            <FontAwesomeIcon icon={faChartLine} />
            Phân Tích Chi Tiết
          </h2>

          <div className={cx("charts-filters")}>
            <select
              value={filters.hotelId}
              onChange={(e) => handleFilterChange("hotelId", e.target.value)}
              className={cx("filter-select")}
            >
              <option value="all">Tất cả khách sạn</option>
              {hotels.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name}
                </option>
              ))}
            </select>

            <select
              value={filters.period}
              onChange={(e) => handleFilterChange("period", e.target.value)}
              className={cx("filter-select")}
            >
              <option value="daily">Theo ngày</option>
              <option value="weekly">Theo tuần</option>
              <option value="monthly">Theo tháng</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className={cx("filter-input")}
              max={filters.endDate}
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className={cx("filter-input")}
              min={filters.startDate}
            />
          </div>
        </div>

        {chartsLoading ? (
          <div className={cx("charts-loading")}>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className={cx("loading-icon")}
            />
            <p>Đang tải dữ liệu biểu đồ...</p>
          </div>
        ) : (
          <div className={cx("charts-grid")}>
            {/* Revenue Chart */}
            <div className={cx("chart-card", "full-width")}>
              <h3 className={cx("chart-title")}>Biểu Đồ Doanh Thu</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value),
                      "Doanh thu",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Occupancy Chart */}
            <div className={cx("chart-card")}>
              <h3 className={cx("chart-title")}>Tỷ Lệ Lấp Đầy Phòng</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === "Đã đặt" ? "#10b981" : "#e5e7eb"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className={cx("export-section")}>
        <h2 className={cx("section-title")}>
          <FontAwesomeIcon icon={faDownload} />
          Xuất Báo Cáo
        </h2>

        <div className={cx("report-types-grid")}>
          {reportTypes.map((type) => (
            <div
              key={type.id}
              className={cx("report-type-card", {
                active: filters.reportType === type.id,
              })}
              onClick={() => handleFilterChange("reportType", type.id)}
            >
              <div
                className={cx("report-icon")}
                style={{ backgroundColor: type.color }}
              >
                <FontAwesomeIcon icon={type.icon} />
              </div>
              <h3 className={cx("report-name")}>{type.name}</h3>
              <p className={cx("report-description")}>{type.description}</p>
            </div>
          ))}
        </div>

        <div className={cx("export-controls")}>
          <div className={cx("format-selection")}>
            <label>Định dạng:</label>
            <select
              value={filters.format}
              onChange={(e) => handleFilterChange("format", e.target.value)}
              className={cx("filter-select")}
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <button
            onClick={handleGenerateReport}
            className={cx("export-button")}
            disabled={generating !== null}
          >
            {generating !== null ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang tạo...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faDownload} />
                Xuất Báo Cáo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
