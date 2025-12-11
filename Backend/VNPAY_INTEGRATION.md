# 💳 VNPay Payment Integration - Complete Guide

## ✅ Tổng Quan

VNPay payment gateway đã được tích hợp **hoàn chỉnh** vào hệ thống booking.

### 🎯 Tính năng:

1. ✅ **VNPay Payment URL Generation** - Tạo link thanh toán
2. ✅ **Payment Callback Handling** - Xử lý kết quả thanh toán
3. ✅ **IPN (Instant Payment Notification)** - Webhook từ VNPay
4. ✅ **Email Receipt** - Gửi hóa đơn sau thanh toán thành công
5. ✅ **Payment Verification** - Xác thực chữ ký bảo mật
6. ✅ **Error Handling** - Xử lý các mã lỗi VNPay

---

## 📁 Cấu Trúc File

```
backend/
├── src/
│   ├── utils/
│   │   └── vnpayHelper.js          # VNPay helper functions
│   ├── controllers/
│   │   └── paymentController.js    # VNPay payment handlers
│   ├── routes/
│   │   └── payment.js              # VNPay routes
│   └── .env                        # VNPay credentials

frontend/
├── src/
│   └── pages/
│       └── PaymentPage/
│           ├── PaymentPage.js      # VNPay UI integration
│           └── PaymentPage.module.scss
```

---

## 🔧 Cấu Hình VNPay

### Bước 1: Đăng ký VNPay Sandbox

1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản merchant
3. Lấy thông tin:
   - **TMN Code** (Mã website)
   - **Hash Secret** (Mã bí mật)

### Bước 2: Cập nhật `.env`

```env
# VNPay Payment Configuration
VNPAY_TMN_CODE=YOUR_TMN_CODE              # ← Mã website từ VNPay
VNPAY_HASH_SECRET=YOUR_HASH_SECRET        # ← Hash secret từ VNPay
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay/callback
VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

**⚠️ Quan trọng:**

- `VNPAY_TMN_CODE`: Mã định danh website (8-10 ký tự)
- `VNPAY_HASH_SECRET`: Key dùng để mã hóa chữ ký (SHA512)

---

## 🔄 Payment Flow

### 1️⃣ Tạo Payment URL

**Frontend → Backend:**

```javascript
POST /api/payment/vnpay/create
Headers: {
  Authorization: Bearer <token>
}
Body: {
  bookingId: "675877e0c7dc2569e15c93da"
}
```

**Backend Response:**

```json
{
  "success": true,
  "message": "Tạo URL thanh toán thành công",
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_...",
  "orderId": "675877e0c7dc2569e15c93da_1702345678901",
  "bookingId": "675877e0c7dc2569e15c93da"
}
```

**Flow:**

1. User clicks "Thanh toán bằng VNPay"
2. Frontend gọi API create payment
3. Backend tạo payment URL với signature
4. Frontend redirect user đến VNPay
5. User nhập thông tin thẻ/tài khoản

---

### 2️⃣ VNPay Callback (User Return)

**User thanh toán xong → VNPay redirect về:**

```
GET http://localhost:3000/payment/vnpay/callback?
  vnp_Amount=350000000&
  vnp_BankCode=NCB&
  vnp_ResponseCode=00&
  vnp_TxnRef=675877e0_1702345678901&
  vnp_TransactionNo=13456789&
  vnp_SecureHash=abc123...
```

**Backend xử lý:**

1. ✅ Verify signature (vnp_SecureHash)
2. ✅ Parse response code
3. ✅ Update booking status
4. ✅ Send email receipt
5. ✅ Redirect to success/failed page

**Response Codes:**

| Code | Meaning                               |
| ---- | ------------------------------------- |
| `00` | ✅ Giao dịch thành công               |
| `07` | ⚠️ Thành công nhưng nghi ngờ gian lận |
| `09` | ❌ Chưa đăng ký Internet Banking      |
| `10` | ❌ Xác thực sai quá 3 lần             |
| `11` | ❌ Hết hạn thanh toán                 |
| `12` | ❌ Thẻ bị khóa                        |
| `24` | ❌ Khách hàng hủy giao dịch           |
| `51` | ❌ Tài khoản không đủ số dư           |
| `65` | ❌ Vượt quá hạn mức                   |
| `75` | ❌ Ngân hàng bảo trì                  |

---

### 3️⃣ VNPay IPN (Instant Payment Notification)

**VNPay Server → Backend (webhook):**

```
GET http://localhost:8000/api/payment/vnpay/ipn?
  vnp_Amount=350000000&
  vnp_ResponseCode=00&
  vnp_TxnRef=675877e0_1702345678901&
  ...
