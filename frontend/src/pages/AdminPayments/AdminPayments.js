import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faSpinner,
  faFilter,
  faSearch,
  faDownload,
  faCheckCircle,
  faHourglassHalf,
  faTimesCircle,
  faMoneyBillWave,
  faCalendar,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import styles from "./AdminPayments.module.scss";
import {
  getPaymentAnalytics,
  getPaymentHistory,
  exportPayments,
} from "../../common/partnerApi";

const cx = classNames.bind(styles);

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    paymentStatus: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsData, historyData] = await Promise.all([
        getPaymentAnalytics(),
        getPaymentHistory(currentPage, filters),
      ]);

      setAnalytics(analyticsData);
      setPayments(historyData.payments);
      setTotalPages(historyData.totalPages);
    } catch (error) {
      toast.error(error.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportData = await exportPayments(filters);

      // Convert to CSV
      if (exportData.data.length === 0) {
        toast.error("No data to export");
        return;
      }

      const headers = Object.keys(exportData.data[0]);
      const csv = [
        headers.join(","),
        ...exportData.data.map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob(["\ufeff" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `payment-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Payment report exported successfully");
    } catch (error) {
      toast.error(error.message || "Failed to export payments");
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { color: "#4caf50", icon: faCheckCircle, text: "Confirmed" },
      pending: { color: "#ff9800", icon: faHourglassHalf, text: "Pending" },
      processing: {
        color: "#2196f3",
        icon: faHourglassHalf,
        text: "Processing",
      },
      failed: { color: "#f44336", icon: faTimesCircle, text: "Failed" },
      refunded: { color: "#9e9e9e", icon: faMoneyBillWave, text: "Refunded" },
    };

    const config = statusMap[status] || statusMap.pending;
    return (
      <span
        className={cx("status-badge")}
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const getMethodBadge = (method) => {
    const methodMap = {
      momo: { color: "#d82d8b", text: "MoMo" },
      vnpay: { color: "#0066cc", text: "VNPay" },
      cash: { color: "#4caf50", text: "Cash" },
    };

    const config = methodMap[method] || {
      color: "#666",
      text: method || "N/A",
    };
    return (
      <span
        className={cx("method-badge")}
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate stats from analytics
  const getStatByStatus = (status) => {
    const stat = analytics?.byStatus?.find((s) => s._id === status);
    return {
      count: stat?.count || 0,
      amount: stat?.amount || 0,
    };
  };

  if (loading && currentPage === 1) {
    return (
      <div className={cx("loading-container")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loading-icon")} />
        <p>Đang tải dữ liệu thanh toán...</p>
      </div>
    );
  }

  return (
    <div className={cx("payments-container")}>
      {/* Header */}
      <div className={cx("header")}>
        <div className={cx("header-left")}>
          <FontAwesomeIcon icon={faCreditCard} className={cx("header-icon")} />
          <h1 className={cx("title")}>Payment Tracking</h1>
        </div>
        <button
          className={cx("export-btn")}
          onClick={handleExport}
          disabled={exporting}
        >
          <FontAwesomeIcon
            icon={exporting ? faSpinner : faFileExport}
            spin={exporting}
          />
          {exporting ? "Exporting..." : "Export Report"}
        </button>
      </div>

      {/* Stats Cards */}
      {analytics && (
        <div className={cx("stats-grid")}>
          <div className={cx("stat-card")}>
            <div
              className={cx("stat-icon")}
              style={{ backgroundColor: "#667eea15", color: "#667eea" }}
            >
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>
            <div className={cx("stat-content")}>
              <p className={cx("stat-label")}>Tổng doanh thu</p>
              <h3 className={cx("stat-value")}>
                {formatCurrency(analytics.totalAmount)}
              </h3>
              <span className={cx("stat-count")}>
                {analytics.totalPayments} thanh toán
              </span>
            </div>
          </div>

          <div className={cx("stat-card")}>
            <div
              className={cx("stat-icon")}
              style={{ backgroundColor: "#4caf5015", color: "#4caf50" }}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className={cx("stat-content")}>
              <p className={cx("stat-label")}>Đã xác nhận</p>
              <h3 className={cx("stat-value")}>
                {formatCurrency(getStatByStatus("confirmed").amount)}
              </h3>
              <span className={cx("stat-count")}>
                {getStatByStatus("confirmed").count} thanh toán
              </span>
            </div>
          </div>

          <div className={cx("stat-card")}>
            <div
              className={cx("stat-icon")}
              style={{ backgroundColor: "#ff980015", color: "#ff9800" }}
            >
              <FontAwesomeIcon icon={faHourglassHalf} />
            </div>
            <div className={cx("stat-content")}>
              <p className={cx("stat-label")}>Chờ xử lý</p>
              <h3 className={cx("stat-value")}>
                {formatCurrency(getStatByStatus("pending").amount)}
              </h3>
              <span className={cx("stat-count")}>
                {getStatByStatus("pending").count} thanh toán
              </span>
            </div>
          </div>

          <div className={cx("stat-card")}>
            <div
              className={cx("stat-icon")}
              style={{ backgroundColor: "#f4433615", color: "#f44336" }}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <div className={cx("stat-content")}>
              <p className={cx("stat-label")}>Thất bại</p>
              <h3 className={cx("stat-value")}>
                {formatCurrency(getStatByStatus("failed").amount)}
              </h3>
              <span className={cx("stat-count")}>
                {getStatByStatus("failed").count} thanh toán
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={cx("filters-bar")}>
        <form onSubmit={handleSearch} className={cx("search-form")}>
          <div className={cx("search-input-group")}>
            <FontAwesomeIcon icon={faSearch} className={cx("search-icon")} />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID thanh toán, tên khách, email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className={cx("search-input")}
            />
          </div>
        </form>

        <div className={cx("filter-group")}>
          <FontAwesomeIcon icon={faFilter} className={cx("filter-icon")} />

          <select
            value={filters.paymentStatus}
            onChange={(e) =>
              handleFilterChange("paymentStatus", e.target.value)
            }
            className={cx("filter-select")}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>

          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              handleFilterChange("paymentMethod", e.target.value)
            }
            className={cx("filter-select")}
          >
            <option value="">Tất cả phương thức</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
            <option value="cash">Tiền mặt</option>
          </select>

          <div className={cx("date-filter")}>
            <FontAwesomeIcon icon={faCalendar} className={cx("date-icon")} />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className={cx("date-input")}
              placeholder="Start Date"
            />
            <span className={cx("date-separator")}>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className={cx("date-input")}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className={cx("table-container")}>
        <table className={cx("payments-table")}>
          <thead>
            <tr>
              <th>Mã thanh toán</th>
              <th>Thông tin khách</th>
              <th>Khách sạn & Phòng</th>
              <th>Ngày đặt</th>
              <th>Nhận/Trả phòng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <span className={cx("payment-id")}>
                      {payment.paymentId || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className={cx("guest-info")}>
                      <p className={cx("guest-name")}>{payment.guestName}</p>
                      <p className={cx("guest-email")}>{payment.guestEmail}</p>
                    </div>
                  </td>
                  <td>
                    <div className={cx("hotel-info")}>
                      <p className={cx("hotel-name")}>{payment.hotel?.name}</p>
                      <p className={cx("room-info")}>
                        {payment.room?.roomNumber} - {payment.room?.roomType}
                      </p>
                    </div>
                  </td>
                  <td>{formatDate(payment.bookingDate)}</td>
                  <td>
                    <div className={cx("date-range")}>
                      <span>{formatDate(payment.startDate)}</span>
                      <span className={cx("date-separator")}>→</span>
                      <span>{formatDate(payment.endDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cx("amount")}>
                      {formatCurrency(payment.totalPrice)}
                    </span>
                  </td>
                  <td>{getMethodBadge(payment.paymentMethod)}</td>
                  <td>{getStatusBadge(payment.paymentStatus)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={cx("empty-state")}>
                  <p>No payment records found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
