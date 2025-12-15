const NodeCache = require("node-cache");

// Cache với TTL khác nhau cho các loại data
const hotelCache = new NodeCache({
  stdTTL: 300, // 5 phút cho hotels (thay đổi ít)
  checkperiod: 320, // Check expired keys mỗi 320 giây
  useClones: false, // Tăng performance, cẩn thận với mutations
});

const bookingCache = new NodeCache({
  stdTTL: 60, // 1 phút cho bookings (thay đổi nhiều)
  checkperiod: 70,
  useClones: false,
});

const searchCache = new NodeCache({
  stdTTL: 180, // 3 phút cho search results
  checkperiod: 200,
  useClones: false,
});

// Helper để tạo cache key consistent
const createCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `${prefix}_${JSON.stringify(sortedParams)}`;
};

// Clear cache functions
const clearHotelCache = () => {
  hotelCache.flushAll();
  console.log("🗑️ Hotel cache cleared");
};

const clearBookingCache = () => {
  bookingCache.flushAll();
  console.log("🗑️ Booking cache cleared");
};

const clearAllCaches = () => {
  hotelCache.flushAll();
  bookingCache.flushAll();
  searchCache.flushAll();
  console.log("🗑️ All caches cleared");
};

// Stats logging (useful for debugging)
const logCacheStats = () => {
  console.log("📊 Cache Stats:");
  console.log("  Hotels:", hotelCache.getStats());
  console.log("  Bookings:", bookingCache.getStats());
  console.log("  Search:", searchCache.getStats());
};

module.exports = {
  hotelCache,
  bookingCache,
  searchCache,
  createCacheKey,
  clearHotelCache,
  clearBookingCache,
  clearAllCaches,
  logCacheStats,
};