```

**Backend Response:**

```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

**IPN Response Codes:**

- `00`: Xác nhận thành công
- `01`: Order không tồn tại
- `02`: Order đã được xác nhận
- `97`: Chữ ký không hợp lệ
- `99`: Lỗi không xác định

---

## 🎨 Frontend Integration

### PaymentPage Component

**2 Payment Options:**

```jsx
{
  /* MoMo */
}
<button onClick={handleMoMoPayment}>Thanh toán bằng MoMo</button>;

{
  /* VNPay */
}
<button onClick={handleVNPayPayment}>Thanh toán bằng VNPay</button>;
```

**VNPay Handler:**

```javascript
const handleVNPayPayment = async () => {
  const response = await axios.post(
    `${apiUrl}/payment/vnpay/create`,
    { bookingId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.data.paymentUrl) {
    window.location.href = response.data.paymentUrl;
  }
};
```

---

## 🔐 Security Features

### 1. Signature Verification

**Tạo chữ ký:**

```javascript
const signData = querystring.stringify(sortedParams);
const hmac = crypto.createHmac("sha512", VNPAY_HASH_SECRET);
const signature = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
```

**Verify callback:**

```javascript
function verifyVNPayCallback(vnpParams) {
  const receivedHash = vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHash"];

  const signData = querystring.stringify(sortObject(vnpParams));
  const calculatedHash = crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return receivedHash === calculatedHash;
}
```

### 2. Amount Verification

VNPay gửi amount \* 100 (VND):

```javascript
const amount = vnpParams["vnp_Amount"] / 100; // Convert back
```

### 3. Order ID Validation

```javascript
const orderId = vnpParams["vnp_TxnRef"];
const bookingId = orderId.split("_")[0]; // Extract booking ID
```

---

## 🧪 Testing

### Test với VNPay Sandbox

**1. Test Card (Domestic):**

```
Card Number: 9704198526191432198
Card Holder: NGUYEN VAN A
Expiry: 07/15
OTP: 123456
```

**2. Test Card (International):**

```
Card Number: 4111111111111111
CVV: 123
Expiry: 12/25
```

**3. Bank Account:**

```
Bank: NCB (Ngân hàng Quốc Dân)
Account: 9704198526191432198
User: NGUYEN VAN A
Password: 123456
OTP: Bất kỳ số nào
```

### Test Flow

**1. Tạo Booking:**

```bash
POST /api/booking
{
  "roomId": "...",
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "guestName": "Test User",
  "guestEmail": "test@example.com",
  "guestPhone": "0123456789",
  "numberOfAdults": 2
}
```

**2. Tạo VNPay Payment:**

```bash
POST /api/payment/vnpay/create
Headers: { Authorization: Bearer <token> }
Body: { bookingId: "<booking-id>" }
```

**3. Redirect to VNPay URL**

**4. Complete Payment on VNPay**

**5. VNPay redirects back:**

```
→ Success: /booking/success?bookingId=...
→ Failed: /booking/failed?message=...
```

**6. Check Database:**

```javascript
Booking.paymentStatus: "confirmed"
Booking.status: "confirmed"
Booking.paymentMethod: "vnpay"
Booking.transactionNo: "13456789"
```

**7. Check Email:**

- ✅ Payment receipt sent to guest email

---

## 📊 API Endpoints

| Method | Endpoint                      | Description     | Auth        |
| ------ | ----------------------------- | --------------- | ----------- |
| POST   | `/api/payment/vnpay/create`   | Tạo payment URL | ✅ Required |
| GET    | `/api/payment/vnpay/callback` | User return URL | ❌ Public   |
| GET    | `/api/payment/vnpay/ipn`      | VNPay webhook   | ❌ Public   |

---

## 🐛 Troubleshooting

### Lỗi: "Invalid Signature"

**Nguyên nhân:**

- Hash secret sai
- Thứ tự params không đúng
- Encoding không khớp

**Giải pháp:**

```javascript
// Check hash secret
console.log(process.env.VNPAY_HASH_SECRET);

// Verify params are sorted
const sorted = sortObject(params);
console.log(querystring.stringify(sorted));
```

