const express = require("express");
const {
  getDashboardStats,
  getRevenueAnalytics,
  getOccupancyRate,
  getTopRooms,
  getPaymentAnalytics,
  getPaymentHistory,
  exportPaymentReport,
  exportRevenueReport,
  exportBookingsReport,
  exportReviewsReport,
  exportOccupancyReport,
} = require("../controllers/dashboardController");
const authMiddleWare = require("../middleWare/authMiddleWare");

const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics for a partner
// @access  Private (Partner)
router.get("/stats", authMiddleWare, getDashboardStats);

// @route   GET api/dashboard/revenue-analytics
// @desc    Get revenue analytics by period
// @access  Private (Partner)
router.get("/revenue-analytics", authMiddleWare, getRevenueAnalytics);

// @route   GET api/dashboard/occupancy-rate
// @desc    Get current occupancy rate
// @access  Private (Partner)
router.get("/occupancy-rate", authMiddleWare, getOccupancyRate);

// @route   GET api/dashboard/top-rooms
// @desc    Get top performing rooms
// @access  Private (Partner)
router.get("/top-rooms", authMiddleWare, getTopRooms);

// @route   GET api/dashboard/payment-analytics
// @desc    Get payment analytics
// @access  Private (Partner)
router.get("/payment-analytics", authMiddleWare, getPaymentAnalytics);

// @route   GET api/dashboard/payment-history
// @desc    Get payment history with filters
// @access  Private (Partner)
router.get("/payment-history", authMiddleWare, getPaymentHistory);

// @route   GET api/dashboard/export-payments
// @desc    Export payment report
// @access  Private (Partner)
router.get("/export-payments", authMiddleWare, exportPaymentReport);

// @route   GET api/dashboard/export-revenue
// @desc    Export revenue report
// @access  Private (Partner)
router.get("/export-revenue", authMiddleWare, exportRevenueReport);

// @route   GET api/dashboard/export-bookings
// @desc    Export bookings report
// @access  Private (Partner)
router.get("/export-bookings", authMiddleWare, exportBookingsReport);

// @route   GET api/dashboard/export-reviews
// @desc    Export reviews report
// @access  Private (Partner)
router.get("/export-reviews", authMiddleWare, exportReviewsReport);

// @route   GET api/dashboard/export-occupancy
// @desc    Export occupancy report
// @access  Private (Partner)
router.get("/export-occupancy", authMiddleWare, exportOccupancyReport);

module.exports = router;
