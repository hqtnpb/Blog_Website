# 🚀 Hướng Dẫn Tối Ưu Hiệu Suất Production

## 📊 Các Vấn Đề Đã Phát Hiện

### 🔴 VẤN ĐỀ NGHIÊM TRỌNG (Priority 1)

#### 1. **Render Free Tier - Cold Start Problem**

- **Vấn đề**: Render free tier đưa server vào "sleep mode" sau 15 phút không hoạt động
- **Hậu quả**: Request đầu tiên sau khi sleep có thể mất 30-60 giây để khởi động lại
- **Giải pháp**:

  ```javascript
  // Thêm vào backend/src/index.js

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date() });
  });

  // Keep-alive ping every 10 minutes (chỉ dùng nếu có plan trả phí)
  // HOẶC nâng cấp lên Render Starter plan ($7/month) để tránh sleep
  ```

#### 2. **MongoDB Queries Không Có Index**

- **Vấn đề**: Database queries đang quét toàn bộ collection
- **Hậu quả**: Mỗi query mất 2-5 giây thay vì 50-200ms
- **Giải pháp**: Thêm indexes vào MongoDB

#### 3. **Images Không Được Optimize**

- **Vấn đề**: Images không có lazy loading, không có compression
- **Hậu quả**: Load hàng MB images không cần thiết ngay từ đầu
- **Giải pháp**: Implement lazy loading và image optimization

#### 4. **No Caching Strategy**

- **Vấn đề**: Mọi request đều hit database, không có cache
- **Hậu quả**: Overload database và API
- **Giải pháp**: Implement caching layer

#### 5. **Bundle Size Quá Lớn**

- **Vấn đề**: React, MUI, Antd, Bootstrap cùng lúc → bundle ~3-5MB
- **Hậu quả**: Initial load chậm, đặc biệt trên mobile
- **Giải pháp**: Tree shaking, code splitting, loại bỏ thư viện duplicate

---

## 🛠️ GIẢI PHÁP CHI TIẾT

### 1️⃣ Backend Optimization

#### A. Thêm Database Indexes

```javascript
// File: backend/src/models/Hotel.js
// Thêm indexes cho Hotel model

hotelSchema.index({ city: 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ rooms: 1 });
hotelSchema.index({ city: 1, rating: -1 });
hotelSchema.index({ name: "text", city: "text", address: "text" });
```

```javascript
// File: backend/src/models/Room.js
// Thêm indexes cho Room model

roomSchema.index({ hotel: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ hotel: 1, pricePerNight: 1 });
```

```javascript
// File: backend/src/models/Booking.js
// Thêm indexes cho Booking model

bookingSchema.index({ room: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
```

#### B. Implement Caching với Node-Cache

```bash
cd backend
npm install node-cache
```

```javascript
// File: backend/src/utils/cache.js
const NodeCache = require("node-cache");

// Cache với TTL 5 phút cho hotels, 1 phút cho bookings
const hotelCache = new NodeCache({ stdTTL: 300 });
const bookingCache = new NodeCache({ stdTTL: 60 });

module.exports = { hotelCache, bookingCache };
```

#### C. Optimize Hotel Search Query

```javascript
// File: backend/src/controllers/searchController.js
// Wrap query với cache

const { hotelCache } = require("../utils/cache");

const searchHotels = async (req, res) => {
  const cacheKey = JSON.stringify(req.query);

  // Check cache first
  const cachedResult = hotelCache.get(cacheKey);
  if (cachedResult) {
    return res.status(200).json(cachedResult);
  }

  // ... existing query logic ...

  // Cache the result
  hotelCache.set(cacheKey, result);
  return res.status(200).json(result);
};
```

#### D. Implement Compression

```bash
cd backend
npm install compression
```

```javascript
// File: backend/src/index.js
const compression = require("compression");

app.use(compression()); // Thêm ngay sau app = express()
```

---

### 2️⃣ Frontend Optimization

#### A. Add Webpack Bundle Analyzer

```bash
cd frontend
npm install --save-dev webpack-bundle-analyzer
```

```javascript
// File: frontend/config-overrides.js
const { override, useBabelRc, addWebpackPlugin } = require("customize-cra");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");

module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "~": path.resolve(__dirname, "src"),
  };

  // Production optimizations
  if (env === "production") {
    // Gzip compression
    config.plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      })
    );

    // Analyze bundle (uncomment để xem)
    // config.plugins.push(
    //     new BundleAnalyzerPlugin({
    //         analyzerMode: 'static',
    //     })
    // );

    // Optimize chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: "mui",
            priority: 20,
          },
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: "antd",
            priority: 20,
          },
          editor: {
            test: /[\\/]node_modules[\\/]@editorjs[\\/]/,
            name: "editor",
            priority: 20,
          },
        },
      },
    };
  }

  return config;
};
```

#### B. Image Lazy Loading Component

```javascript
// File: frontend/src/components/LazyImage/LazyImage.js
import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./LazyImage.module.scss";

const cx = classNames.bind(styles);

function LazyImage({ src, alt, className, placeholder = "/placeholder.jpg" }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const imgRef = useRef();

  useEffect(() => {
    let observer;

    if (imgRef.current && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imgRef.current);
            }
          });
        },
        { rootMargin: "50px" }
      );

      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, imageSrc, placeholder]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cx("lazy-image", className, {
        loaded: imageSrc !== placeholder,
      })}
      loading="lazy"
    />
  );
}

export default LazyImage;
```