### Lỗi: "Order not found"

**Nguyên nhân:**

- BookingId trong orderId không tồn tại
- Format orderId sai

**Giải pháp:**

```javascript
const orderId = "bookingId_timestamp";
const bookingId = orderId.split("_")[0];
console.log("Extracted booking ID:", bookingId);
```

### VNPay không redirect về

**Kiểm tra:**

1. `VNPAY_RETURN_URL` đúng format
2. URL phải public (localhost không hoạt động trên production)
3. Firewall không chặn

---

## 🚀 Production Deployment

### 1. Chuyển sang VNPay Production

```env
# Production URLs
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API_URL=https://vnpayment.vn/merchant_webapi/api/transaction
VNPAY_RETURN_URL=https://yourdomain.com/payment/vnpay/callback

# Production credentials (từ VNPay)
VNPAY_TMN_CODE=YOUR_PROD_TMN_CODE
VNPAY_HASH_SECRET=YOUR_PROD_HASH_SECRET
```

### 2. Configure Return URLs

**Trên VNPay Portal:**

1. Login vào merchant portal
2. Vào **Cấu hình → Return URL**
3. Thêm:
   - `https://yourdomain.com/payment/vnpay/callback`
   - `https://yourdomain.com/api/payment/vnpay/ipn`

### 3. Security Checklist

- ✅ Hash secret stored in environment variables
- ✅ HTTPS enabled
- ✅ Signature verification on every callback
- ✅ Amount validation
- ✅ Order ID validation
- ✅ IPN endpoint secured
- ✅ Rate limiting on payment APIs

---

## 📈 Advanced Features

### 1. Query Transaction Status

```javascript
const { queryVNPayTransaction } = require("./utils/vnpayHelper");

const result = await queryVNPayTransaction({
  orderId: "675877e0_1702345678901",
  transactionDate: "20241210153045",
});

console.log(result);
// {
//   "vnp_ResponseCode": "00",
//   "vnp_TransactionNo": "13456789",
//   "vnp_Amount": "350000000",
//   "vnp_TransactionStatus": "00"
// }
```

### 2. Refund Transaction

```javascript
const { refundVNPayTransaction } = require("./utils/vnpayHelper");

const result = await refundVNPayTransaction({
  orderId: "675877e0_1702345678901",
  amount: 3500000,
  transactionDate: "20241210153045",
  refundReason: "Khách hàng yêu cầu hủy",
});

console.log(result);
// {
//   "vnp_ResponseCode": "00",
//   "vnp_Message": "Refund success"
// }
```

---

## 📞 Support Resources

- **VNPay Documentation**: https://sandbox.vnpayment.vn/apis/docs/
- **Sandbox Portal**: https://sandbox.vnpayment.vn/
- **Support Email**: support@vnpay.vn
- **Hotline**: 1900 55 55 77

---

## ✨ So sánh MoMo vs VNPay

| Feature          | MoMo | VNPay        |
| ---------------- | ---- | ------------ |
| Wallet Payment   | ✅   | ❌           |
| Bank Card        | ✅   | ✅           |
| QR Code          | ✅   | ✅           |
| Installment      | ✅   | ✅           |
| Refund API       | ✅   | ✅ (limited) |
| Transaction Fee  | 1-2% | 1.5-2.5%     |
| Setup Difficulty | Easy | Medium       |
| Documentation    | Good | Excellent    |
| Market Share     | 35%  | 45%          |

**Khuyến nghị:**

- ✅ Tích hợp **cả 2** để tối ưu conversion rate
- ✅ VNPay phù hợp với thanh toán thẻ ngân hàng
- ✅ MoMo phù hợp với thanh toán ví điện tử

---

## 🎓 Best Practices

1. **Always verify signature** - Không tin tưởng client-side data
2. **Log all transactions** - Lưu logs để debug
3. **Handle timeouts** - Payment URL có hạn 15 phút
4. **Idempotency** - Xử lý duplicate IPN callbacks
5. **Error handling** - Parse và hiển thị lỗi rõ ràng
6. **Email notifications** - Gửi receipt sau payment success
7. **Database transactions** - Use atomic operations
8. **Monitor IPN failures** - Alert khi IPN fail

---

**Status:** ✅ **PRODUCTION READY**

**Last Updated:** December 10, 2024  
**Version:** 1.0.0
