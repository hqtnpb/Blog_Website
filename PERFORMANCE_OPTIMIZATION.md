# Performance Optimization Guide

## ✅ Đã Implement

### 1. Image Optimization

- **Lazy Loading**: Tất cả images đều có `loading="lazy"` (trừ above-the-fold images dùng `loading="eager"`)
- **Alt Text**: Tất cả images đều có alt text đầy đủ cho accessibility & SEO
- **Width/Height**: Đã thêm width/height attributes để tránh layout shift
- **Proper Dimensions**: Images đã được set kích thước phù hợp

### 2. Code Splitting

- **LazyDateRange**: DateRange component được lazy load chỉ khi cần thiết
- Giảm initial bundle size đáng kể

### 3. Video Optimization

- **preload="metadata"**: Chỉ load metadata thay vì toàn bộ video
- **playsInline**: Better mobile experience
- **Controls conditional**: Chỉ hiển thị controls khi đang play

### 4. HTML Optimization

- **Preconnect**: Đã thêm preconnect cho Google Fonts
- **DNS Prefetch**: Tối ưu DNS resolution
- **Meta Description**: SEO-friendly description
- **Theme Color**: Đúng brand color (#FF5B26)

## 📊 Expected Lighthouse Improvements

### Before:

- Performance: ~40-50
- Best Practices: ~70
- Accessibility: ~75
- SEO: ~80

### After (Expected):

- Performance: **75-85+**
- Best Practices: **90+**
- Accessibility: **95+**
- SEO: **95+**

## 🚀 Cách Test Performance

### 1. Build Production

```bash
cd frontend
npm run build
```

### 2. Serve Production Build

```bash
npx serve -s build
```

### 3. Run Lighthouse

- Mở Chrome DevTools (F12)
- Chọn tab "Lighthouse"
- Chọn "Performance", "Best Practices", "Accessibility", "SEO"
- Click "Analyze page load"

## 🔧 Tối Ưu Thêm (Nếu Cần)

### 1. Image Format Optimization

```bash
# Convert images to WebP
npm install sharp --save-dev
```

### 2. Font Optimization

- Sử dụng font-display: swap
- Subset fonts chỉ lấy characters cần thiết

### 3. Service Worker (PWA)

```bash
# Enable service worker in production
# Đã có sẵn với CRA
```

### 4. Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

### 5. CDN & Caching

- Deploy static assets lên CDN
- Configure proper cache headers

## 📝 Checklist Performance

- [x] Images có lazy loading
- [x] Images có alt text
- [x] Images có width/height
- [x] Video có preload="metadata"
- [x] DateRange lazy loaded
- [x] HTML có preconnect fonts
- [x] Meta tags optimization
- [ ] Minify CSS/JS (auto bởi build)
- [ ] Gzip/Brotli compression (server config)
- [ ] CDN setup (deployment)
- [ ] Service Worker enabled (PWA)

## 🎯 Key Metrics to Watch

1. **FCP (First Contentful Paint)**: < 1.8s
2. **LCP (Largest Contentful Paint)**: < 2.5s
3. **CLS (Cumulative Layout Shift)**: < 0.1
4. **TTI (Time to Interactive)**: < 3.8s
5. **TBT (Total Blocking Time)**: < 200ms

## 💡 Tips

1. **Test on slow 3G**: Simulate slow connection trong Chrome DevTools
2. **Test on mobile**: Mobile performance thường thấp hơn desktop
3. **Clear cache**: Test với cache clear để thấy first load performance
4. **Monitor**: Sử dụng Chrome User Experience Report để track real-world performance

## 🐛 Common Issues & Solutions

### Issue: Images still loading slowly

**Solution**: Convert to WebP, optimize file size

### Issue: Large bundle size

**Solution**: Analyze bundle, code split thêm routes

### Issue: Slow first load

**Solution**: Enable service worker, preload critical resources

### Issue: Poor mobile performance

**Solution**: Reduce image sizes cho mobile, lazy load more aggressively