```scss
// File: frontend/src/components/LazyImage/LazyImage.module.scss
.lazy-image {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.loaded {
    opacity: 1;
  }
}
```

#### C. Optimize ProductCard Component

```javascript
// File: frontend/src/components/ProductCard/ProductCard.js
// Replace <img> with LazyImage

import LazyImage from "~/components/LazyImage";

// Trong component:
<LazyImage
  src={hotel.images?.[0] || "/default-hotel.jpg"}
  alt={hotel.name}
  className={cx("hotel-image")}
/>;
```

#### D. API Request Debouncing & Caching

```javascript
// File: frontend/src/utils/apiCache.js
const API_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  const cached = API_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  API_CACHE.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const clearCache = () => {
  API_CACHE.clear();
};
```

```javascript
// File: frontend/src/pages/HotelPage/HotelPage.js
// Sử dụng cache trong fetchHotels

import { getCachedData, setCachedData } from "~/utils/apiCache";

const fetchHotels = async () => {
  const cacheKey = `hotels_${selectedCity}_${priceRange}_${rating}_${sortBy}_${currentPage}`;

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    setHotels(cachedData);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    // ... existing fetch logic ...

    // Cache the result
    setCachedData(cacheKey, hotelsData);
    setHotels(hotelsData);
  } catch (error) {
    // ...
  } finally {
    setLoading(false);
  }
};
```

#### E. Remove Duplicate UI Libraries

```javascript
// Trong package.json, XÓA một trong những thư viện duplicate:

// GIỮ LẠI:
"@mui/material": "^6.4.5",  // Modern, tree-shakeable

// XÓA (nếu không dùng nhiều):
"antd": "^5.28.1",           // Antd nặng, chỉ giữ nếu dùng nhiều component
"react-bootstrap": "^2.10.10", // Bootstrap + MUI = duplicate
"bootstrap": "^5.3.8",
```

---

### 3️⃣ Netlify Configuration

```toml
# File: frontend/netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Enable asset optimization
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true

# Set caching headers
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### 4️⃣ Render Configuration

```yaml
# File: backend/render.yaml (tạo mới)
services:
  - type: web
    name: hotel-booking-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URL
        sync: false
      - key: JWT_SECRET
        sync: false
    healthCheckPath: /api/health
    autoDeploy: true
```

---

## 📈 KẾT QUẢ KỲ VỌNG

### Trước Optimize:

- Initial Load: 8-15 giây
- API Response: 2-5 giây
- Bundle Size: 3-5 MB
- Render Cold Start: 30-60 giây

### Sau Optimize:

- Initial Load: 2-4 giây (60% faster)
- API Response: 200-500ms (90% faster)
- Bundle Size: 1-2 MB (60% smaller)
- Render Cold Start: Giảm hoặc loại bỏ với health check

---

## 🎯 PRIORITY IMPLEMENTATION

### Phase 1 (Làm ngay - 1-2 giờ):

1. ✅ Thêm compression vào backend
2. ✅ Thêm MongoDB indexes
3. ✅ Implement basic caching
4. ✅ Add lazy loading cho images

### Phase 2 (Trong tuần - 3-4 giờ):

5. ✅ Optimize webpack config
6. ✅ Remove duplicate libraries
7. ✅ Add Netlify config
8. ✅ Setup health check endpoint

### Phase 3 (Long term - 1 ngày):

9. ✅ Migrate images to CDN (Cloudinary/imgix)
10. ✅ Consider upgrading Render plan ($7/month)
11. ✅ Implement Redis cache (nếu budget cho phép)
12. ✅ Setup monitoring (New Relic/Datadog)

---

## 💰 COST OPTIMIZATION

### Free Tier (Hiện tại):

- Netlify: Free (100GB bandwidth/month)
- Render: Free (750 hours/month, có sleep)
- **Vấn đề**: Render sleep sau 15 phút

### Recommended Paid ($7-10/month):

- Netlify: Free (đủ dùng)
- Render Starter: $7/month (no sleep, 400 build minutes)
- **Lợi ích**: Loại bỏ cold start, response luôn nhanh

---

## 🔍 MONITORING & TESTING

### Tools để test performance:

1. **Lighthouse** (Chrome DevTools)

   - Run trên: https://your-site.netlify.app
   - Target: Score > 90

2. **WebPageTest**

   - URL: https://www.webpagetest.org
   - Test từ multiple locations

3. **GTmetrix**
   - URL: https://gtmetrix.com
   - Monitor performance over time

### Commands:

```bash
# Build và analyze bundle
cd frontend
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Test Gzip compression
curl -H "Accept-Encoding: gzip" -I https://your-api.onrender.com/api/health
```

---

## 📝 CHECKLIST

- [ ] Backend: Add compression middleware
- [ ] Backend: Add MongoDB indexes
- [ ] Backend: Implement node-cache
- [ ] Backend: Add health check endpoint
- [ ] Frontend: Optimize webpack config
- [ ] Frontend: Add LazyImage component
- [ ] Frontend: Implement API caching
- [ ] Frontend: Remove duplicate libraries
- [ ] Deploy: Add netlify.toml
- [ ] Deploy: Add render.yaml
- [ ] Test: Run Lighthouse audit
- [ ] Monitor: Setup error tracking

---

**Tài liệu được tạo**: ${new Date().toLocaleString('vi-VN')}
**Bởi**: GitHub Copilot
