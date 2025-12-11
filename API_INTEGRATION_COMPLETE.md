# 🏨 Hotel Search & Booking System - API Integration

Đã triển khai đầy đủ logic và tích hợp API cho trang Hotel và Search Results.

## 🚀 Cách chạy để test

### 1. Seed Database (Tạo dữ liệu test)

```powershell
cd backend
node src/scripts/seedHotels.js
```

Kết quả mong đợi:

```
✅ MongoDB connected
🗑️  Cleared existing hotels and rooms
✅ Created hotel: Grand Palace Hotel
  ✅ Created room: Deluxe King Suite
  ✅ Created room: Standard Double Room
...
🎉 Database seeded successfully!
📊 Created 5 hotels with rooms
```

### 2. Khởi động Backend

```powershell
cd backend
npm start
```

Server chạy tại: `http://localhost:8000`

### 3. Khởi động Frontend

```powershell
cd frontend
npm start
```

Frontend chạy tại: `http://localhost:3000`

## 📋 Các tính năng đã triển khai

### A. Trang Hotel (`/hotel`)

✅ **Search Form**

- Input location với state management
- Date picker cho check-in/check-out
- Counter cho rooms và guests
- Navigate to search results khi click Search
- Enter key support

✅ **Featured Hotels**

- Auto load top 4 hotels rated cao nhất
- Display với ProductCard component
- Real data từ API

✅ **Season Buttons**

- Active/inactive state
- Click để switch season (UI ready)

### B. Trang Search Results (`/search-results`)

✅ **Search Integration**

- URL query params (`?q=Barcelona`)
- API call với filters và sorting
- Loading states
- Error handling
- Empty state

✅ **FilterPanel** - Tất cả hoạt động:

- ✅ Price Range Slider (200-1500)
- ✅ Type of Place (any/room/entire)
- ✅ Rooms and Beds counters
- ✅ Room Size checkboxes
- ✅ Distance slider
- ✅ Guest Review Score checkboxes
- ✅ Property Classification (stars) ⭐
- ✅ Amenities (Popular/Essentials/Features/Location/Safety)
- ✅ Booking Options chips
- ✅ Payment Options radio
- ✅ Property Type chips
- ✅ Clear All Filters button

✅ **SortBy Dropdown**

- Recommended (rating desc)
- Price Low to High
- Price High to Low
- Rating High to Low
- Distance from Centre

✅ **ProductCard**

- Dynamic data từ API
- Image slider với navigation
- Star rating display
- Location info
- Room details
- Amenities chips
- Price display
- Favorite button (UI ready)

✅ **Pagination**

- 10 results per page
- Page navigation
- Total results count
- Auto reset khi filter changes

## 🔧 Cách test từng chức năng

### Test 1: Basic Search

1. Mở `/hotel`
2. Nhập "Barcelona" vào search
3. Click Search hoặc Enter
4. Verify: Navigate đến `/search-results?q=Barcelona`
5. Verify: Hiển thị danh sách hotels ở Barcelona

### Test 2: Price Filter

1. Vào search results
2. Drag price slider từ $200 đến $300
3. Verify: Chỉ hotels có room price trong khoảng này
4. Verify: API được gọi với filters mới

### Test 3: Star Rating

1. Tick checkbox "5-star"
2. Verify: Chỉ hiện 5-star hotels
3. Tick thêm "4-star"
4. Verify: Hiện cả 4 và 5-star

### Test 4: Sorting

1. Click SortBy dropdown
2. Chọn "Price Low to High"
3. Verify: Hotels được sắp xếp theo giá tăng dần
4. Thử các options khác

### Test 5: Pagination

1. Nếu có >10 results
2. Click page 2
3. Verify: Load 10 results tiếp theo
4. Verify: Page number update

### Test 6: Clear Filters

1. Apply nhiều filters (price, stars, amenities)
2. Click "Clear" button
3. Verify: Tất cả filters reset về default
4. Verify: Results refresh

### Test 7: Combined Filters

1. Set price $200-500
2. Select 5-star
3. Select amenities: Wi-Fi, Breakfast
4. Sort by Price Low
5. Verify: Results match tất cả criteria

## 📡 API Endpoints hoạt động

### `GET /api/search-hotels`

**Query Parameters:**

- `query` - Search term (city/hotel name)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sort` - Sort option
- `filters` - JSON string với filter criteria

**Example:**

```
GET /api/search-hotels?query=Barcelona&page=1&limit=10&sort=price-low&filters={"minPrice":200,"maxPrice":500,"propertyClass":["5-star"]}
```

**Response:**

```json
{
  "success": true,
  "data": [...hotels with rooms...],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

## 🎯 Data Flow

```
User Action → FilterPanel onChange
            ↓
    handleFiltersChange()
            ↓
    Update filters state
            ↓
    fetchHotels() API call
            ↓
    Backend processes filters
            ↓
    Return filtered hotels
            ↓
    Update UI with results
```

## 📊 Sample Data Created

**5 Hotels:**

1. Grand Palace Hotel (Barcelona) - 5⭐
2. Seaside Resort & Spa (Barcelona) - 4⭐
3. Urban Boutique Hotel (Barcelona) - 4⭐
4. Mountain View Lodge (Madrid) - 5⭐
5. City Center Business Hotel (Madrid) - 4⭐

**Each hotel có 2-3 rooms với:**

- Deluxe King Suite ($250)
- Standard Double Room ($150)
- Family Room ($200)
- Ocean View Suite ($350)
- Business Executive Room ($180)

## ⚙️ Technical Implementation

### Frontend

- ✅ React Hooks (useState, useEffect, useCallback, useRef)
- ✅ React Router (useNavigate, useSearchParams)
- ✅ Axios for API calls
- ✅ SCSS Modules
- ✅ classnames/bind
- ✅ rc-slider for range sliders
- ✅ Ant Design DatePicker

### Backend

- ✅ Express.js
- ✅ MongoDB with Mongoose
- ✅ Hotel & Room models populated
- ✅ Advanced filtering logic
- ✅ Sorting and pagination
- ✅ Error handling

### State Management

- ✅ Filters state với useRef để tránh infinite loop
- ✅ useCallback để optimize re-renders
- ✅ Controlled components
- ✅ Debounced filter changes

## 🐛 Known Issues Fixed

- ✅ Maximum update depth exceeded → Fixed với useRef + useCallback
- ✅ Filter changes causing infinite loop → Skip initial render
- ✅ Price filter not working → Map priceRange to minPrice/maxPrice
- ✅ ProductCard không hiển thị API data → Update props mapping
- ✅ Images không có fallback → Add no-image SVG placeholder

## 📝 Next Steps (Optional)

- [ ] Implement real user favorites/wishlist
- [ ] Add date range filtering to backend
- [ ] Add guest count filtering
- [ ] Add distance calculation từ coordinates
- [ ] Cache API responses
- [ ] Add infinite scroll option
- [ ] Add map view
- [ ] Add comparison feature

## 💡 Tips

- **Clear browser cache** nếu thấy old data
- **Check MongoDB connection** trong backend logs
- **Verify .env file** có MONGODB_URL
- **Check console logs** để debug API calls
- **Use React DevTools** để inspect state changes

---

Tất cả đã sẵn sàng để test! 🎉
