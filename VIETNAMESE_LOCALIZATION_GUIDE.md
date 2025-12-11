# Hướng dẫn Việt hóa toàn bộ Project

## ✅ Đã hoàn thành

### 1. UI Components

- ✅ Header (Điểm đến, Về chúng tôi, Blog du lịch, Liên hệ, Viết bài, Đăng nhập, Đăng ký)
- ✅ UserNavigation (Hồ sơ, Bảng điều khiển, Cài đặt, Đăng xuất)
- ✅ ProductCard (Xuất sắc, Rất tốt, Tốt, Khá, đánh giá, phòng, người lớn, trẻ em, phòng còn trống, mỗi đêm)
- ✅ BookingCard (Nhận phòng, Trả phòng, Phòng và khách, Người lớn, Phòng, Giá, Từ...đến, Xem phòng)
- ✅ HotelPage (Hành trình của bạn..., Điểm đến, Bạn muốn đi đâu?, Nhận phòng - Trả phòng, Phòng và khách, Người lớn, Trẻ em, Tìm kiếm)
- ✅ Date Format: Đã đổi sang dd/MM/yyyy
- ✅ Currency Format: Đã sử dụng VND trong BookingCard

### 2. Các thay đổi quan trọng

```javascript
// Date format đã đổi
format(date, "dd/MM/yyyy"); // thay vì MM/dd/yyyy

// Currency format đã có
const formatPrice = (price) => {
  return price.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
  });
};
```

## 📋 Cần tiếp tục

### 1. Login & SignUp Pages (QUAN TRỌNG)

**File: `frontend/src/pages/Login/Login.js`**

```javascript
// Thay đổi cần thiết:
"Sign In" → "Đăng nhập"
"Continue with Facebook" → "Tiếp tục với Facebook"
"Continue with Google" → "Tiếp tục với Google"
"Continue with Apple" → "Tiếp tục với Apple"
"OR" → "HOẶC"
"Email" → "Email"
"Password" → "Mật khẩu"
"Sign In" (button) → "Đăng nhập"
"Don't have an account?" → "Chưa có tài khoản?"
"Sign Up" (link) → "Đăng ký"

// Error messages:
"Email is required" → "Vui lòng nhập email"
"Email is not valid" → "Email không hợp lệ"
"Password must be at least 8 characters..." → "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
```

**File: `frontend/src/pages/SignUp/SignUp.js`**

```javascript
// Thay đổi tương tự Login, thêm:
"Sign up successful! Redirecting..." → "Đăng ký thành công! Đang chuyển hướng..."
"Have an account?" → "Đã có tài khoản?"
```

### 2. BookingPage (f:\DA_CNPM\frontend\src\pages\BookingPage\BookingPage.js)

```javascript
// Các text cần đổi:
"Booking Summary" → "Tóm tắt đặt phòng"
"Guest Information" → "Thông tin khách hàng"
"Full Name" → "Họ và tên"
"Phone Number" → "Số điện thoại"
"Email Address" → "Địa chỉ email"
"Number of Adults" → "Số người lớn"
"Number of Children" → "Số trẻ em"
"Special Requests" → "Yêu cầu đặc biệt"
"Optional" → "Tùy chọn"
"Confirm Booking" → "Xác nhận đặt phòng"
"Total Price" → "Tổng tiền"
"Per Night" → "Mỗi đêm"
"Nights" → "đêm"
"Please login to make a booking" → "Vui lòng đăng nhập để đặt phòng"
"Room details not available" → "Thông tin phòng không khả dụng"
"This room is not available for the selected dates" → "Phòng này không còn trống trong khoảng thời gian bạn chọn"
```

### 3. PaymentPage (f:\DA_CNPM\frontend\src\pages\PaymentPage\PaymentPage.js)

```javascript
"Payment" → "Thanh toán"
"Payment Status" → "Trạng thái thanh toán"
"Payment successful!" → "Thanh toán thành công!"
"Payment failed. Please try again." → "Thanh toán thất bại. Vui lòng thử lại."
"Pending" → "Đang chờ"
"Success" → "Thành công"
"Failed" → "Thất bại"
"Pay with MoMo" → "Thanh toán bằng MoMo"
"Booking Details" → "Chi tiết đặt phòng"
"Download Invoice" → "Tải hóa đơn"
"Return to Home" → "Về trang chủ"
```

### 4. HotelDetails (f:\DA_CNPM\frontend\src\pages\HotelDetails\HotelDetails.js)

