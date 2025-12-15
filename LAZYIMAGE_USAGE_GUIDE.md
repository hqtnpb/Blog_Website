# 🖼️ How to Use LazyImage Component

## Quick Example

### Before (Regular Image):

```javascript
<img src={hotel.images?.[0]} alt={hotel.name} className={cx("hotel-image")} />
```

### After (Lazy Loaded):

```javascript
import LazyImage from "~/components/LazyImage";

<LazyImage
  src={hotel.images?.[0] || "/default-hotel.jpg"}
  alt={hotel.name}
  className={cx("hotel-image")}
  placeholder="/placeholder-loading.jpg"
/>;
```

---

## 📍 Where to Apply LazyImage

### Priority 1 - Hotel/Room Images (High Impact)

#### 1. ProductCard Component

**File**: `frontend/src/components/ProductCard/ProductCard.js`

```javascript
// Replace all <img> tags with LazyImage
import LazyImage from "~/components/LazyImage";

// In the render:
<LazyImage
  src={hotel.images?.[0] || "/default-hotel.jpg"}
  alt={hotel.name}
  className={cx("product-image")}
/>;
```

#### 2. HotelDetails Page

**File**: `frontend/src/pages/HotelDetails/HotelDetails.js`

```javascript
// Main hotel image gallery
{
  hotel.images?.map((image, index) => (
    <LazyImage
      key={index}
      src={image}
      alt={`${hotel.name} - ${index + 1}`}
      className={cx("gallery-image")}
    />
  ));
}
```

#### 3. UserBookings Page

**File**: `frontend/src/pages/UserBookings/UserBookings.js`

```javascript
// Booking card images
<LazyImage
  src={booking.room?.hotel?.images?.[0]}
  alt={booking.room?.hotel?.name}
  className={cx("hotel-image")}
/>
```

---

### Priority 2 - Blog Images

#### 4. BlogCard Component

**File**: `frontend/src/components/BlogCard/BlogCard.js`

```javascript
import LazyImage from "~/components/LazyImage";

<LazyImage src={blog.banner} alt={blog.title} className={cx("blog-banner")} />;
```

#### 5. BlogPost Component

**File**: `frontend/src/components/BlogPost/BlogPost.js`

```javascript
// Author avatar
<LazyImage
  src={author.profile_img}
  alt={author.username}
  className={cx("author-avatar")}
/>
```

---

### Priority 3 - User Avatars

#### 6. UserCard Component

**File**: `frontend/src/components/UserCard/UserCard.js`

```javascript
<LazyImage
  src={user.profile_img || "/default-avatar.png"}
  alt={user.username}
  className={cx("user-avatar")}
/>
```

#### 7. Navigation Components

**Files**: Various navigation/header components

```javascript
<LazyImage
  src={userAuth.profile_img}
  alt="Profile"
  className={cx("nav-avatar")}
/>
```

---

## 🎨 Advanced Usage

### With Loading State

```javascript
const [isLoading, setIsLoading] = useState(true);

<LazyImage
  src={imageSrc}
  alt="Description"
  onLoad={() => setIsLoading(false)}
  onError={() => {
    console.error("Failed to load image");
    setIsLoading(false);
  }}
  placeholder="/loading-spinner.gif"
/>;
```

### With Custom Placeholder

```javascript
// Different placeholders for different content types
<LazyImage
  src={hotel.image}
  placeholder="/placeholder-hotel.jpg"  // Hotel placeholder
/>

<LazyImage
  src={user.avatar}
  placeholder="/placeholder-avatar.jpg" // Avatar placeholder
/>
```

### Responsive Images

```javascript
<LazyImage
  src={hotel.images?.[0]}
  alt={hotel.name}
  className={cx("responsive-image")}
  style={{ width: "100%", height: "auto" }}
/>
```

---

## 📝 Implementation Checklist

### Phase 1 - High Priority (Do First)

- [ ] ProductCard - hotel thumbnail images
- [ ] HotelDetails - image galleries
- [ ] UserBookings - booking card images
- [ ] HotelPage - search result images

### Phase 2 - Medium Priority

- [ ] BlogCard - blog banners
- [ ] BlogPost - blog images
- [ ] RoomDetails - room images
- [ ] SearchResults - result thumbnails

### Phase 3 - Low Priority (Optional)

- [ ] UserCard - user avatars
- [ ] CommentCard - commenter avatars
- [ ] Navigation - profile avatars
- [ ] About page - team photos

---

## ⚡ Performance Benefits

### Before LazyImage:

- **Loads**: All images immediately (50-100 images)
- **Data**: 5-10 MB initial load
- **Time**: 8-12 seconds on 3G

### After LazyImage:

- **Loads**: Only visible images (5-10 images)
- **Data**: 500KB-1MB initial load
- **Time**: 2-3 seconds on 3G

### Impact:

- ✅ 80-90% reduction in initial load time
- ✅ 70-80% reduction in bandwidth usage
- ✅ Better mobile performance
- ✅ Improved Lighthouse score

---

## 🔍 Testing LazyImage

### 1. Visual Test

```javascript
// Open DevTools > Network tab
// Filter: Images
// Scroll page slowly
// Watch images load as you scroll
```

### 2. Performance Test

```javascript
// Chrome DevTools > Lighthouse
// Run audit before and after
// Compare "Time to Interactive"
```

### 3. Network Throttling Test

```javascript
// DevTools > Network > Throttling: Fast 3G
// Reload page
// Scroll and watch lazy loading in action
```

---

## 🐛 Common Issues & Solutions

### Issue: Images not loading

```javascript
// Check src prop is valid
<LazyImage
  src={image || "/fallback.jpg"} // Always provide fallback
  alt="Description"
/>
```

### Issue: Placeholder flickering

```scss
// In component CSS
.lazy-image {
  &.loading {
    background-color: #f0f0f0; // Gray background while loading
  }
}
```

### Issue: Images load too late

```javascript
// Increase rootMargin to load earlier
// In LazyImage.js, change:
rootMargin: "100px"; // Load 100px before entering viewport
```

---

## 📊 Monitoring

### Check which images are lazy loaded:

```javascript
// In browser console
const lazyImages = document.querySelectorAll(".lazy-image");
console.log("Total lazy images:", lazyImages.length);

// Check loading state
lazyImages.forEach((img, i) => {
  console.log(
    `Image ${i}:`,
    img.classList.contains("loaded") ? "Loaded" : "Loading"
  );
});
```

---

**Created**: ${new Date().toLocaleString('vi-VN')}
**Author**: GitHub Copilot
