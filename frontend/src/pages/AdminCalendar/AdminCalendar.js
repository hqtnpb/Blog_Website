import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faFilter,
  faTimes,
  faUser,
  faClock,
  faDoorOpen,
  faCheckCircle,
  faBan,
  faHotel,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import { getPartnerHotels, getCalendarBookings } from "~/common/partnerApi";
import styles from "./AdminCalendar.module.scss";

const cx = classNames.bind(styles);

function AdminCalendar() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchCalendarData();
    }
  }, [selectedHotel, currentMonth, currentYear]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getPartnerHotels();
      setHotels(data);
      if (data.length > 0) {
        setSelectedHotel(data[0]._id);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const data = await getCalendarBookings(
        selectedHotel,
        currentMonth,
        currentYear
      );
      setCalendarData(data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu lịch");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getBookingsForDay = (day) => {
    if (!calendarData || !day) return [];

    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return calendarData.bookings.filter((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      return targetDate >= start && targetDate <= end;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc200",
      confirmed: "#4caf50",
      "checked-in": "#2196f3",
      "checked-out": "#9e9e9e",
      cancelled: "#f44336",
    };
    return colors[status] || "#666";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: faClock,
      confirmed: faCheckCircle,
      "checked-in": faDoorOpen,
      "checked-out": faUser,
      cancelled: faBan,
    };
    return icons[status] || faClock;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      "checked-in": "Đã check-in",
      "checked-out": "Đã check-out",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  if (loading && !calendarData) {
    return (
      <div className={cx("loadingContainer")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loadingIcon")} />
        <p>Đang tải lịch...</p>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      {/* Header */}
      <div className={cx("header")}>
        <div>
          <h1 className={cx("title")}>Lịch Đặt Phòng</h1>
          <p className={cx("subtitle")}>
            {calendarData?.hotel.name || "Chọn khách sạn"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={cx("controls")}>
        {/* Hotel Filter */}
        <div className={cx("hotelSelect")}>
          <FontAwesomeIcon icon={faHotel} className={cx("selectIcon")} />
          <select
            value={selectedHotel || ""}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className={cx("select")}
          >
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month Navigation */}
        <div className={cx("monthNav")}>
          <button onClick={handlePrevMonth} className={cx("navBtn")}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className={cx("monthDisplay")}>
            <FontAwesomeIcon icon={faCalendar} className={cx("calendarIcon")} />
            <span className={cx("monthText")}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
          <button onClick={handleNextMonth} className={cx("navBtn")}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button onClick={handleToday} className={cx("todayBtn")}>
            Hôm nay
          </button>
        </div>
      </div>

      {/* Calendar Legend */}
      <div className={cx("legend")}>
        {["pending", "confirmed", "checked-in", "checked-out", "cancelled"].map(
          (status) => (
            <div key={status} className={cx("legendItem")}>
              <span
                className={cx("legendColor")}
                style={{ backgroundColor: getStatusColor(status) }}
              />
              <span className={cx("legendText")}>{getStatusText(status)}</span>
            </div>
          )
        )}
      </div>

      {/* Calendar Grid */}
      <div className={cx("calendar")}>
        {/* Day Names */}
        <div className={cx("dayNames")}>
          {dayNames.map((day) => (
            <div key={day} className={cx("dayName")}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={cx("daysGrid")}>
          {getDaysInMonth().map((day, index) => {
            const bookings = getBookingsForDay(day);
            const today = new Date();
            const isToday =
              day &&
              today.getDate() === day &&
              today.getMonth() === currentDate.getMonth() &&
              today.getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={index}
                className={cx("dayCell", {
                  empty: !day,
                  today: isToday,
                  hasBookings: bookings.length > 0,
                })}
              >
                {day && (
                  <>
                    <div className={cx("dayNumber")}>{day}</div>
                    {bookings.length > 0 && (
                      <div className={cx("bookingsList")}>
                        {bookings.slice(0, 3).map((booking) => (
                          <motion.div
                            key={booking._id}
                            className={cx("bookingChip")}
                            style={{
                              backgroundColor: getStatusColor(booking.status),
                            }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleBookingClick(booking)}
                          >
                            <FontAwesomeIcon
                              icon={getStatusIcon(booking.status)}
                              className={cx("chipIcon")}
                            />
                            <span className={cx("chipText")}>
                              {booking.room?.roomNumber || "N/A"}
                            </span>
                          </motion.div>
                        ))}
                        {bookings.length > 3 && (
                          <div className={cx("moreBookings")}>
                            +{bookings.length - 3} thêm
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
          <motion.div
            className={cx("modalOverlay")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookingModal(false)}
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
                  onClick={() => setShowBookingModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className={cx("modalBody")}>
                <div className={cx("bookingInfo")}>
                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Phòng:</span>
                    <span className={cx("value")}>
                      {selectedBooking.room?.roomNumber} -{" "}
                      {selectedBooking.room?.type}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Khách hàng:</span>
                    <span className={cx("value")}>
                      {selectedBooking.guestName}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Điện thoại:</span>
                    <span className={cx("value")}>
                      {selectedBooking.guestPhone}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Email:</span>
                    <span className={cx("value")}>
                      {selectedBooking.guestEmail}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Check-in:</span>
                    <span className={cx("value")}>
                      {formatDate(selectedBooking.startDate)}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Check-out:</span>
                    <span className={cx("value")}>
                      {formatDate(selectedBooking.endDate)}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Số khách:</span>
                    <span className={cx("value")}>
                      {selectedBooking.numberOfAdults} người lớn
                      {selectedBooking.numberOfChildren > 0 &&
                        `, ${selectedBooking.numberOfChildren} trẻ em`}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Tổng tiền:</span>
                    <span className={cx("value", "price")}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(selectedBooking.totalPrice)}
                    </span>
                  </div>

                  <div className={cx("infoRow")}>
                    <span className={cx("label")}>Trạng thái:</span>
                    <span
                      className={cx("value", "status")}
                      style={{ color: getStatusColor(selectedBooking.status) }}
                    >
                      <FontAwesomeIcon
                        icon={getStatusIcon(selectedBooking.status)}
                      />
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div className={cx("infoRow", "fullWidth")}>
                      <span className={cx("label")}>Yêu cầu đặc biệt:</span>
                      <p className={cx("value", "specialRequests")}>
                        {selectedBooking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={cx("modalFooter")}>
                <button
                  className={cx("closeModalBtn")}
                  onClick={() => setShowBookingModal(false)}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCalendar;