```javascript
"Hotel Details" → "Chi tiết khách sạn"
"About this hotel" → "Về khách sạn này"
"Amenities" → "Tiện nghi"
"Rooms" → "Phòng"
"Reviews" → "Đánh giá"
"Location" → "Vị trí"
"Select Room" → "Chọn phòng"
"Book Now" → "Đặt ngay"
"Available Rooms" → "Phòng còn trống"
"View Room" → "Xem phòng"
"Free WiFi" → "WiFi miễn phí"
"Free Parking" → "Đỗ xe miễn phí"
"Swimming Pool" → "Hồ bơi"
"Gym" → "Phòng gym"
"Spa" → "Spa"
"Restaurant" → "Nhà hàng"
"Bar" → "Quầy bar"
"Room Service" → "Phục vụ phòng"
"24-Hour Front Desk" → "Lễ tân 24/7"
"Air Conditioning" → "Điều hòa"
```

### 5. SearchResults (f:\DA_CNPM\frontend\src\pages\SearchResults\SearchResult.js)

```javascript
"Search Results" → "Kết quả tìm kiếm"
"No hotels found" → "Không tìm thấy khách sạn"
"Filters" → "Bộ lọc"
"Price Range" → "Khoảng giá"
"Star Rating" → "Xếp hạng sao"
"Amenities" → "Tiện nghi"
"Sort by" → "Sắp xếp theo"
"Recommended" → "Đề xuất"
"Price: Low to High" → "Giá: Thấp đến cao"
"Price: High to Low" → "Giá: Cao đến thấp"
"Rating: High to Low" → "Đánh giá: Cao đến thấp"
"Apply Filters" → "Áp dụng"
"Clear Filters" → "Xóa bộ lọc"
```

### 6. UserBookings (f:\DA_CNPM\frontend\src\pages\UserBookings\UserBookings.js)

```javascript
"My Bookings" → "Đặt phòng của tôi"
"All" → "Tất cả"
"Pending" → "Đang chờ"
"Confirmed" → "Đã xác nhận"
"Cancelled" → "Đã hủy"
"Cancel Booking" → "Hủy đặt phòng"
"View Details" → "Xem chi tiết"
"No bookings found" → "Không có đặt phòng nào"
"Check-in" → "Nhận phòng"
"Check-out" → "Trả phòng"
"Guest Name" → "Tên khách"
"Total" → "Tổng cộng"
```

### 7. Admin Pages

**AdminDashboard:**

```javascript
"Dashboard" → "Bảng điều khiển"
"Total Revenue" → "Tổng doanh thu"
"Total Bookings" → "Tổng đặt phòng"
"Occupancy Rate" → "Tỷ lệ lấp đầy"
"Average Rating" → "Đánh giá trung bình"
"Revenue Analytics" → "Phân tích doanh thu"
"Top Performing Hotels" → "Khách sạn hoạt động tốt nhất"
"Recent Bookings" → "Đặt phòng gần đây"
```

**AdminHotels:**

```javascript
"Manage Hotels" → "Quản lý khách sạn"
"Add New Hotel" → "Thêm khách sạn mới"
"Edit Hotel" → "Chỉnh sửa khách sạn"
"Delete Hotel" → "Xóa khách sạn"
"Hotel Name" → "Tên khách sạn"
"City" → "Thành phố"
"Country" → "Quốc gia"
"Address" → "Địa chỉ"
"Description" → "Mô tả"
"Star Rating" → "Xếp hạng sao"
"Save" → "Lưu"
"Cancel" → "Hủy"
```

**AdminRooms:**

```javascript
"Manage Rooms" → "Quản lý phòng"
"Add New Room" → "Thêm phòng mới"
"Room Number" → "Số phòng"
"Room Type" → "Loại phòng"
"Price per Night" → "Giá mỗi đêm"
"Max Adults" → "Tối đa người lớn"
"Max Children" → "Tối đa trẻ em"
"Amenities" → "Tiện nghi"
"Images" → "Hình ảnh"
```

**AdminBookings:**

```javascript
"Manage Bookings" → "Quản lý đặt phòng"
"Booking ID" → "Mã đặt phòng"
"Guest Name" → "Tên khách"
"Hotel" → "Khách sạn"
"Room" → "Phòng"
"Check-in Date" → "Ngày nhận phòng"
"Check-out Date" → "Ngày trả phòng"
"Status" → "Trạng thái"
"Payment Status" → "Trạng thái thanh toán"
"Total Amount" → "Tổng tiền"
"Update Status" → "Cập nhật trạng thái"
```

**AdminReviews:**

