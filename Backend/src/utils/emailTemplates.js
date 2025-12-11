// Email Templates with Vietnamese content

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Base email template
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Booking</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
        }
        .content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #333;
        }
        .info-value {
            color: #666;
            text-align: right;
        }
        .total-row {
            background-color: #667eea;
            color: #ffffff;
            padding: 15px 20px;
            margin: 20px -20px -20px -20px;
            border-radius: 0 0 4px 4px;
        }
        .total-row .info-label,
        .total-row .info-value {
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .footer p {
            margin: 5px 0;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
            }
            .content {
                padding: 20px 15px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                text-align: left;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>
`;

// 1. Booking Confirmation Email
const bookingConfirmationEmail = (data) => {
  const {
    guestName,
    bookingId,
    hotelName,
    roomTitle,
    checkIn,
    checkOut,
    totalPrice,
    guestEmail,
    guestPhone,
    paymentStatus,
  } = data;

  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  const content = `
    <div class="container">
        <div class="header">
            <h1>🎉 Đặt Phòng Thành Công!</h1>
            <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi</p>
        </div>
        <div class="content">
            <h2>Xin chào ${guestName},</h2>
            <p>Chúng tôi xác nhận đã nhận được đơn đặt phòng của bạn. Dưới đây là thông tin chi tiết:</p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Mã đặt phòng:</span>
                    <span class="info-value">#${bookingId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Khách sạn:</span>
                    <span class="info-value">${hotelName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Loại phòng:</span>
                    <span class="info-value">${roomTitle}</span>
                </div>
                <div class="divider"></div>
                <div class="info-row">
                    <span class="info-label">Nhận phòng:</span>
                    <span class="info-value">${formatDate(checkIn)} - 14:00</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trả phòng:</span>
                    <span class="info-value">${formatDate(checkOut)} - 12:00</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Số đêm:</span>
                    <span class="info-value">${nights} đêm</span>
                </div>
                <div class="divider"></div>
                <div class="info-row">
                    <span class="info-label">Họ tên:</span>
                    <span class="info-value">${guestName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${guestEmail}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Số điện thoại:</span>
                    <span class="info-value">${guestPhone}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Trạng thái thanh toán:</span>
                    <span class="info-value">${
                      paymentStatus === "completed"
                        ? "✅ Đã thanh toán"
                        : "⏳ Chờ thanh toán"
                    }</span>
                </div>
                <div class="total-row">
                    <div class="info-row" style="border: none;">
                        <span class="info-label">Tổng tiền:</span>
                        <span class="info-value">${formatCurrency(
                          totalPrice
                        )}</span>
                    </div>
                </div>
            </div>

            ${
              paymentStatus === "pending"
                ? `
            <p style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Lưu ý:</strong> Vui lòng hoàn tất thanh toán để xác nhận đặt phòng của bạn.
            </p>
            `
                : ""
            }

            <div class="divider"></div>
            
            <h3 style="color: #333; margin-top: 30px;">Chính sách:</h3>
            <ul style="color: #666; line-height: 1.8; margin-left: 20px;">
                <li>Nhận phòng: 14:00 | Trả phòng: 12:00</li>
                <li>Vui lòng mang theo CMND/CCCD khi nhận phòng</li>
                <li>Hủy phòng miễn phí trước 24 giờ</li>
                <li>Liên hệ trực tiếp với khách sạn nếu cần hỗ trợ</li>
            </ul>

            <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline hỗ trợ.</p>
            
            <p style="margin-top: 20px;">
                <strong>Chúc bạn có một kỳ nghỉ tuyệt vời!</strong><br>
                Đội ngũ Travel Booking
            </p>
        </div>
        <div class="footer">
            <p>© 2024 Travel Booking. Tất cả quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
    `;

  return baseTemplate(content);
};

// 2. Payment Receipt Email
const paymentReceiptEmail = (data) => {
  const {
    guestName,
    bookingId,
    paymentId,
    hotelName,
    roomTitle,
    totalPrice,
    paymentMethod,
    paymentDate,
  } = data;

  const content = `
    <div class="container">
        <div class="header">
            <h1>✅ Thanh Toán Thành Công</h1>
            <p>Hóa đơn điện tử của bạn</p>
        </div>
        <div class="content">
            <h2>Xin chào ${guestName},</h2>
            <p>Chúng tôi đã nhận được thanh toán của bạn. Dưới đây là hóa đơn chi tiết:</p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Mã thanh toán:</span>
                    <span class="info-value">#${paymentId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mã đặt phòng:</span>
                    <span class="info-value">#${bookingId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày thanh toán:</span>
                    <span class="info-value">${formatDate(
                      paymentDate
                    )} - ${formatTime(paymentDate)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phương thức:</span>
                    <span class="info-value">${
                      paymentMethod === "momo"
                        ? "MoMo"
                        : paymentMethod === "vnpay"
                          ? "VNPay"
                          : "Tiền mặt"
                    }</span>
                </div>
                <div class="divider"></div>
                <div class="info-row">
                    <span class="info-label">Khách sạn:</span>
                    <span class="info-value">${hotelName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Loại phòng:</span>
                    <span class="info-value">${roomTitle}</span>
                </div>
                <div class="total-row">
                    <div class="info-row" style="border: none;">
                        <span class="info-label">Tổng đã thanh toán:</span>
                        <span class="info-value">${formatCurrency(
                          totalPrice
                        )}</span>
                    </div>
                </div>
            </div>

            <p style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin-top: 20px;">
                <strong>✅ Đặt phòng của bạn đã được xác nhận!</strong><br>
                Bạn có thể in email này làm biên lai thanh toán.
            </p>

            <div class="divider"></div>

            <p style="margin-top: 20px;">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!<br>
                <strong>Đội ngũ Travel Booking</strong>
            </p>
        </div>
        <div class="footer">
            <p>© 2024 Travel Booking. Tất cả quyền được bảo lưu.</p>
            <p>Hóa đơn điện tử - Không cần chữ ký</p>
        </div>
    </div>
    `;

  return baseTemplate(content);
};

// 3. Booking Cancellation Email
const bookingCancellationEmail = (data) => {
  const {
    guestName,
    bookingId,
    hotelName,
    roomTitle,
    checkIn,
    checkOut,
    refundAmount,
    cancellationDate,
  } = data;

  const content = `
    <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
            <h1>🚫 Đặt Phòng Đã Hủy</h1>
            <p>Thông báo hủy đặt phòng</p>
        </div>
        <div class="content">
            <h2>Xin chào ${guestName},</h2>
            <p>Chúng tôi xác nhận đã hủy đặt phòng của bạn theo yêu cầu.</p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Mã đặt phòng:</span>
                    <span class="info-value">#${bookingId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày hủy:</span>
                    <span class="info-value">${formatDate(
                      cancellationDate
                    )} - ${formatTime(cancellationDate)}</span>
                </div>
                <div class="divider"></div>
                <div class="info-row">
                    <span class="info-label">Khách sạn:</span>
                    <span class="info-value">${hotelName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Loại phòng:</span>
                    <span class="info-value">${roomTitle}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày nhận phòng:</span>
                    <span class="info-value">${formatDate(checkIn)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày trả phòng:</span>
                    <span class="info-value">${formatDate(checkOut)}</span>
                </div>
                ${
                  refundAmount > 0
                    ? `
                <div class="total-row">
                    <div class="info-row" style="border: none;">
                        <span class="info-label">Số tiền hoàn lại:</span>
                        <span class="info-value">${formatCurrency(
                          refundAmount
                        )}</span>
                    </div>
                </div>
                `
                    : ""
                }
            </div>

            ${
              refundAmount > 0
                ? `
            <p style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin-top: 20px;">
                <strong>💰 Hoàn tiền:</strong><br>
                Số tiền ${formatCurrency(
                  refundAmount
                )} sẽ được hoàn lại vào tài khoản của bạn trong vòng 5-7 ngày làm việc.
            </p>
            `
                : `
            <p style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin-top: 20px;">
                <strong>⚠️ Lưu ý:</strong><br>
                Do vượt quá thời gian hủy miễn phí, bạn sẽ không được hoàn lại tiền.
            </p>
            `
            }

            <div class="divider"></div>

            <p style="margin-top: 20px;">
                Rất tiếc khi phải thấy bạn hủy đặt phòng. Chúng tôi hy vọng sẽ được phục vụ bạn trong những chuyến đi tiếp theo!<br><br>
                <strong>Đội ngũ Travel Booking</strong>
            </p>
        </div>
        <div class="footer">
            <p>© 2024 Travel Booking. Tất cả quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
    `;

  return baseTemplate(content);
};

// 4. Password Reset Email
const passwordResetEmail = (data) => {
  const { userName, resetLink, expiryTime } = data;

  const content = `
    <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <h1>🔐 Đặt Lại Mật Khẩu</h1>
            <p>Yêu cầu khôi phục tài khoản</p>
        </div>
        <div class="content">
            <h2>Xin chào ${userName},</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="button">Đặt Lại Mật Khẩu</a>
            </div>

            <p style="color: #999; font-size: 13px; text-align: center;">
                Link này sẽ hết hạn sau ${expiryTime} phút
            </p>

            <div class="divider"></div>

            <p style="margin-top: 20px; font-size: 13px; color: #666;">
                <strong>Mẹo bảo mật:</strong><br>
                - Không chia sẻ mật khẩu với bất kỳ ai<br>
                - Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt)<br>
                - Thay đổi mật khẩu định kỳ
            </p>

            <p style="margin-top: 20px;">
                Trân trọng,<br>
                <strong>Đội ngũ Travel Booking</strong>
            </p>
        </div>
        <div class="footer">
            <p>© 2024 Travel Booking. Tất cả quyền được bảo lưu.</p>
            <p>Nếu bạn gặp vấn đề với nút trên, copy link sau vào trình duyệt:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
        </div>
    </div>
    `;

  return baseTemplate(content);
};

module.exports = {
  bookingConfirmationEmail,
  paymentReceiptEmail,
  bookingCancellationEmail,
  passwordResetEmail,
};
