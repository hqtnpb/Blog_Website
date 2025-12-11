# 📧 Email Notification System - Implementation Complete

## ✅ Tổng Quan

Hệ thống email notification đã được triển khai **hoàn chỉnh** với đầy đủ các tính năng:

### 🎯 Các tính năng đã triển khai:

1. ✅ **Email Confirmation** - Xác nhận đặt phòng
2. ✅ **Payment Receipt** - Hóa đơn thanh toán
3. ✅ **Cancellation Notice** - Thông báo hủy phòng
4. ✅ **Password Reset** - Đặt lại mật khẩu (template có sẵn, chưa tích hợp vào authController)

---

## 📁 Cấu Trúc File

```
backend/
├── src/
│   ├── utils/
│   │   ├── emailService.js       # Email sending functions
│   │   └── emailTemplates.js     # HTML email templates
│   ├── controllers/
│   │   ├── bookingController.js  # ✅ Đã tích hợp email
│   │   └── paymentController.js  # ✅ Đã tích hợp email
│   └── testEmail.js              # Test file
├── .env                          # Email configuration
└── EMAIL_SETUP.md               # Hướng dẫn chi tiết
```

---

## 🚀 Cách Sử Dụng

### Bước 1: Cấu hình Email

Mở file `backend/.env` và thêm:

```env
# Email Configuration (Thêm vào cuối file)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-16-chars
EMAIL_FROM=Travel Booking <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

**Lấy App Password từ Gmail:**

1. https://myaccount.google.com/security
2. Bật **2-Step Verification**
3. Tạo **App Password** cho Mail
4. Copy mật khẩu 16 ký tự

### Bước 2: Test Email

```bash
cd backend
node src/testEmail.js
```

**Kết quả mong đợi:**

```
🚀 Starting Email Service Tests...

📡 Test 1: Testing email server connection...
✅ Email server connection successful!

📧 Test 2: Sending simple test email...
✅ Simple test email sent successfully!

📧 Test 3: Sending booking confirmation email...
✅ Booking confirmation email sent!

📧 Test 4: Sending payment receipt email...
✅ Payment receipt email sent!

📧 Test 5: Sending booking cancellation email...
✅ Cancellation email sent!

📊 TEST SUMMARY
Connection Test:        ✅ PASS
Simple Email:          ✅ PASS
Booking Confirmation:  ✅ PASS
Payment Receipt:       ✅ PASS
Cancellation Email:    ✅ PASS

📬 Kiểm tra hộp thư của bạn: your-email@gmail.com
```

### Bước 3: Khởi động Backend

```bash
npm start
```

---

## 🔄 Email Flow

### 1️⃣ Khi tạo Booking

**API:** `POST /api/booking`

```
User tạo booking
    ↓
Backend lưu vào database
    ↓
✉️ Gửi email xác nhận booking
    ↓
Response trả về user
```

**Email gồm:**

- Mã đặt phòng
- Thông tin khách sạn & phòng
- Ngày nhận/trả phòng
- Tổng tiền
- Trạng thái thanh toán

### 2️⃣ Khi thanh toán thành công

**API:** `POST /api/payment/momo/callback`

```
User thanh toán qua MoMo
    ↓
MoMo callback về backend
    ↓
Cập nhật booking status
    ↓
✉️ Gửi email hóa đơn thanh toán
    ↓
Response success
```

**Email gồm:**

- Mã thanh toán
- Phương thức thanh toán (MoMo/VNPay)
- Hóa đơn chi tiết
- Thông tin booking

### 3️⃣ Khi hủy Booking

**API:** `PUT /api/booking/:id/cancel`

```
User hủy booking
    ↓
Kiểm tra chính sách hủy (24h)
    ↓
Cập nhật status = cancelled
    ↓
✉️ Gửi email thông báo hủy
    ↓