```javascript
"Manage Reviews" → "Quản lý đánh giá"
"Reply to Review" → "Trả lời đánh giá"
"Rating" → "Điểm đánh giá"
"Comment" → "Bình luận"
"Partner Reply" → "Phản hồi của đối tác"
"Submit Reply" → "Gửi phản hồi"
```

**AdminReports:**

```javascript
"Reports" → "Báo cáo"
"Revenue Report" → "Báo cáo doanh thu"
"Occupancy Report" → "Báo cáo lấp đầy"
"Export to CSV" → "Xuất ra CSV"
"Daily" → "Theo ngày"
"Weekly" → "Theo tuần"
"Monthly" → "Theo tháng"
"Start Date" → "Ngày bắt đầu"
"End Date" → "Ngày kết thúc"
"All Hotels" → "Tất cả khách sạn"
```

### 8. BACKEND Messages (f:\DA_CNPM\backend\src\controllers\)

**authController.js:**

```javascript
"Email is required" → "Vui lòng nhập email"
"Password is required" → "Vui lòng nhập mật khẩu"
"Invalid email format" → "Định dạng email không hợp lệ"
"Email already exists" → "Email đã tồn tại"
"Invalid credentials" → "Thông tin đăng nhập không chính xác"
"User created successfully" → "Tạo tài khoản thành công"
"Login successful" → "Đăng nhập thành công"
```

**bookingController.js:**

```javascript
"Please provide all required fields" → "Vui lòng điền đầy đủ thông tin bắt buộc"
"Start date cannot be in the past" → "Ngày nhận phòng không thể là quá khứ"
"End date must be after start date" → "Ngày trả phòng phải sau ngày nhận phòng"
"Room not found" → "Không tìm thấy phòng"
"Room can accommodate maximum X adults" → "Phòng chỉ chứa tối đa X người lớn"
"Room is not available for the selected dates" → "Phòng không còn trống trong khoảng thời gian đã chọn"
"Booking created successfully" → "Đặt phòng thành công"
"Booking not found" → "Không tìm thấy đặt phòng"
"Booking cancelled successfully" → "Hủy đặt phòng thành công"
"Cannot cancel booking within 24 hours" → "Không thể hủy đặt phòng trong vòng 24 giờ trước khi nhận phòng"
```

**hotelController.js:**

```javascript
"Hotel created successfully" → "Tạo khách sạn thành công"
"Hotel updated successfully" → "Cập nhật khách sạn thành công"
"Hotel deleted successfully" → "Xóa khách sạn thành công"
"Hotel not found" → "Không tìm thấy khách sạn"
"Missing required search parameters" → "Thiếu thông tin tìm kiếm bắt buộc"
```

**reviewController.js:**

```javascript
"Review submitted successfully" → "Gửi đánh giá thành công"
"You can only review after checkout" → "Bạn chỉ có thể đánh giá sau khi trả phòng"
"You have already reviewed this booking" → "Bạn đã đánh giá đặt phòng này rồi"
"Reply added successfully" → "Thêm phản hồi thành công"
"Only partners can reply to reviews" → "Chỉ đối tác mới có thể trả lời đánh giá"
```

**paymentController.js:**

```javascript
"Booking not found" → "Không tìm thấy đặt phòng"
"Payment already processed" → "Thanh toán đã được xử lý"
"Payment successful" → "Thanh toán thành công"
"Payment failed" → "Thanh toán thất bại"
"Creating MoMo payment..." → "Đang tạo thanh toán MoMo..."
```

### 9. Validation Messages

**Tất cả các form validation:**

```javascript
// Required fields
"This field is required" → "Trường này là bắt buộc"
"Please fill in all required fields" → "Vui lòng điền đầy đủ các trường bắt buộc"

// Email
"Invalid email address" → "Địa chỉ email không hợp lệ"

// Password
"Password must be at least 8 characters" → "Mật khẩu phải có ít nhất 8 ký tự"
"Passwords do not match" → "Mật khẩu không khớp"

// Phone
"Invalid phone number" → "Số điện thoại không hợp lệ"

// Date
"Invalid date" → "Ngày không hợp lệ"
"Check-out date must be after check-in date" → "Ngày trả phòng phải sau ngày nhận phòng"

// Number
"Please enter a valid number" → "Vui lòng nhập số hợp lệ"
"Value must be greater than 0" → "Giá trị phải lớn hơn 0"
```

### 10. Currency Format - Cập nhật toàn bộ

**Tạo utility function chung (f:\DA_CNPM\frontend\src\common\currency.js):**

```javascript
// Tạo file mới
export const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const parseVND = (vndString) => {
  return parseInt(vndString.replace(/[^\d]/g, ""), 10);
};
```

