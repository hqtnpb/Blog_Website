import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faHome,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./BookingResult.module.scss";

const cx = classNames.bind(styles);

function BookingResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingId, setBookingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check URL path to determine success or failure
    const path = window.location.pathname;
    const success = path.includes("/success");
    setIsSuccess(success);

    // Get booking ID and message from query params
    const id = searchParams.get("bookingId");
    const msg = searchParams.get("message");

    setBookingId(id);
    setMessage(msg || "");
  }, [searchParams]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewBookings = () => {
    navigate("/dashboard/bookings");
  };

  return (
    <div className={cx("result-page", isSuccess ? "success" : "failed")}>
      <div className={cx("container")}>
        <div className={cx("result-card")}>
          <div className={cx("icon-container")}>
            <FontAwesomeIcon
              icon={isSuccess ? faCheckCircle : faTimesCircle}
              className={cx("result-icon", isSuccess ? "success" : "failed")}
            />
          </div>

          <h1 className={cx("title")}>
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </h1>

          <p className={cx("message")}>
            {isSuccess
              ? "Đặt phòng của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn."
              : message ||
                "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
          </p>

          {bookingId && (
            <div className={cx("booking-info")}>
              <p className={cx("booking-id")}>
                <strong>Mã đặt phòng:</strong> {bookingId}
              </p>
            </div>
          )}

          <div className={cx("actions")}>
            {isSuccess ? (
              <>
                <button
                  className={cx("btn", "btn-primary")}
                  onClick={handleViewBookings}
                >
                  <FontAwesomeIcon icon={faFileInvoice} />
                  Xem đặt phòng của tôi
                </button>
                <button
                  className={cx("btn", "btn-secondary")}
                  onClick={handleGoHome}
                >
                  <FontAwesomeIcon icon={faHome} />
                  Về trang chủ
                </button>
              </>
            ) : (
              <>
                <button
                  className={cx("btn", "btn-primary")}
                  onClick={() => navigate(-1)}
                >
                  Thử lại
                </button>
                <button
                  className={cx("btn", "btn-secondary")}
                  onClick={handleGoHome}
                >
                  <FontAwesomeIcon icon={faHome} />
                  Về trang chủ
                </button>
              </>
            )}
          </div>

          {isSuccess && (
            <div className={cx("additional-info")}>
              <p className={cx("info-text")}>
                📧 Vui lòng kiểm tra email để xem chi tiết đặt phòng
              </p>
              <p className={cx("info-text")}>
                💳 Hóa đơn thanh toán đã được gửi đến email của bạn
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingResult;
