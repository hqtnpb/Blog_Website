const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const verifyJWT = require("../middleWare/authMiddleWare");

// @route   POST /api/booking
// @desc    Create a new hotel booking
// @access  Private
router.post("/", verifyJWT, bookingController.createBooking);

// @route   GET /api/booking
// @desc    Get all bookings for the current user
// @access  Private
router.get("/", verifyJWT, bookingController.getUserBookings);

// @route   PUT /api/booking/:bookingId/cancel
// @desc    Cancel a booking
// @access  Private
router.put("/:bookingId/cancel", verifyJWT, bookingController.cancelBooking);

// @route   GET /api/booking/:bookingId
// @desc    Get a specific booking by ID
// @access  Private
router.get("/:bookingId", verifyJWT, bookingController.getBookingById);

// @route   GET /api/booking/check-availability
// @desc    Check if a room is available for given dates
// @access  Public
router.get("/check/availability", bookingController.checkAvailability);

module.exports = router;
