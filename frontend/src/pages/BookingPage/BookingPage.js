import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faBed,
  faCalendar,
  faUsers,
  faUser,
  faEnvelope,
  faPhone,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import styles from "./BookingPage.module.scss";
import { format } from "date-fns";

const cx = classNames.bind(styles);

function BookingPage() {
  console.log("🚀 BookingPage component rendering");

  const navigate = useNavigate();
  const location = useLocation();
  const { hotel_id, room_id } = useParams();

  console.log("  Params:", { hotel_id, room_id });
  console.log("  Location:", location);

  // Check authentication from sessionStorage
  const userDataStr = sessionStorage.getItem("user");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  console.log("  User authenticated:", !!userData?.accessToken);
  console.log("  Location:", location);

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityWarning, setAvailabilityWarning] = useState(null);

  // Allow users to edit dates
  const [dates, setDates] = useState({
    checkIn: null,
    checkOut: null,
  });

  // Get booking data from navigation state
  const bookingData = location.state || {};
  const {
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
    bookingType = "night",
  } = bookingData;

  // Form data
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });

  const apiUrl =
    process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

  // Use default dates if not provided
  const defaultCheckIn = new Date().toISOString().split("T")[0];
  const defaultCheckOut = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];

  // Initialize dates on mount
  useEffect(() => {
    const initialCheckIn = checkIn || defaultCheckIn;
    const initialCheckOut = checkOut || defaultCheckOut;
    setDates({
      checkIn: initialCheckIn,
      checkOut: initialCheckOut,
    });

    // Fetch data on mount
    fetchData();
    // eslint-disable-next-line
  }, [hotel_id, room_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch hotel (which includes populated rooms)
      const hotelRes = await axios.get(`${apiUrl}/hotels/${hotel_id}`);

      const hotelData = hotelRes.data;
      setHotel(hotelData);

      // Check if rooms exist
      if (!hotelData.rooms || !Array.isArray(hotelData.rooms)) {
        throw new Error("Khách sạn này không có phòng khả dụng");
      }

      // Find the specific room from hotel's rooms array
      // Handle both populated objects and ObjectId strings
      const roomData = hotelData.rooms?.find((r) => {
        const roomIdToCompare = typeof r === "object" && r._id ? r._id : r;
        return String(roomIdToCompare) === String(room_id);
      });

      if (!roomData) {
        throw new Error(
          "Không tìm thấy phòng đã chọn. Vui lòng chọn phòng khác."
        );
      }

      // If room is just an ObjectId string, we need to fetch it separately
      if (typeof roomData === "string" || !roomData.title) {
        throw new Error(
          "Không có thông tin chi tiết phòng. Vui lòng tải lại trang và thử lại."
        );
      }

      setRoom(roomData);
    } catch (err) {
      console.error("Error fetching booking details:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải thông tin đặt phòng";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check room availability when dates change
  const checkAvailability = async () => {
    if (!room_id || !dates.checkIn || !dates.checkOut) return;

    try {
      setAvailabilityChecking(true);
      setAvailabilityWarning(null);

      const response = await axios.get(
        `${apiUrl}/booking/check/availability?roomId=${room_id}&startDate=${dates.checkIn}&endDate=${dates.checkOut}`
      );

      if (!response.data.available) {
        setAvailabilityWarning(
          "⚠️ Phòng này không khả dụng cho ngày đã chọn. Vui lòng chọn ngày khác."
        );
        toast.error("Phòng không khả dụng cho ngày đã chọn");
      } else {
        setAvailabilityWarning(null);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setAvailabilityChecking(false);
    }
  };

  // Check availability when dates change
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [dates.checkIn, dates.checkOut, room_id]);

  const calculateNights = () => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPricePerUnit = () => {
    if (!room) return 0;

    const actualBookingType = getActualBookingType();

    if (actualBookingType === "day") {
      return room.pricePerDay || room.pricePerNight;
    } else if (actualBookingType === "both") {
      const dayPrice = room.pricePerDay || 0;
      const nightPrice = room.pricePerNight || 0;
      return dayPrice + nightPrice;
    } else {
      return room.pricePerNight || 0;
    }
  };

  const getActualBookingType = () => {
    // Nếu phòng không hỗ trợ booking type được chọn, fallback về night
    if (
      !room ||
      !room.bookingTypes ||
      !room.bookingTypes.includes(bookingType)
    ) {
      return "night";
    }
    return bookingType;
  };

  const getUnitLabel = () => {
    const actualBookingType = getActualBookingType();
    if (actualBookingType === "day") return "ngày";
    if (actualBookingType === "both") return "ngày & đêm";
    return "đêm";
  };

  const getBookingTypeLabel = () => {
    const actualBookingType = getActualBookingType();
    if (actualBookingType === "day") return "Đặt theo ngày";
    if (actualBookingType === "both") return "Cả ngày & đêm";
    return "Đặt theo đêm";
  };

  const calculateTotal = () => {
    if (!room) return 0;
    const units = calculateNights();
    return getPricePerUnit() * units;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      setSubmitting(true);

      const bookingPayload = {
        roomId: room_id, // Backend expects 'roomId' not 'room'
        startDate: dates.checkIn,
        endDate: dates.checkOut,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        numberOfAdults: adults,
        numberOfChildren: children,
        specialRequests: formData.specialRequests,
        bookingType: bookingType, // "night", "day", or "both"
      };

      console.log("Submitting booking:", bookingPayload);

      const userDataStr = sessionStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      if (!token) {
        toast.error("Vui lòng đăng nhập để đặt phòng");
        navigate("/signin");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${apiUrl}/booking`,
        bookingPayload,
        config
      );

      console.log("✅ Booking response:", response.data);

      // toast.success("Đặt phòng thành công!"); // Removed: Backend sends socket notification

      // Backend returns { success, message, booking: {...} }
      const bookingId = response.data.booking?._id || response.data._id;

      if (!bookingId) {
        console.error("❌ No booking ID in response:", response.data);
        toast.error(
          "Đặt phòng thành công nhưng thiếu mã. Vui lòng kiểm tra danh sách đặt phòng."
        );
        return;
      }

      // Navigate to payment page with booking ID
      navigate(`/payment/${bookingId}`, {
        state: {
          booking: response.data.booking || response.data,
          hotel,
          room,
        },
      });
    } catch (error) {
      console.error("❌ Booking error:", error);
      console.error("   Response data:", error.response?.data);
      console.error("   Response status:", error.response?.status);
      toast.error(error.response?.data?.message || "Không thể tạo đặt phòng");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={cx("loading")}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải thông tin đặt phòng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx("error")}>
        <h2>Lỗi tải thông tin đặt phòng</h2>
        <p>{error}</p>
        <div className={cx("error-actions")}>
          <button onClick={fetchData} className={cx("retry-btn")}>
            Thử lại
          </button>
          <button onClick={() => navigate(-1)} className={cx("back-btn")}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className={cx("error")}>
        <p>Không tìm thấy thông tin đặt phòng</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  const nights = calculateNights();
  const totalPrice = calculateTotal();

  // Debug: Log booking type
  console.log("BookingPage - Requested bookingType:", bookingType);
  console.log("BookingPage - Actual bookingType:", getActualBookingType());
  console.log("BookingPage - Room bookingTypes:", room?.bookingTypes);
  console.log("BookingPage - pricePerUnit:", getPricePerUnit());
  console.log("BookingPage - unitLabel:", getUnitLabel());
  console.log("BookingPage - nights:", nights);
  console.log("BookingPage - totalPrice:", totalPrice);

  return (
    <div className={cx("booking-page")}>
      <div className={cx("container")}>
        {/* Header */}
        <div className={cx("header")}>
          <button className={cx("back-btn")} onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Quay lại</span>
          </button>
          <h1 className={cx("title")}>Hoàn tất đặt phòng</h1>
        </div>

        <div className={cx("content")}>
          {/* Left Column - Form */}
          <div className={cx("form-section")}>
            <div className={cx("section-card")}>
              <h2 className={cx("section-title")}>Ngày đặt phòng</h2>

              {/* Availability Warning */}
              {availabilityWarning && (
                <div className={cx("warning-banner")}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{availabilityWarning}</span>
                </div>
              )}

              <div className={cx("dates-row")}>
                <div className={cx("form-group")}>
                  <label>
                    Check-in Date <span className={cx("required")}>*</span>
                  </label>
                  <div className={cx("input-with-icon")}>
                    <FontAwesomeIcon icon={faCalendar} />
                    <input
                      type="date"
                      value={dates.checkIn || ""}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        const checkInDate = new Date(newCheckIn);
                        const checkOutDate = new Date(dates.checkOut);

                        // Nếu checkout <= checkin, tự động set checkout = checkin + 1 ngày
                        if (checkOutDate <= checkInDate) {
                          const nextDay = new Date(checkInDate);
                          nextDay.setDate(nextDay.getDate() + 1);
                          setDates({
                            checkIn: newCheckIn,
                            checkOut: nextDay.toISOString().split("T")[0],
                          });
                        } else {
                          setDates((prev) => ({
                            ...prev,
                            checkIn: newCheckIn,
                          }));
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  {availabilityChecking && (
                    <small className={cx("checking-text")}>
                      Checking availability...
                    </small>
                  )}
                </div>

                <div className={cx("form-group")}>
                  <label>
                    Check-out Date <span className={cx("required")}>*</span>
                  </label>
                  <div className={cx("input-with-icon")}>
                    <FontAwesomeIcon icon={faCalendar} />
                    <input
                      type="date"
                      value={dates.checkOut || ""}
                      onChange={(e) =>
                        setDates((prev) => ({
                          ...prev,
                          checkOut: e.target.value,
                        }))
                      }
                      min={(() => {
                        if (!dates.checkIn)
                          return new Date().toISOString().split("T")[0];
                        const minDate = new Date(dates.checkIn);
                        minDate.setDate(minDate.getDate() + 1);
                        return minDate.toISOString().split("T")[0];
                      })()}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cx("section-card")}>
              <h2 className={cx("section-title")}>Thông tin khách</h2>
              <form onSubmit={handleSubmit}>
                <div className={cx("form-group")}>
                  <label>
                    Họ và tên <span className={cx("required")}>*</span>
                  </label>
                  <div className={cx("input-with-icon")}>
                    <FontAwesomeIcon icon={faUser} />
                    <input
                      type="text"
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên của bạn"
                      required
                    />
                  </div>
                </div>

                <div className={cx("form-group")}>
                  <label>
                    Email <span className={cx("required")}>*</span>
                  </label>
                  <div className={cx("input-with-icon")}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input
                      type="email"
                      name="guestEmail"
                      value={formData.guestEmail}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={cx("form-group")}>
                  <label>
                    Số điện thoại <span className={cx("required")}>*</span>
                  </label>
                  <div className={cx("input-with-icon")}>
                    <FontAwesomeIcon icon={faPhone} />
                    <input
                      type="tel"
                      name="guestPhone"
                      value={formData.guestPhone}
                      onChange={handleInputChange}
                      placeholder="0123456789"
                      required
                    />
                  </div>
                </div>

                <div className={cx("form-group")}>
                  <label>Yêu cầu đặc biệt (Tùy chọn)</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Các yêu cầu hoặc ghi chú..."
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className={cx("submit-btn")}
                  disabled={submitting || !!availabilityWarning}
                  title={
                    availabilityWarning
                      ? "Phòng không còn trống cho ngày đã chọn"
                      : ""
                  }
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Đang xử lý...</span>
                    </>
                  ) : availabilityWarning ? (
                    <span>Phòng không còn trống</span>
                  ) : (
                    <span>Tiếp tục thanh toán</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className={cx("summary-section")}>
            <div className={cx("section-card")}>
              <h2 className={cx("section-title")}>Tóm tắt đặt phòng</h2>

              {/* Hotel Info */}
              <div className={cx("hotel-info")}>
                {hotel?.images && hotel.images.length > 0 && (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className={cx("hotel-image")}
                  />
                )}
                <div className={cx("hotel-details")}>
                  <h3>{hotel?.name}</h3>
                  <p className={cx("location")}>
                    <FontAwesomeIcon icon={faHotel} />
                    {hotel?.city}, {hotel?.country}
                  </p>
                </div>
              </div>

              {/* Room Info */}
              <div className={cx("info-row")}>
                <FontAwesomeIcon icon={faBed} />
                <div>
                  <strong>Phòng:</strong>
                  <p>
                    {room.roomType} - {room.title}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className={cx("info-row")}>
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <strong>Nhận phòng:</strong>
                  <p>
                    {dates.checkIn
                      ? format(new Date(dates.checkIn), "EEE, dd MMM, yyyy")
                      : "Chưa chọn"}
                  </p>
                  <strong>Trả phòng:</strong>
                  <p>
                    {dates.checkOut
                      ? format(new Date(dates.checkOut), "EEE, dd MMM, yyyy")
                      : "Chưa chọn"}
                  </p>
                  <span className={cx("nights")}>
                    {nights} {getUnitLabel()}
                  </span>
                </div>
              </div>

              {/* Booking Type */}
              {bookingType && (
                <div className={cx("info-row")}>
                  <FontAwesomeIcon icon={faBed} />
                  <div>
                    <strong>Loại đặt phòng:</strong>
                    <p>{getBookingTypeLabel()}</p>
                  </div>
                </div>
              )}

              {/* Guests */}
              <div className={cx("info-row")}>
                <FontAwesomeIcon icon={faUsers} />
                <div>
                  <strong>Khách:</strong>
                  <p>
                    {adults} người lớn
                    {children > 0 && `, ${children} trẻ em`}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className={cx("price-breakdown")}>
                <div className={cx("price-row")}>
                  <span>
                    {formatPrice(getPricePerUnit())} x {nights} {getUnitLabel()}
                  </span>
                  <span>{formatPrice(getPricePerUnit() * nights)}</span>
                </div>
                <div className={cx("price-total")}>
                  <strong>Tổng cộng</strong>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
              </div>

              <div className={cx("info-note")}>
                <p>
                  Bạn sẽ được chuyển đến trang thanh toán sau khi hoàn tất thông
                  tin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