**Sử dụng trong tất cả components:**

```javascript
import { formatVND } from "~/common/currency";

// Thay vì:
`$${price}`;
// Dùng:
formatVND(price);
```

**Các file cần update currency:**

- ProductCard.js ✅ (Đã xong)
- BookingCard.js ✅ (Đã xong)
- BookingPage.js
- PaymentPage.js
- HotelDetails.js
- SearchResults.js
- UserBookings.js
- AdminDashboard.js
- AdminReports.js
- AdminBookings.js

### 11. Date Format - Locale 'vi-VN'

**Cập nhật tất cả date-fns format:**

```javascript
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Thay vì:
format(date, "MM/dd/yyyy");
// Dùng:
format(date, "dd/MM/yyyy", { locale: vi });

// Với text:
format(date, "dd MMMM yyyy", { locale: vi });
// Output: "08 Tháng 12 2025"

format(date, "EEEE, dd/MM/yyyy", { locale: vi });
// Output: "Thứ Hai, 08/12/2025"
```

**Antd DatePicker locale:**

```javascript
import viVN from "antd/es/locale/vi_VN";
import { ConfigProvider } from "antd";

// Wrap toàn bộ app:
<ConfigProvider locale={viVN}>
  <App />
</ConfigProvider>;
```

### 12. Toast Messages

**Tất cả toast.error() và toast.success():**

```javascript
// Success messages
"Success!" → "Thành công!"
"Saved successfully" → "Lưu thành công"
"Updated successfully" → "Cập nhật thành công"
"Deleted successfully" → "Xóa thành công"
"Created successfully" → "Tạo mới thành công"

// Error messages
"An error occurred" → "Đã xảy ra lỗi"
"Failed to load data" → "Không thể tải dữ liệu"
"Failed to save" → "Lưu thất bại"
"Failed to delete" → "Xóa thất bại"
"Network error" → "Lỗi mạng"
"Server error" → "Lỗi máy chủ"

// Warning messages
"Are you sure?" → "Bạn có chắc chắn?"
"This action cannot be undone" → "Hành động này không thể hoàn tác"
```

## 🔧 Commands để test

```bash
# Frontend
cd frontend
npm start

# Backend
cd backend
npm start
```

## 📝 Checklist hoàn thành

- [x] Header & Navigation
- [x] ProductCard
- [x] BookingCard
- [x] HotelPage
- [ ] Login Page
- [ ] SignUp Page
- [ ] BookingPage
- [ ] PaymentPage
- [ ] HotelDetails
- [ ] SearchResults
- [ ] UserBookings
- [ ] Admin Pages (Dashboard, Hotels, Rooms, Bookings, Reviews, Reports)
- [ ] Backend error messages
- [ ] Currency format (tất cả pages)
- [ ] Date format (tất cả pages)
- [ ] Toast messages
- [ ] Form validation messages

## 💡 Tips

1. **Tìm kiếm nhanh:** Dùng VS Code "Find in Files" (Ctrl+Shift+F):

   - Tìm: `"Check-in"`, `"Check-out"`, `"Sign In"`, `"Sign Up"`, etc.
   - Thay thế bằng tiếng Việt tương ứng

2. **Test từng trang một:**

   - Sau khi sửa Login, test ngay
   - Sau khi sửa BookingPage, test booking flow
   - Đảm bảo không có lỗi trước khi chuyển sang trang khác

3. **Backup trước khi sửa:**

   ```bash
   git add .
   git commit -m "Work in progress: Vietnamese localization"
   ```

4. **Format giá VND:**

   - Luôn dùng `formatVND()` function
   - Đảm bảo backend trả về số, không phải string
   - Test với số lớn: 10,000,000 VND

5. **Date format:**
   - Đảm bảo tất cả dùng dd/MM/yyyy
   - Import locale vi từ date-fns
   - Test với DatePicker và display

## 🚀 Priority Order (Ưu tiên)

1. **HIGH (Làm ngay):**

   - Login & SignUp pages (người dùng thấy đầu tiên)
   - BookingPage (chức năng core)
   - PaymentPage (chức năng core)
   - Backend error messages (UX quan trọng)

2. **MEDIUM (Làm sau):**

   - HotelDetails
   - SearchResults
   - UserBookings
   - Currency format update

3. **LOW (Làm cuối):**
   - Admin pages (ít người dùng)
   - Blog pages
   - About/Contact pages

---

**Lưu ý:** File này là hướng dẫn chi tiết, bạn có thể làm theo từng phần. Mỗi khi hoàn thành một phần, đánh dấu ✅ vào checklist.
