import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faHotel,
  faUser,
  faPhone,
  faEnvelope,
  faSpinner,
  faEye,
  faTimes,
  faFilter,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import { getPartnerBookings, updateBookingStatus } from "~/common/partnerApi";
import styles from "./AdminBookings.module.scss";

const cx = classNames.bind(styles);

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getPartnerBookings();
      setBookings(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdating(true);
      await updateBookingStatus(bookingId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      await fetchBookings();
      if (selectedBooking?._id === bookingId) {
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật trạng thái");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.roomNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      cancelled: "#ef4444",
      "checked-in": "#3b82f6",
      "checked-out": "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: faClock,
      confirmed: faCheckCircle,
      cancelled: faTimesCircle,
      "checked-in": faHotel,
      "checked-out": faCheckCircle,
    };
    return icons[status] || faClock;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      "checked-in": "Đã nhận phòng",
      "checked-out": "Đã trả phòng",
    };
    return texts[status] || status;
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
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className={cx("loadingContainer")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loadingIcon")} />
        <p>Đang tải danh sách đặt phòng...</p>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      {/* Header */}
      <div className={cx("header")}>
        <div>
          <h1 className={cx("title")}>Quản Lý Đặt Phòng</h1>
          <p className={cx("subtitle")}>
            Tổng cộng: <strong>{bookings.length}</strong> đơn đặt phòng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={cx("filtersRow")}>
        {/* Search */}
        <div className={cx("searchBox")}>
          <FontAwesomeIcon icon={faSearch} className={cx("searchIcon")} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách, email, khách sạn, phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cx("searchInput")}
          />
        </div>

        {/* Status Filter */}
        <div className={cx("filterBox")}>
          <FontAwesomeIcon icon={faFilter} className={cx("filterIcon")} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cx("filterSelect")}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="checked-in">Đã nhận phòng</option>
            <option value="checked-out">Đã trả phòng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className={cx("tableContainer")}>
        <table className={cx("table")}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Khách sạn</th>
              <th>Phòng</th>
              <th>Ngày nhận</th>
              <th>Ngày trả</th>
              <th>Số đêm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className={cx("bookingId")}>
                      #{booking._id.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div className={cx("guestInfo")}>
                        <div className={cx("guestName")}>
                          <FontAwesomeIcon icon={faUser} />
                          <span>{booking.guestName}</span>
                        </div>
                        <div className={cx("guestContact")}>
                          {booking.guestEmail}
                        </div>
                      </div>
                    </td>
                    <td className={cx("hotelName")}>
                      {booking.hotel?.name || "N/A"}
                    </td>
                    <td className={cx("roomNumber")}>
                      Phòng {booking.room?.roomNumber || "N/A"}
                    </td>
                    <td>{formatDate(booking.startDate)}</td>
                    <td>{formatDate(booking.endDate)}</td>
                    <td className={cx("nights")}>
                      {calculateNights(booking.startDate, booking.endDate)} đêm
                    </td>
                    <td className={cx("totalPrice")}>
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td>
                      <span
                        className={cx("statusBadge")}
                        style={{
                          background: `${getStatusColor(booking.status)}20`,
                          color: getStatusColor(booking.status),
                        }}
                      >
                        <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                        <span>{getStatusText(booking.status)}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        className={cx("viewBtn")}
                        onClick={() => handleViewDetails(booking)}
                        title="Xem chi tiết"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className={cx("emptyState")}>
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className={cx("emptyIcon")}
                    />
                    <p>
                      {searchTerm || statusFilter !== "all"
                        ? "Không tìm thấy đơn đặt phòng nào"
                        : "Chưa có đơn đặt phòng nào"}
                    </p>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <motion.div
            className={cx("modalOverlay")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className={cx("modal")}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cx("modalHeader")}>
                <h2>Chi Tiết Đặt Phòng</h2>
                <button
                  className={cx("closeBtn")}
                  onClick={() => setShowModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className={cx("modalBody")}>
                {/* Booking Info */}
                <div className={cx("infoSection")}>
                  <h3>Thông Tin Đặt Phòng</h3>
                  <div className={cx("infoGrid")}>
                    <div className={cx("infoItem")}>
                      <label>Mã đơn:</label>
                      <span>
                        #{selectedBooking._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Ngày đặt:</label>
                      <span>{formatDate(selectedBooking.bookingDate)}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Khách sạn:</label>
                      <span>{selectedBooking.hotel?.name}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Phòng:</label>
                      <span>
                        {selectedBooking.room?.roomNumber} (
                        {selectedBooking.room?.type})
                      </span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Ngày nhận phòng:</label>
                      <span>{formatDate(selectedBooking.startDate)}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Ngày trả phòng:</label>
                      <span>{formatDate(selectedBooking.endDate)}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Số đêm:</label>
                      <span>
                        {calculateNights(
                          selectedBooking.startDate,
                          selectedBooking.endDate
                        )}{" "}
                        đêm
                      </span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>Tổng tiền:</label>
                      <span className={cx("price")}>
                        {formatCurrency(selectedBooking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guest Info */}
                <div className={cx("infoSection")}>
                  <h3>Thông Tin Khách Hàng</h3>
                  <div className={cx("infoGrid")}>
                    <div className={cx("infoItem")}>
                      <label>
                        <FontAwesomeIcon icon={faUser} /> Họ tên:
                      </label>
                      <span>{selectedBooking.guestName}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>
                        <FontAwesomeIcon icon={faPhone} /> Số điện thoại:
                      </label>
                      <span>{selectedBooking.guestPhone}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>
                        <FontAwesomeIcon icon={faEnvelope} /> Email:
                      </label>
                      <span>{selectedBooking.guestEmail}</span>
                    </div>
                    <div className={cx("infoItem")}>
                      <label>
                        <FontAwesomeIcon icon={faUsers} /> Số khách:
                      </label>
                      <span>
                        {selectedBooking.numberOfAdults} người lớn,{" "}
                        {selectedBooking.numberOfChildren} trẻ em
                      </span>
                    </div>
                  </div>
                  {selectedBooking.specialRequests && (
                    <div className={cx("specialRequests")}>
                      <label>Yêu cầu đặc biệt:</label>
                      <p>{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className={cx("infoSection")}>
                  <h3>Trạng Thái & Hành Động</h3>
                  <div className={cx("statusActions")}>
                    <div className={cx("currentStatus")}>
                      <label>Trạng thái hiện tại:</label>
                      <span
                        className={cx("statusBadge")}
                        style={{
                          background: `${getStatusColor(
                            selectedBooking.status
                          )}20`,
                          color: getStatusColor(selectedBooking.status),
                        }}
                      >
                        <FontAwesomeIcon
                          icon={getStatusIcon(selectedBooking.status)}
                        />
                        <span>{getStatusText(selectedBooking.status)}</span>
                      </span>
                    </div>

                    {selectedBooking.status !== "cancelled" && (
                      <div className={cx("actionButtons")}>
                        {selectedBooking.status === "pending" && (
                          <>
                            <button
                              className={cx("confirmBtn")}
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedBooking._id,
                                  "confirmed"
                                )
                              }
                              disabled={updating}
                            >
                              {updating ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                              ) : (
                                <FontAwesomeIcon icon={faCheckCircle} />
                              )}
                              <span>Xác nhận</span>
                            </button>
                            <button
                              className={cx("cancelBtn")}
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedBooking._id,
                                  "cancelled"
                                )
                              }
                              disabled={updating}
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                              <span>Hủy đơn</span>
                            </button>
                          </>
                        )}
                        {selectedBooking.status === "confirmed" && (
                          <button
                            className={cx("checkinBtn")}
                            onClick={() =>
                              handleUpdateStatus(
                                selectedBooking._id,
                                "checked-in"
                              )
                            }
                            disabled={updating}
                          >
                            {updating ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faHotel} />
                            )}
                            <span>Nhận phòng</span>
                          </button>
                        )}
                        {selectedBooking.status === "checked-in" && (
                          <button
                            className={cx("checkoutBtn")}
                            onClick={() =>
                              handleUpdateStatus(
                                selectedBooking._id,
                                "checked-out"
                              )
                            }
                            disabled={updating}
                          >
                            {updating ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            )}
                            <span>Trả phòng</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminBookings;
