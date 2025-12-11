# Hướng Dẫn Cấu Hình Email Service

## 📧 Email Service đã được triển khai

Hệ thống email đã được tích hợp vào project với các tính năng:

### ✅ Các loại email được gửi tự động:

1. **Email xác nhận đặt phòng** - Sau khi tạo booking
2. **Email hóa đơn thanh toán** - Sau khi thanh toán thành công
3. **Email hủy đặt phòng** - Khi người dùng hủy booking
4. **Email đặt lại mật khẩu** - Khi yêu cầu reset password (chưa tích hợp)

---

## 🔧 Cấu Hình Email

### Bước 1: Tạo App Password cho Gmail

1. Truy cập: https://myaccount.google.com/security
2. Bật **2-Step Verification** (xác thực 2 bước)
3. Vào **App passwords** (Mật khẩu ứng dụng)
4. Chọn **Mail** và **Other device**
5. Copy mật khẩu 16 ký tự được tạo

### Bước 2: Cập nhật file `.env`

Mở file `backend/.env` và cập nhật các dòng sau:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com          # ← Thay bằng email của bạn
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx       # ← Thay bằng App Password (16 ký tự)
EMAIL_FROM=Travel Booking <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

### Bước 3: Khởi động lại Backend

```bash
cd backend
npm start
```

---

## 📝 File Templates

### Email Templates (`backend/src/utils/emailTemplates.js`)

- ✅ Booking Confirmation Email
- ✅ Payment Receipt Email
- ✅ Booking Cancellation Email
- ✅ Password Reset Email

### Email Service (`backend/src/utils/emailService.js`)

- ✅ `sendBookingConfirmation(bookingData)`
- ✅ `sendPaymentReceipt(paymentData)`
- ✅ `sendBookingCancellation(bookingData, refundAmount)`
- ✅ `sendPasswordReset(userData, resetToken)`

---

## 🧪 Test Email

### Test 1: Test kết nối email server

Tạo file `backend/src/testEmail.js`:

```javascript
const { testEmailConnection } = require("./utils/emailService");

async function test() {
  console.log("Testing email connection...");
  const result = await testEmailConnection();
  console.log("Result:", result ? "SUCCESS ✅" : "FAILED ❌");
}

test();
```

Chạy:

```bash
node src/testEmail.js
```

### Test 2: Gửi email thử nghiệm

```javascript
const { sendEmail } = require("./utils/emailService");

async function testSendEmail() {
  const result = await sendEmail(
    "recipient@example.com",
    "Test Email",
    "<h1>Hello from Travel Booking!</h1><p>This is a test email.</p>"
  );
  console.log("Email sent:", result);
}

testSendEmail();
```

---

## 🔍 Kiểm tra Email trong Flow thực tế

### 1. Test Booking Confirmation Email

**Endpoint:** `POST /api/booking`

**Request:**

```json
{
  "roomId": "your-room-id",
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "guestName": "Nguyễn Văn A",
  "guestPhone": "0123456789",
  "guestEmail": "test@example.com",
  "numberOfAdults": 2,
  "numberOfChildren": 0
}
```

**Kết quả:** Email xác nhận booking sẽ được gửi đến `test@example.com`

---

### 2. Test Payment Receipt Email

**Flow:**

1. Tạo booking (nhận email xác nhận)
2. Thanh toán qua MoMo
3. Sau khi payment callback thành công → Nhận email hóa đơn

---

### 3. Test Cancellation Email

**Endpoint:** `PUT /api/booking/:bookingId/cancel`

**Request:**

```json
{
  "cancellationReason": "Thay đổi kế hoạch"
}
```

**Kết quả:** Email thông báo hủy booking sẽ được gửi

---

## 🐛 Troubleshooting

### Lỗi: "Invalid login"

- **Nguyên nhân:** Email hoặc App Password sai
- **Giải pháp:** Kiểm tra lại EMAIL_USER và EMAIL_PASSWORD trong .env

### Lỗi: "Connection timeout"

- **Nguyên nhân:** Firewall hoặc antivirus chặn port 587
- **Giải pháp:** Thử đổi EMAIL_PORT=465 và thêm `secure: true`

### Email không được gửi

- **Kiểm tra console:** Xem log "✅ Email sent successfully" hoặc "❌ Error sending email"
- **Kiểm tra spam folder:** Email có thể rơi vào thư mục spam
- **Kiểm tra Gmail settings:** Đảm bảo "Less secure app access" hoặc App Password đã được bật

### Email gửi chậm

- Đây là bình thường vì email được gửi async (không chặn response)
- Email thường đến trong vòng 5-30 giây

---

## 📊 Log Monitoring

Email service sẽ log các thông tin:

```
✅ Email sent successfully: <message-id>
❌ Error sending email: <error-message>
📝 MoMo Payment Request: {...}
💰 Payment successful for booking 12345
```

---

## 🚀 Production Deployment

### Khuyến nghị cho Production:

1. **Sử dụng dịch vụ email chuyên nghiệp:**

   - SendGrid (100 emails/day miễn phí)
   - AWS SES (rất rẻ và đáng tin cậy)
   - Mailgun
   - Postmark

2. **Cập nhật .env cho production:**

```env
# SendGrid Example
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Travel Booking <noreply@yourdomain.com>
```

3. **Thêm email queue (optional):**
   - Sử dụng Bull + Redis để queue emails
   - Tránh block API response khi gửi email

---

## ✨ Email Template Preview

### 1. Booking Confirmation

- Header: Gradient purple background
- Thông tin: Mã booking, khách sạn, phòng, ngày check-in/out
- Tổng tiền: Highlighted với background màu
- Footer: Company info

### 2. Payment Receipt

- Header: Success theme (green)
- Payment ID, Payment method, Amount
- Invoice-style layout

### 3. Cancellation

- Header: Red/orange theme
- Cancellation date, Refund amount (if applicable)
- Policy information

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Console logs trong terminal
2. Email server connection test
3. .env configuration
4. Gmail security settings

---

**Chúc bạn triển khai thành công! 🎉**