Response trả về
```

**Email gồm:**

- Ngày hủy
- Thông tin booking
- Số tiền hoàn lại (nếu có)
- Chính sách hoàn tiền

---

## 📧 Email Templates

### Template 1: Booking Confirmation

![Preview](https://img.shields.io/badge/Style-Professional-blue)

```
┌─────────────────────────────────┐
│  🎉 Đặt Phòng Thành Công!      │
│  Gradient Purple Header         │
└─────────────────────────────────┘
│ Xin chào [Tên khách],          │
│                                 │
│ ┌─────────────────────────┐   │
│ │ Mã: #12345              │   │
│ │ Khách sạn: ABC Hotel    │   │
│ │ Phòng: Deluxe Room      │   │
│ │ Nhận: 20/12/2024        │   │
│ │ Trả: 22/12/2024         │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━  │   │
│ │ Tổng: 3.500.000 VND     │   │
│ └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Template 2: Payment Receipt

![Preview](https://img.shields.io/badge/Style-Invoice-green)

```
┌─────────────────────────────────┐
│  ✅ Thanh Toán Thành Công       │
│  Green Success Theme            │
└─────────────────────────────────┘
│ Hóa đơn điện tử                │
│                                 │
│ ┌─────────────────────────┐   │
│ │ Mã TT: PAY123456        │   │
│ │ Phương thức: MoMo       │   │
│ │ Ngày: 10/12/2024 15:30  │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━  │   │
│ │ Tổng: 3.500.000 VND     │   │
│ └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Template 3: Cancellation

![Preview](https://img.shields.io/badge/Style-Alert-red)

```
┌─────────────────────────────────┐
│  🚫 Đặt Phòng Đã Hủy            │
│  Red Alert Theme                │
└─────────────────────────────────┘
│ Thông báo hủy đặt phòng        │
│                                 │
│ ┌─────────────────────────┐   │
│ │ Mã: #12345              │   │
│ │ Ngày hủy: 10/12/2024    │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━  │   │
│ │ Hoàn lại: 3.500.000 VND │   │
│ └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 🎨 Template Features

✅ **Responsive Design** - Tự động scale trên mobile  
✅ **Professional Layout** - Gradient headers, clear sections  
✅ **Vietnamese Content** - Toàn bộ nội dung tiếng Việt  
✅ **VND Currency** - Format tiền tệ chuẩn Việt Nam  
✅ **Date Formatting** - Định dạng ngày giờ theo VN  
✅ **Brand Colors** - Purple gradient theme  
✅ **Clear CTAs** - Buttons và links rõ ràng

---

## 🔧 Các Function Có Sẵn

### `emailService.js`

```javascript
// 1. Test connection
await testEmailConnection();

// 2. Send generic email
await sendEmail(to, subject, htmlContent);

// 3. Send booking confirmation
await sendBookingConfirmation(bookingData);

// 4. Send payment receipt
await sendPaymentReceipt(paymentData);

// 5. Send cancellation notice
await sendBookingCancellation(bookingData, refundAmount);

// 6. Send password reset (chưa tích hợp)
await sendPasswordReset(userData, resetToken);
```

---

## 📊 Integration Status

| Controller             | Function        | Email Type           | Status            |
| ---------------------- | --------------- | -------------------- | ----------------- |
| `bookingController.js` | `createBooking` | Booking Confirmation | ✅ Done           |
| `bookingController.js` | `cancelBooking` | Cancellation Notice  | ✅ Done           |
| `paymentController.js` | `momoCallback`  | Payment Receipt      | ✅ Done           |
| `authController.js`    | `resetPassword` | Password Reset       | ⏳ Template ready |

---

## 🐛 Troubleshooting

### Email không được gửi?

**1. Kiểm tra console logs:**

```bash
✅ Email sent successfully: <message-id>
# hoặc
❌ Error sending email: <error-message>
```

**2. Kiểm tra .env:**

```bash
# Đảm bảo các biến này tồn tại
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**3. Kiểm tra Gmail settings:**

- Đã bật 2-Step Verification?
- Đã tạo App Password?
- Email có bị chặn bởi firewall?

**4. Test connection:**

```bash
node src/testEmail.js
```

### Email vào Spam?

- **Nguyên nhân:** Gmail chưa tin tưởng domain/IP
- **Giải pháp ngắn hạn:** Di chuyển khỏi Spam, đánh dấu "Not spam"
- **Giải pháp dài hạn:** Sử dụng dịch vụ email chuyên nghiệp (SendGrid, AWS SES)

### Email gửi chậm?

- Email được gửi **async** (không chặn API response)
- Thời gian gửi: 5-30 giây
- Đây là **behavior bình thường**

---

## 🚀 Production Recommendations

### 1. Sử dụng Email Service Provider

**Thay vì Gmail, dùng:**

- **SendGrid** - 100 emails/day miễn phí
- **AWS SES** - $0.10/1000 emails
- **Mailgun** - 5000 emails/month miễn phí
- **Postmark** - Chuyên transactional emails

### 2. Thêm Email Queue

```bash
npm install bull redis
```

```javascript
// Queue emails thay vì gửi trực tiếp
const emailQueue = new Queue("email");

emailQueue.add({
  type: "booking-confirmation",
  data: bookingData,
});
```

**Lợi ích:**

- Không block API response
- Retry khi failed
- Rate limiting tự động
- Monitoring

### 3. Add Analytics

Track email metrics:

- Open rate
- Click rate
- Bounce rate
- Unsubscribe rate

### 4. DKIM/SPF Setup

Tăng deliverability, tránh spam:

```
TXT record: v=spf1 include:_spf.google.com ~all
DKIM: Setup qua email provider
```

---

## 📈 Next Steps

### Phase 1: Immediate (Done ✅)

- ✅ Setup nodemailer
- ✅ Create email templates
- ✅ Integrate into booking flow
- ✅ Integrate into payment flow
- ✅ Create test script

### Phase 2: Enhancement (Optional)

- ⏳ Add password reset email to authController
- ⏳ Add welcome email for new users
- ⏳ Add promotional emails
- ⏳ Add booking reminder emails (1 day before check-in)

### Phase 3: Production (Recommended)

- ⏳ Switch to SendGrid/AWS SES
- ⏳ Add email queue (Bull + Redis)
- ⏳ Setup email analytics
- ⏳ Add unsubscribe functionality
- ⏳ GDPR compliance (email preferences)

---

## 📝 Code Examples

### Example 1: Manual Email Send

```javascript
const { sendEmail } = require("./utils/emailService");

app.post("/api/send-custom-email", async (req, res) => {
  const { to, subject, message } = req.body;

  const html = `
    <h1>${subject}</h1>
    <p>${message}</p>
  `;

  const result = await sendEmail(to, subject, html);

  res.json({ success: result.success });
});
```

### Example 2: Custom Template

```javascript
// In emailTemplates.js
const customTemplate = (data) => {
  return baseTemplate(`
    <div class="container">
      <div class="header">
        <h1>${data.title}</h1>
      </div>
      <div class="content">
        ${data.content}
      </div>
    </div>
  `);
};
```

### Example 3: Scheduled Emails

```javascript
const cron = require("node-cron");

// Send reminder 1 day before check-in
cron.schedule("0 9 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await Booking.find({
    startDate: {
      $gte: tomorrow.setHours(0, 0, 0, 0),
      $lt: tomorrow.setHours(23, 59, 59, 999),
    },
    status: "confirmed",
  });

  for (const booking of bookings) {
    await sendBookingReminder(booking);
  }
});
```

---

## 🎓 Tài Liệu Tham Khảo

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Password Setup](https://support.google.com/accounts/answer/185833)
- [Email Template Best Practices](https://www.emailonacid.com/blog/)
- [SendGrid Guide](https://docs.sendgrid.com/)

---

## ✨ Kết Luận

Hệ thống email notification đã được triển khai **hoàn chỉnh** với:

✅ 4 loại email templates (Vietnamese)  
✅ Tích hợp vào booking & payment flow  
✅ Test scripts đầy đủ  
✅ Documentation chi tiết  
✅ Production-ready architecture

**Để bắt đầu sử dụng:**

1. Cập nhật `.env` với Gmail App Password
2. Chạy `node src/testEmail.js`
3. Kiểm tra inbox
4. Start backend: `npm start`

🎉 **Email service sẵn sàng hoạt động!**

---

**Created by:** GitHub Copilot  
**Date:** December 10, 2024  
**Version:** 1.0.0
