# 🚀 Quick Start - Email System

## ⚡ 5 Phút Setup Email

### Bước 1: Lấy Gmail App Password (2 phút)

1. Mở: https://myaccount.google.com/security
2. Bật **"2-Step Verification"** (nếu chưa có)
3. Tìm **"App passwords"** → Click
4. Chọn:
   - App: **Mail**
   - Device: **Other** → Nhập "Travel Booking Backend"
5. Click **Generate**
6. **Copy mật khẩu 16 ký tự** (ví dụ: `abcd efgh ijkl mnop`)

### Bước 2: Cập nhật .env (1 phút)

Mở `backend/.env` và thay đổi:

```env
EMAIL_USER=your-email@gmail.com          # ← Email của bạn
EMAIL_PASSWORD=abcd efgh ijkl mnop       # ← App Password vừa copy
```

**Lưu file!**

### Bước 3: Test Email (2 phút)

```bash
cd backend
node src/testEmail.js
```

**Kết quả mong đợi:**

```
✅ Email server connection successful!
✅ Simple test email sent successfully!
✅ Booking confirmation email sent!
✅ Payment receipt email sent!
✅ Cancellation email sent!

📬 Kiểm tra hộp thư của bạn: your-email@gmail.com
```

### Bước 4: Khởi động Backend

```bash
npm start
```

---

## ✅ Kiểm tra Email hoạt động

### Test 1: Tạo Booking

**POST** `http://localhost:8000/api/booking`

Headers:

```
Authorization: Bearer your-jwt-token
Content-Type: application/json
```

Body:

```json
{
  "roomId": "675877e0c7dc2569e15c93da",
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "guestName": "Nguyễn Văn A",
  "guestPhone": "0123456789",
  "guestEmail": "test@example.com",
  "numberOfAdults": 2,
  "numberOfChildren": 0
}
```

**→ Email booking confirmation sẽ được gửi đến `test@example.com`**

---

### Test 2: Thanh toán

1. Tạo booking (Test 1)
2. Lấy `bookingId` từ response
3. Thanh toán qua MoMo
4. Sau khi callback về backend

**→ Email payment receipt sẽ được gửi**

---

### Test 3: Hủy Booking

**PUT** `http://localhost:8000/api/booking/:bookingId/cancel`

Headers:

```
Authorization: Bearer your-jwt-token
Content-Type: application/json
```

Body:

```json
{
  "cancellationReason": "Thay đổi kế hoạch"
}
```

**→ Email cancellation sẽ được gửi**

---

## 🐛 Troubleshooting

### Lỗi: "Invalid login"

```
❌ Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Giải pháp:**

1. Kiểm tra `EMAIL_USER` đúng email chưa
2. Kiểm tra `EMAIL_PASSWORD` là **App Password** (16 ký tự), KHÔNG phải mật khẩu Gmail thường
3. Xóa khoảng trắng trong App Password

---

### Email không thấy trong Inbox

**Kiểm tra:**

1. ✅ Thư mục **Spam**
2. ✅ Thư mục **Promotions** (Gmail)
3. ✅ Check console logs: `✅ Email sent successfully`

---

### Test script báo lỗi

```bash
# Kiểm tra .env đã load chưa
node -e "require('dotenv').config(); console.log(process.env.EMAIL_USER)"

# Phải in ra email của bạn, không phải undefined
```

---

## 📞 Support

Nếu gặp vấn đề, check:

1. `backend/EMAIL_SETUP.md` - Hướng dẫn chi tiết
2. `backend/EMAIL_IMPLEMENTATION.md` - Documentation đầy đủ
3. Console logs khi chạy backend
4. Gmail security settings

---

**🎉 Done! Email system sẵn sàng!**
