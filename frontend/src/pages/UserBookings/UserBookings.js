import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faUser,
  faUsers,
  faHotel,
  faBed,
  faDollarSign,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEye,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import styles from "./UserBookings.module.scss";
import { format } from "date-fns";

const cx = classNames.bind(styles);

function UserBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, cancelled
  const [cancellingId, setCancellingId] = useState(null);

  const apiUrl =
    process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Get token from sessionStorage
      const userDataStr = sessionStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      if (!token) {
        toast.error("Vui lòng đăng nhập để xem đặt phòng");
        navigate("/signin");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${apiUrl}/booking`, config);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
      return;
    }

    try {
      setCancellingId(bookingId);

      const userDataStr = sessionStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`${apiUrl}/booking/${bookingId}/cancel`, {}, config);

      toast.success("Hủy đặt phòng thành công");
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || "Không thể hủy đặt phòng");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return faCheckCircle;
      case "cancelled":
        return faTimesCircle;
      case "pending":
        return faClock;
      default:
        return faClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "cancelled":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "info";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const formatDate = (date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  const canCancel = (booking) => {
    if (booking.status === "cancelled" || booking.status === "completed") {
      return false;
    }
    // Check if cancellable until date has passed
    if (booking.cancellableUntil) {
      return new Date(booking.cancellableUntil) > new Date();
    }
    return true;
  };

  if (loading) {
    return (
      <div className={cx("loading")}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải danh sách đặt phòng...</p>
      </div>
    );
  }

  return (
    <div className={cx("user-bookings")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <h1>Đặt phòng của tôi</h1>
          <p>Xem và quản lý các đặt phòng khách sạn</p>
        </div>

        {/* Filters */}
        <div className={cx("filters")}>
          <button
            className={cx("filter-btn", { active: filter === "all" })}
            onClick={() => setFilter("all")}
          >
            Tất cả ({bookings.length})
          </button>
          <button
            className={cx("filter-btn", { active: filter === "pending" })}
            onClick={() => setFilter("pending")}
          >
            Đang chờ ({bookings.filter((b) => b.status === "pending").length})
          </button>
          <button
            className={cx("filter-btn", { active: filter === "confirmed" })}
            onClick={() => setFilter("confirmed")}
          >
            Đã xác nhận (
            {bookings.filter((b) => b.status === "confirmed").length})
          </button>
          <button
            className={cx("filter-btn", { active: filter === "cancelled" })}
            onClick={() => setFilter("cancelled")}
          >
            Đã hủy ({bookings.filter((b) => b.status === "cancelled").length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className={cx("empty-state")}>
            <FontAwesomeIcon icon={faHotel} size="4x" />
            <h3>Không tìm thấy đặt phòng</h3>
            <p>
              {filter === "all"
                ? "Bạn chưa có đặt phòng nào"
                : `Không có đặt phòng ${
                    filter === "pending"
                      ? "đang chờ"
                      : filter === "confirmed"
                      ? "đã xác nhận"
                      : "đã hủy"
                  }`}
            </p>
            <button onClick={() => navigate("/hotels")}>
              Khám phá khách sạn
            </button>
          </div>
        ) : (
          <div className={cx("bookings-list")}>
            {filteredBookings.map((booking) => (
              <div key={booking._id} className={cx("booking-card")}>
                <div className={cx("booking-header")}>
                  <div className={cx("hotel-info")}>
                    {booking.room?.hotel?.images?.[0] && (
                      <img
                        src={booking.room.hotel.images[0]}
                        alt={booking.room.hotel.name}
                        className={cx("hotel-image")}
                      />
                    )}
                    <div>
                      <h3>{booking.room?.hotel?.name || "Hotel"}</h3>
                      <p className={cx("location")}>
                        {booking.room?.hotel?.city},{" "}
                        {booking.room?.hotel?.country}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cx(
                      "status-badge",
                      getStatusColor(booking.status)
                    )}
                  >
                    <FontAwesomeIcon icon={getStatusIcon(booking.status)} />
                    <span>{booking.status}</span>
                  </div>
                </div>

                <div className={cx("booking-details")}>
                  <div className={cx("detail-row")}>
                    <div className={cx("detail-item")}>
                      <FontAwesomeIcon icon={faBed} />
                      <div>
                        <label>Phòng</label>
                        <span>{booking.room?.title || "N/A"}</span>
                      </div>
                    </div>
                    <div className={cx("detail-item")}>
                      <FontAwesomeIcon icon={faCalendar} />
                      <div>
                        <label>Nhận phòng</label>
                        <span>{formatDate(booking.startDate)}</span>
                      </div>
                    </div>
                    <div className={cx("detail-item")}>
                      <FontAwesomeIcon icon={faCalendar} />
                      <div>
                        <label>Trả phòng</label>
                        <span>{formatDate(booking.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={cx("detail-row")}>
                    <div className={cx("detail-item")}>
                      <FontAwesomeIcon icon={faUser} />
                      <div>
                        <label>Tên khách</label>
                        <span>{booking.guestName}</span>
                      </div>
                    </div>
                    <div className={cx("detail-item")}>
                      <FontAwesomeIcon icon={faUsers} />
                      <div>
                        <label>Khách</label>
                        <span>
                          {booking.numberOfAdults} Người lớn
                          {booking.numberOfChildren > 0 &&
                            `, ${booking.numberOfChildren} Trẻ em`}
                        </span>
                      </div>
                    </div>
                    <div className={cx("detail-item")}>
                      <FontAwesomeIcon icon={faDollarSign} />
                      <div>
                        <label>Tổng giá</label>
                        <span className={cx("price")}>
                          {formatPrice(booking.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cx("booking-actions")}>
                  <button
                    className={cx("action-btn", "view")}
                    onClick={() => navigate(`/payment/${booking._id}`)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>Xem chi tiết</span>
                  </button>
                  {canCancel(booking) && (
                    <button
                      className={cx("action-btn", "cancel")}
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Đang hủy...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faBan} />
                          <span>Hủy đặt phòng</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBookings;
