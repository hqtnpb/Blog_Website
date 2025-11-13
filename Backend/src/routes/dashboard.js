const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const authMiddleWare = require("../middleWare/authMiddleWare");

const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics for a partner
// @access  Private (Partner)
router.get("/stats", authMiddleWare, getDashboardStats);

module.exports = router;
