// Simple in-memory cache for API responses
const API_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

/**
 * Get cached data if it exists and is not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if not found/expired
 */
export const getCachedData = (key) => {
  const cached = API_CACHE.get(key);

  if (!cached) {
    return null;
  }

  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    API_CACHE.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * Set data in cache with current timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
export const setCachedData = (key, data, ttl = CACHE_DURATION) => {
  API_CACHE.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });

  // Auto cleanup expired entries
  setTimeout(() => {
    const cached = API_CACHE.get(key);
    if (cached && Date.now() - cached.timestamp > cached.ttl) {
      API_CACHE.delete(key);
    }
  }, ttl);
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCacheEntry = (key) => {
  API_CACHE.delete(key);
};

/**
 * Clear all cache entries
 */
export const clearCache = () => {
  API_CACHE.clear();
  console.log("🗑️ Frontend cache cleared");
};

/**
 * Clear cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'hotels_')
 */
export const clearCacheByPattern = (pattern) => {
  const keys = Array.from(API_CACHE.keys());
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      API_CACHE.delete(key);
    }
  });
  console.log(`🗑️ Cleared cache entries matching: ${pattern}`);
};

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export const getCacheStats = () => {
  return {
    size: API_CACHE.size,
    keys: Array.from(API_CACHE.keys()),
  };
};

// Clear cache when user logs out or session changes
export const setupCacheListeners = () => {
  // Listen for storage events (logout, session clear)
  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key === "user" || e.key === "access_token") {
      clearCache();
    }
  });

  // Clear cache on page unload if needed
  window.addEventListener("beforeunload", () => {
    // Optionally clear cache on page reload
    // clearCache();
  });
};

export default {
  getCachedData,
  setCachedData,
  clearCacheEntry,
  clearCache,
  clearCacheByPattern,
  getCacheStats,
  setupCacheListeners,
};
