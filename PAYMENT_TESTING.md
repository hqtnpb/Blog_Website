# 🧪 Payment Testing Guide

## Quick Test - Payment Endpoints

### 1. Test Backend Health

```bash
curl http://localhost:8000/api/hotels
```

Expected: List of hotels (200 OK)

---

### 2. Test MoMo Payment Creation

**Yêu cầu:** Login trước để có token

```bash
# Login
POST http://localhost:8000/api/auth/signin
{
  "email": "your-email@gmail.com",
  "password": "your-password"
}

# Copy accessToken từ response

# Create MoMo Payment
POST http://localhost:8000/api/payment/momo/create
Headers: {
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Content-Type": "application/json"
}
Body: {
  "bookingId": "YOUR_BOOKING_ID"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Payment URL created successfully",
  "paymentUrl": "https://test-payment.momo.vn/...",
  "orderId": "...",
  "bookingId": "..."
}
```

---

### 3. Test VNPay Payment Creation

```bash
POST http://localhost:8000/api/payment/vnpay/create
Headers: {
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Content-Type": "application/json"
}
Body: {
  "bookingId": "YOUR_BOOKING_ID"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Tạo URL thanh toán thành công",
  "paymentUrl": "https://sandbox.vnpayment.vn/...",
  "orderId": "...",
  "bookingId": "..."
}
```

---

## Common Issues

### ❌ Issue 1: "Please login to make payment"

**Cause:** No token or invalid token

**Solution:**

1. Open DevTools → Application → Session Storage
2. Check if "user" object exists
3. Verify `accessToken` is present
4. Try logout and login again

```javascript
// Check in browser console
const userData = sessionStorage.getItem("user");
console.log(JSON.parse(userData));
```

---

### ❌ Issue 2: "Booking not found"

**Cause:** Invalid bookingId or booking doesn't belong to user

**Solution:**

1. Create a booking first
2. Use the correct booking ID from response
3. Verify booking exists:

```bash
GET http://localhost:8000/api/booking
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

---

### ❌ Issue 3: "Payment URL not received"

**Cause:** Backend error or payment gateway down

**Check Backend Logs:**

```bash
# Should see:
✅ MongoDB connected successfully
Server is running on port 8000
📝 MoMo Payment Request: { bookingId: '...', userId: '...' }
🚀 Calling MoMo API...
✅ MoMo Response: { resultCode: 0 }
```

---

### ❌ Issue 4: CORS Error

**Cause:** Frontend and backend not configured properly

**Solution:** Check `backend/src/index.js`:

```javascript
app.use(cors()); // ✅ Should be present
```

---

### ❌ Issue 5: CSP Warnings (Custom.min.js errors)

**Cause:** Old scripts in cache or browser extensions

**These warnings are SAFE to ignore.** They don't affect payment.

**To remove:**

1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard reload (Ctrl + Shift + R)
3. Disable browser extensions
4. Try incognito mode

---

## Step-by-Step Payment Test

### 🎯 Complete Flow Test

**1. Login:**

```
URL: http://localhost:3000/signin
Email: test@example.com
Password: Test123!
```

**2. Browse Hotels:**

```
URL: http://localhost:3000/hotels
Click any hotel → View room details
```

**3. Create Booking:**

```
URL: http://localhost:3000/booking/:hotelId/:roomId
Fill form:
- Check-in: 2024-12-20
- Check-out: 2024-12-22
- Guests: 2 adults
- Phone: 0123456789
- Email: test@example.com

Click "Đặt phòng"
```

**4. Payment Page:**

```
URL: http://localhost:3000/payment/:bookingId
Should see 2 buttons:
- 🟣 Thanh toán bằng MoMo
- 🔵 Thanh toán bằng VNPay
```

**5. Click Payment Method:**

```
MoMo Test:
  → Click "Thanh toán bằng MoMo"
  → Should redirect to MoMo sandbox
  → Complete payment
  → Redirected back to success page

VNPay Test:
  → Click "Thanh toán bằng VNPay"
  → Should redirect to VNPay sandbox
  → Use test card: 9704198526191432198
  → Complete payment
  → Redirected back to success page
```

**6. Verify:**

```
✅ Email receipt received
✅ Booking status = "confirmed"
✅ Payment visible in dashboard
```

---

## Debug Payment in Browser Console

### Enable Detailed Logging

**Open DevTools (F12) → Console**

**Add this in PaymentPage.js temporarily:**

```javascript
const handleMoMoPayment = async () => {
  console.log("🔍 Starting MoMo payment...");
  console.log("Booking ID:", booking_id);
  console.log("API URL:", apiUrl);

  const userDataStr = sessionStorage.getItem("user");
  console.log("User data:", userDataStr);

  const userData = JSON.parse(userDataStr);
  console.log("Parsed user:", userData);
  console.log("Token:", userData?.accessToken);

  // ... rest of code
};
```

**Expected Console Output:**

```
🔍 Starting MoMo payment...
Booking ID: 675877e0c7dc2569e15c93da
API URL: http://localhost:8000/api
User data: {"accessToken":"eyJhbGc...","username":"test"}
Parsed user: {accessToken: "eyJhbG...", username: "test"}
Token: eyJhbGc...
```

---

## Test với Postman/Thunder Client

### Collection Setup

**1. Create Booking:**

```
POST {{baseUrl}}/booking
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body:
{
  "roomId": "{{roomId}}",
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "guestName": "Test User",
  "guestPhone": "0123456789",
  "guestEmail": "test@example.com",
  "numberOfAdults": 2,
  "numberOfChildren": 0
}
```

**2. Create MoMo Payment:**

```
POST {{baseUrl}}/payment/momo/create
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body:
{
  "bookingId": "{{bookingId}}"
}
```

**3. Create VNPay Payment:**

```
POST {{baseUrl}}/payment/vnpay/create
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body:
{
  "bookingId": "{{bookingId}}"
}
```

---

## Environment Variables Check

**Backend (.env):**

```bash
# MongoDB
MONGODB_URL=mongodb+srv://...

# JWT
SECRET_ACCESS_KEY=your-secret-key

# MoMo
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz

# VNPay
VNPAY_TMN_CODE=YOUR_TMN_CODE          # ⚠️ Update this
VNPAY_HASH_SECRET=YOUR_HASH_SECRET    # ⚠️ Update this

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

**Frontend (.env):**

```bash
REACT_APP_SERVER_DOMAIN=http://localhost:8000/api
```

---

## Success Indicators

### ✅ Payment Working Correctly

**Backend Logs:**

```
✅ MongoDB connected successfully
Server is running on port 8000
📝 MoMo Payment Request: {...}
🚀 Calling MoMo API...
✅ MoMo Response: { resultCode: 0 }
```

**Frontend Console:**

```
🔍 Starting MoMo payment...
✅ Payment URL created
→ Redirecting to MoMo...
```

**Browser:**

```
1. Payment page loads ✅
2. See 2 payment buttons ✅
3. Click button → redirect to payment gateway ✅
4. Complete payment ✅
5. Return to success page ✅
6. Email received ✅
```

---

## Still Having Issues?

**Contact Info:**

1. Check backend logs in terminal
2. Check browser console (F12)
3. Check Network tab for failed requests
4. Verify .env configuration
5. Test with Postman first
6. Clear cache and cookies

**Common Fix:**

```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

**Nuclear Option:**

```bash
# Clear everything
rm -rf node_modules package-lock.json
npm install
npm start
```

---

**Last Updated:** December 10, 2024
