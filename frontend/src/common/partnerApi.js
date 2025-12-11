import axios from "axios";

const API_URL = process.env.REACT_APP_SERVER_DOMAIN;

// Helper to get auth header
const getAuthHeader = () => {
  const user = sessionStorage.getItem("user");
  if (user) {
    const { accessToken } = JSON.parse(user);
    return { headers: { Authorization: `Bearer ${accessToken}` } };
  }
  return {};
};

// Dashboard Stats API
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/dashboard/stats`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch dashboard stats" }
    );
  }
};

// Partner Hotels API
export const getPartnerHotels = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/partner/hotels`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch hotels" };
  }
};

// Partner Bookings API
export const getPartnerBookings = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/partner/bookings`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch bookings" };
  }
};

// Update Booking Status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/bookings/${bookingId}`,
      { status },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to update booking status" }
    );
  }
};

// Hotel CRUD APIs
export const createHotel = async (hotelData) => {
  try {
    const response = await axios.post(
      `${API_URL}/partner/hotel`,
      hotelData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create hotel" };
  }
};

export const updateHotel = async (hotelId, hotelData) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/hotel/${hotelId}`,
      hotelData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update hotel" };
  }
};

export const deleteHotel = async (hotelId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/partner/hotel/${hotelId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete hotel" };
  }
};

// Room CRUD APIs
export const createRoom = async (hotelId, roomData) => {
  try {
    const response = await axios.post(
      `${API_URL}/partner/hotel/${hotelId}/room`,
      roomData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create room" };
  }
};

export const updateRoom = async (hotelId, roomId, roomData) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/hotel/${hotelId}/room/${roomId}`,
      roomData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update room" };
  }
};

export const deleteRoom = async (hotelId, roomId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/partner/hotel/${hotelId}/room/${roomId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete room" };
  }
};

// Review APIs
export const getHotelReviews = async (hotelId) => {
  try {
    const response = await axios.get(
      `${API_URL}/reviews/hotel/${hotelId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch reviews" };
  }
};

export const replyToReview = async (reviewId, replyText) => {
  try {
    const response = await axios.put(
      `${API_URL}/reviews/${reviewId}/reply`,
      { replyText },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to reply to review" };
  }
};

// Calendar APIs
export const getCalendarBookings = async (hotelId, month, year) => {
  try {
    const response = await axios.get(`${API_URL}/partner/calendar/${hotelId}`, {
      params: { month, year },
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch calendar data" };
  }
};

// Analytics APIs
export const getRevenueAnalytics = async ({
  hotelId,
  startDate,
  endDate,
  period = "daily",
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (hotelId && hotelId !== "all") params.append("hotelId", hotelId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (period) params.append("period", period);

    const response = await axios.get(
      `${API_URL}/dashboard/revenue-analytics?${params.toString()}`,
      getAuthHeader()
    );
    return response.data.data || [];
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch revenue analytics" }
    );
  }
};

export const getOccupancyRate = async ({
  hotelId,
  startDate,
  endDate,
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (hotelId && hotelId !== "all") params.append("hotelId", hotelId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axios.get(
      `${API_URL}/dashboard/occupancy-rate?${params.toString()}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch occupancy rate" };
  }
};

export const getTopRooms = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/top-rooms`, {
      params: { limit },
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch top rooms" };
  }
};

// Profile APIs
export const getProfile = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/partner/profile`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/profile`,
      profileData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

export const updateAvatar = async (imageUrl) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/avatar`,
      { profile_img: imageUrl },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update avatar" };
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/change-password`,
      { currentPassword, newPassword },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};

// Notification APIs
export const getNotifications = async (
  page = 1,
  filter = "all",
  limit = 10
) => {
  try {
    const response = await axios.get(`${API_URL}/partner/notifications`, {
      params: { page, filter, limit },
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notifications" };
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/partner/notifications/unread-count`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch unread count" };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/notifications/${notificationId}/read`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark as read" };
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axios.put(
      `${API_URL}/partner/notifications/mark-all-read`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark all as read" };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/partner/notifications/${notificationId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete notification" };
  }
};

// Payment APIs
export const getPaymentAnalytics = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/dashboard/payment-analytics`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch payment analytics" }
    );
  }
};

export const getPaymentHistory = async (page = 1, filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/payment-history`, {
      params: { page, limit: 10, ...filters },
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch payment history" }
    );
  }
};

export const exportPayments = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/export-payments`, {
      params: filters,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to export payments" };
  }
};

// Report Export APIs
export const exportRevenueReport = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/export-revenue`, {
      params: filters,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to export revenue report" }
    );
  }
};

export const exportBookingsReport = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/export-bookings`, {
      params: filters,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to export bookings report" }
    );
  }
};

export const exportReviewsReport = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/export-reviews`, {
      params: filters,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to export reviews report" }
    );
  }
};

export const exportOccupancyReport = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/export-occupancy`, {
      params: filters,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to export occupancy report" }
    );
  }
};
