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

// Platform Statistics
export const getPlatformStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/platform-stats`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch platform stats" };
  }
};

// User Management
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

export const getUser = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/users/${userId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch user" };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}`,
      userData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update user" };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/admin/users/${userId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete user" };
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/role`,
      { role },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update user role" };
  }
};

// Partner Management
export const getAllPartners = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/partners`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch partners" };
  }
};

export const updatePartnerStatus = async (partnerId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/partners/${partnerId}/status`,
      { status },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to update partner status" }
    );
  }
};

// Hotel Management
export const getAllHotelsAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/hotels`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch hotels" };
  }
};

export const getHotelAdmin = async (hotelId) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/hotels/${hotelId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch hotel" };
  }
};

export const deleteHotelAdmin = async (hotelId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/admin/hotels/${hotelId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete hotel" };
  }
};

// Booking Management
export const getAllBookingsAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/bookings`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch bookings" };
  }
};

export const getBookingAdmin = async (bookingId) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/bookings/${bookingId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch booking" };
  }
};

// Review Management
export const getAllReviewsAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/reviews`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch reviews" };
  }
};

export const deleteReviewAdmin = async (reviewId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/admin/reviews/${reviewId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete review" };
  }
};

// Payment Management
export const getAllPaymentsAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/payments`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch payments" };
  }
};

// System Reports
export const getRevenueReport = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/reports/revenue`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch revenue report" };
  }
};

export const getBookingsReport = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/reports/bookings`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch bookings report" }
    );
  }
};

export const getUsersReport = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/reports/users`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users report" };
  }
};

// Blog Management
export const getAllBlogsAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/blogs`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch blogs" };
  }
};

export const getBlogAdmin = async (blogId) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/blogs/${blogId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch blog" };
  }
};

export const deleteBlogAdmin = async (blogId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/admin/blogs/${blogId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete blog" };
  }
};

export const updateBlogStatus = async (blogId, draft) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/blogs/${blogId}/status`,
      { draft },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update blog status" };
  }
};
