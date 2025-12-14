# Hướng dẫn khắc phục vấn đề ảnh thiếu trong Hotel và Room

## Vấn đề

- Khách sạn và phòng đang có quá ít ảnh hoặc bị mất ảnh
- Hiển thị "Không có ảnh" hoặc placeholder xấu

## Giải pháp đã triển khai

### 1. Script Seed Ảnh Mẫu (✅ Completed)

Tạo script `backend/src/scripts/seedHotelImages.js` để tự động:

- Thêm 6 ảnh chất lượng cao từ Unsplash cho mỗi hotel
- Thêm 4 ảnh chất lượng cao cho mỗi room (phân theo loại phòng)
- Chỉ update những hotel/room đang thiếu ảnh (< 3 images)

**Cách chạy:**

```powershell
cd backend
node src/scripts/seedHotelImages.js
```

**Kết quả mong đợi:**

```
Connected to MongoDB
Found X hotels
✅ Updated images for hotel: Hotel ABC
  Found Y rooms for Hotel ABC
  ✅ Updated images for room: Deluxe Room
🎉 Seed completed!
📊 Updated X hotels with images
📊 Updated Y rooms with images
```

### 2. Fallback Images trong Frontend (✅ Completed)

#### HotelDetails.js

- Main hotel image: Luôn hiển thị ảnh (dùng Unsplash nếu thiếu)
- Thumbnails (5 ảnh): Mỗi thumbnail có fallback image riêng
- Room cards: Dùng fallback cho room images

**Fallback images:**

- Hotel main: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800`
- Hotel thumb 1: `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800`
- Hotel thumb 2: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800`
- Hotel thumb 3: `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800`
- Hotel thumb 4: `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800`
- Room default: `https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800`

#### RoomDetails.js

- Đã có sẵn fallback: `https://via.placeholder.com/800x600?text=No+Image`
- Không cần sửa (đã tốt)

### 3. ImageManager Component (✅ Already Working)

- Upload ảnh qua AWS S3
- Nén ảnh tự động (max 1920x1080, quality 0.8)
- Support drag & drop
- Reorder images
- Set primary image
- Max 10 images per hotel/room

## Cách sử dụng

### Cho Partner Admin:

#### Thêm ảnh cho Hotel:

1. Vào `/admin/hotels`
2. Click "Chỉnh sửa" hotel
3. Kéo thả ảnh vào khu vực "Hotel Images" hoặc click để chọn file
4. Đợi upload xong (sẽ tự động nén)
5. Click "Cập nhật" để lưu

#### Thêm ảnh cho Room:

1. Vào `/admin/rooms`
2. Click "Chỉnh sửa" room
3. Kéo thả ảnh vào khu vực "Room Images"
4. Đợi upload xong
5. Click "Cập nhật"

### Cho System Admin:

- Có thể xem và quản lý hotels qua `/system-admin/hotels`
- Có thể chạy script seed để thêm ảnh mẫu cho tất cả hotels/rooms

## Nguồn ảnh

### Ảnh mẫu (Unsplash - Free to use):

- High quality hotel images
- Professional room photos
- No watermark
- Optimized for web (800px width)

### Upload ảnh riêng:

- Format: JPG, PNG, WebP
- Kích thước: Tự động resize về 1920x1080 (giữ tỷ lệ)
- Dung lượng: Tự động nén để tối ưu
- Lưu trữ: AWS S3

## Kiểm tra

### 1. Sau khi chạy script:

```powershell
# Check MongoDB
mongosh blog-website
db.hotels.findOne({}, {name: 1, images: 1})
db.rooms.findOne({}, {title: 1, images: 1})
```

### 2. Kiểm tra Frontend:

- Truy cập `/hotels/:id` để xem hotel details
- Kiểm tra image gallery (5 thumbnails + 1 main)
- Truy cập `/room/:hotel_id/:room_id` để xem room details
- Kiểm tra room image carousel

### 3. Kiểm tra Admin Panel:

- Partner: `/admin/hotels` và `/admin/rooms`
- System Admin: `/system-admin/hotels`
- Thử upload ảnh mới
- Kiểm tra compression và upload progress

## Lưu ý

1. **Script chỉ update hotels/rooms thiếu ảnh:**

   - Hotels có < 3 images → Update thành 6 images
   - Rooms có < 2 images → Update thành 4 images
   - Giữ nguyên nếu đã đủ ảnh

2. **Fallback images chỉ hiển thị tạm:**

   - Nên upload ảnh thật qua Admin Panel
   - Fallback chỉ để tránh hiển thị lỗi

3. **AWS S3 Configuration:**

   - Cần có AWS credentials trong `.env`
   - Check `frontend/src/common/aws.js` cho config

4. **Performance:**
   - Images được lazy load
   - Compression giảm bandwidth
   - CDN-ready (Unsplash CDN)

## Troubleshooting

### Lỗi "Connected to MongoDB" nhưng không update:

```powershell
# Check MongoDB connection string
# File: backend/src/scripts/seedHotelImages.js
# Line 127: mongodb://127.0.0.1:27017/blog-website
```

### Upload ảnh bị failed:

- Check AWS credentials
- Check network connection
- Check file size (max ~10MB before compression)
- Check file format (JPG, PNG, WebP)

### Ảnh không hiển thị sau upload:

- Check browser console for errors
- Check network tab for failed requests
- Verify image URL in MongoDB
- Clear browser cache

### Script không tìm thấy hotels/rooms:

```powershell
# Verify data exists
mongosh blog-website
db.hotels.countDocuments()
db.rooms.countDocuments()
```

## Next Steps (Optional)

1. **Thêm ảnh từ URL:**

   - Cho phép paste URL thay vì chỉ upload file
   - Validate URL trước khi save

2. **Bulk image upload:**

   - Upload nhiều ảnh cùng lúc cho nhiều hotels/rooms
   - Import từ ZIP file

3. **Image optimization service:**

   - Tích hợp Cloudinary hoặc ImageKit
   - Auto-format (WebP, AVIF)
   - Auto-resize responsive images

4. **AI-generated images:**
   - Tích hợp DALL-E hoặc Stable Diffusion
   - Generate ảnh based on hotel description
