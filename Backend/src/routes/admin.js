const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleWare = require("../middleWare/authMiddleWare");

const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin only." });
  }
};

// Platform Statistics
router.get(
  "/platform-stats",
  authMiddleWare,
  isAdmin,
  adminController.getPlatformStats
);

// User Management
router.get("/users", authMiddleWare, isAdmin, adminController.getAllUsers);
router.get("/users/:userId", authMiddleWare, isAdmin, adminController.getUser);
router.put(
  "/users/:userId",
  authMiddleWare,
  isAdmin,
  adminController.updateUser
);
router.delete(
  "/users/:userId",
  authMiddleWare,
  isAdmin,
  adminController.deleteUser
);
router.put(
  "/users/:userId/role",
  authMiddleWare,
  isAdmin,
  adminController.updateUserRole
);

// Partner Management
router.get(
  "/partners",
  authMiddleWare,
  isAdmin,
  adminController.getAllPartners
);
router.put(
  "/partners/:partnerId/status",
  authMiddleWare,
  isAdmin,
  adminController.updatePartnerStatus
);

// Hotel Management (Admin can view/manage all hotels)
router.get("/hotels", authMiddleWare, isAdmin, adminController.getAllHotels);
router.get(
  "/hotels/:hotelId",
  authMiddleWare,
  isAdmin,
  adminController.getHotel
);
router.delete(
  "/hotels/:hotelId",
  authMiddleWare,
  isAdmin,
  adminController.deleteHotel
);

// Booking Management
router.get(
  "/bookings",
  authMiddleWare,
  isAdmin,
  adminController.getAllBookings
);
router.get(
  "/bookings/:bookingId",
  authMiddleWare,
  isAdmin,
  adminController.getBooking
);

// Review Management
router.get("/reviews", authMiddleWare, isAdmin, adminController.getAllReviews);
router.delete(
  "/reviews/:reviewId",
  authMiddleWare,
  isAdmin,
  adminController.deleteReview
);

// Payment Management
router.get(
  "/payments",
  authMiddleWare,
  isAdmin,
  adminController.getAllPayments
);

// Blog Management
router.get("/blogs", authMiddleWare, isAdmin, adminController.getAllBlogs);
router.get("/blogs/:blogId", authMiddleWare, isAdmin, adminController.getBlog);
router.delete(
  "/blogs/:blogId",
  authMiddleWare,
  isAdmin,
  adminController.deleteBlog
);
router.put(
  "/blogs/:blogId/status",
  authMiddleWare,
  isAdmin,
  adminController.updateBlogStatus
);

// System Reports
router.get(
  "/reports/revenue",
  authMiddleWare,
  isAdmin,
  adminController.getRevenueReport
);
router.get(
  "/reports/bookings",
  authMiddleWare,
  isAdmin,
  adminController.getBookingsReport
);
router.get(
  "/reports/users",
  authMiddleWare,
  isAdmin,
  adminController.getUsersReport
);

module.exports = router;
