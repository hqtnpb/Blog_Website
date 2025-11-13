const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const verifyJWT = require("../middleWare/authMiddleWare");

// @route   POST /api/bookings
// @desc    Create a new hotel booking
// @access  Private
router.post("/", verifyJWT, bookingController.createBooking);

// @route   GET /api/bookings
// @desc    Get all bookings for the current user
// @access  Private
router.get("/", verifyJWT, bookingController.getUserBookings);

// @route   PUT /api/bookings/:bookingId/cancel
// @desc    Cancel a booking
// @access  Private
router.put("/:bookingId/cancel", verifyJWT, bookingController.cancelBooking);

// @route   GET /api/bookings/:bookingId
// @desc    Get a specific booking by ID
// @access  Private
router.get("/:bookingId", verifyJWT, bookingController.getBookingById);




module.exports = router;
