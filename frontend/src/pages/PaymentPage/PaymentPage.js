import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSpinner,
  faDownload,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import styles from "./PaymentPage.module.scss";
import { format } from "date-fns";

const cx = classNames.bind(styles);

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking_id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success, failed
  const [processingPayment, setProcessingPayment] = useState(false);

  const apiUrl =
    process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

  // Get data from navigation state
  const stateData = location.state || {};
  const { hotel, room } = stateData;

  useEffect(() => {
    // Check if redirected from MoMo
    const urlParams = new URLSearchParams(window.location.search);
    const resultCode = urlParams.get("resultCode");

    if (resultCode) {
      handlePaymentReturn(resultCode);
    } else {
      fetchBooking();
    }
    // eslint-disable-next-line
  }, [booking_id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);

      // Get token from sessionStorage (matching login implementation)
      const userDataStr = sessionStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      if (!token) {
        toast.error("Please login to view booking");
        navigate("/signin");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${apiUrl}/booking/${booking_id}`,
        config
      );
      setBooking(response.data);
      setPaymentStatus(response.data.paymentStatus || "pending");
    } catch (error) {
      console.error("Failed to load booking:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReturn = async (resultCode) => {
    if (resultCode === "0") {
      setPaymentStatus("success");
      toast.success("Payment successful!");
      await fetchBooking();
    } else {
      setPaymentStatus("failed");
      toast.error("Payment failed. Please try again.");
      await fetchBooking();
    }
  };

  const handleMoMoPayment = async () => {
    try {
      console.log("🔍 [MoMo] Starting payment process...");
      console.log("🔍 [MoMo] Booking ID:", booking_id);
      console.log("🔍 [MoMo] API URL:", apiUrl);

      setProcessingPayment(true);

      // Get token from sessionStorage (matching login implementation)
      const userDataStr = sessionStorage.getItem("user");
      console.log(
        "🔍 [MoMo] User data from session:",
        userDataStr ? "Found" : "Not found"
      );

      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      console.log("🔍 [MoMo] Token:", token ? "Present" : "Missing");

      if (!token) {
        console.error("❌ [MoMo] No token found - redirecting to login");
        toast.error("Vui lòng đăng nhập để thanh toán");
        navigate("/signin");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        bookingId: booking_id,
        amount: booking.totalPrice,
        orderInfo: `Payment for booking #${booking_id}`,
      };

      console.log("🔍 [MoMo] Payload:", payload);
      console.log("🔍 [MoMo] Calling API:", `${apiUrl}/payment/momo/create`);

      const response = await axios.post(
        `${apiUrl}/payment/momo/create`,
        payload,
        config
      );

      console.log("✅ [MoMo] API Response:", response.data);

      // Redirect to MoMo payment URL
      if (response.data.paymentUrl) {
        console.log("✅ [MoMo] Redirecting to:", response.data.paymentUrl);
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error) {
      console.error("❌ [MoMo] Payment error:", error);
      console.error("❌ [MoMo] Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Tạo thanh toán thất bại");
      setProcessingPayment(false);
    }
  };

  const handleVNPayPayment = async () => {
    try {
      console.log("🔍 [VNPay] Starting payment process...");
      console.log("🔍 [VNPay] Booking ID:", booking_id);

      setProcessingPayment(true);

      // Get token from sessionStorage
      const userDataStr = sessionStorage.getItem("user");
      console.log("🔍 [VNPay] User data:", userDataStr ? "Found" : "Not found");

      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      console.log("🔍 [VNPay] Token:", token ? "Present" : "Missing");

      if (!token) {
        console.error("❌ [VNPay] No token - redirecting to login");
        toast.error("Vui lòng đăng nhập để thanh toán");
        navigate("/signin");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        bookingId: booking_id,
      };

      console.log("🔍 [VNPay] Calling API...");

      const response = await axios.post(
        `${apiUrl}/payment/vnpay/create`,
        payload,
        config
      );

      console.log("✅ [VNPay] Response:", response.data);

      // Redirect to VNPay payment URL
      if (response.data.paymentUrl) {
        console.log("✅ [VNPay] Redirecting...");
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error) {
      console.error("❌ [VNPay] Error:", error);
      console.error("❌ [VNPay] Error data:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Tạo thanh toán VNPay thất bại"
      );
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  const handleDownloadReceipt = () => {
    toast.success("Receipt download feature coming soon!");
  };

  if (loading) {
    return (
      <div className={cx("loading")}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={cx("error")}>
        <FontAwesomeIcon icon={faTimesCircle} size="4x" color="#ff5b26" />
        <h2>Không tìm thấy đặt phòng</h2>
        <button onClick={() => navigate("/")} className={cx("home-btn")}>
          <FontAwesomeIcon icon={faHome} />
          Về trang chủ
        </button>
      </div>
    );
  }

  // Payment Success View
  if (paymentStatus === "success") {
    return (
      <div className={cx("payment-page")}>
        <div className={cx("container")}>
          <div className={cx("success-card")}>
            <div className={cx("success-icon")}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h1>Thanh toán thành công!</h1>
            <p className={cx("success-message")}>
              Đặt phòng của bạn đã được xác nhận. Email xác nhận đã được gửi đến{" "}
              {booking.guestEmail}
            </p>

            <div className={cx("booking-details")}>
              <h2>Chi tiết đặt phòng</h2>
              <div className={cx("detail-row")}>
                <span>Mã đặt phòng:</span>
                <strong>{booking._id}</strong>
              </div>
              <div className={cx("detail-row")}>
                <span>Khách sạn:</span>
                <strong>{hotel?.name || booking.hotel?.name}</strong>
              </div>
              <div className={cx("detail-row")}>
                <span>Phòng:</span>
                <strong>
                  {room?.title ||
                    `${booking.room?.roomType} - ${booking.room?.title}`}
                </strong>
              </div>
              <div className={cx("detail-row")}>
                <span>Nhận phòng:</span>
                <strong>
                  {format(new Date(booking.startDate), "EEE, dd MMM, yyyy")}
                </strong>
              </div>
              <div className={cx("detail-row")}>
                <span>Trả phòng:</span>
                <strong>
                  {format(new Date(booking.endDate), "EEE, dd MMM, yyyy")}
                </strong>
              </div>
              <div className={cx("detail-row", "total")}>
                <span>Tổng tiền đã thanh toán:</span>
                <strong>{formatPrice(booking.totalPrice)}</strong>
              </div>
            </div>

            <div className={cx("actions")}>
              <button
                onClick={handleDownloadReceipt}
                className={cx("download-btn")}
              >
                <FontAwesomeIcon icon={faDownload} />
                Tải hóa đơn
              </button>
              <button
                onClick={() => navigate("/dashboard/bookings")}
                className={cx("bookings-btn")}
              >
                Xem đặt phòng của tôi
              </button>
              <button onClick={() => navigate("/")} className={cx("home-btn")}>
                <FontAwesomeIcon icon={faHome} />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Failed View
  if (paymentStatus === "failed") {
    return (
      <div className={cx("payment-page")}>
        <div className={cx("container")}>
          <div className={cx("failed-card")}>
            <div className={cx("failed-icon")}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <h1>Thanh toán thất bại</h1>
            <p className={cx("failed-message")}>
              Rất tiếc, thanh toán của bạn không thể được xử lý. Vui lòng thử
              lại.
            </p>

            <div className={cx("booking-summary")}>
              <h3>Tóm tắt đặt phòng</h3>
              <p>
                <strong>Số tiền:</strong> {formatPrice(booking.totalPrice)}
              </p>
              <p>
                <strong>Trạng thái:</strong> Chờ thanh toán
              </p>
            </div>

            <div className={cx("actions")}>
              <button
                onClick={handleMoMoPayment}
                className={cx("retry-btn")}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Đang xử lý...
                  </>
                ) : (
                  "Thử lại"
                )}
              </button>
              <button
                onClick={() => navigate("/")}
                className={cx("cancel-btn")}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending Payment View (Select Payment Method)
  return (
    <div className={cx("payment-page")}>
      <div className={cx("container")}>
        <div className={cx("payment-card")}>
          <div className={cx("pending-icon")}>
            <FontAwesomeIcon icon={faClock} />
          </div>
          <h1>Hoàn tất thanh toán</h1>
          <p className={cx("info-message")}>
            Chọn phương thức thanh toán để hoàn tất đặt phòng
          </p>

          <div className={cx("booking-summary")}>
            <h2>Tóm tắt đặt phòng</h2>
            <div className={cx("summary-row")}>
              <span>Khách sạn:</span>
              <strong>{hotel?.name || booking.hotel?.name}</strong>
            </div>
            <div className={cx("summary-row")}>
              <span>Phòng:</span>
              <strong>
                {room?.title ||
                  `${booking.room?.roomType} - ${booking.room?.title}`}
              </strong>
            </div>
            <div className={cx("summary-row")}>
              <span>Ngày:</span>
              <strong>
                {format(new Date(booking.startDate), "dd/MM")} -{" "}
                {format(new Date(booking.endDate), "dd/MM/yyyy")}
              </strong>
            </div>
            <div className={cx("summary-row", "total")}>
              <span>Tổng tiền:</span>
              <strong>{formatPrice(booking.totalPrice)}</strong>
            </div>
          </div>

          <div className={cx("payment-methods")}>
            <h3>Phương thức thanh toán</h3>

            {/* MoMo Payment */}
            <div className={cx("payment-option")}>
              <button
                onClick={handleMoMoPayment}
                className={cx("momo-btn")}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <img
                      src="https://developers.momo.vn/v3/vi/img/logo.svg"
                      alt="MoMo"
                      style={{ height: "24px", marginRight: "10px" }}
                    />
                    Thanh toán bằng MoMo
                  </>
                )}
              </button>
            </div>

            {/* VNPay Payment */}
            <div className={cx("payment-option")}>
              <button
                onClick={handleVNPayPayment}
                className={cx("vnpay-btn")}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <img
                      src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg"
                      alt="VNPay"
                      style={{ height: "24px", marginRight: "10px" }}
                    />
                    Thanh toán bằng VNPay
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={cx("security-note")}>
            <p>🔒 Thanh toán của bạn được bảo mật và mã hóa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
