const router = require("express").Router();
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");

// Check room availability
router.get("/:roomId/check-availability", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Find all bookings for this room that overlap with the requested dates
    const overlappingBookings = await Booking.find({
      room: roomId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          // Booking starts during requested period
          startDate: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
        },
        {
          // Booking ends during requested period
          endDate: {
            $gt: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
        {
          // Booking spans entire requested period
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) },
        },
      ],
    });

    const isAvailable = overlappingBookings.length === 0;

    return res.json({
      success: true,
      isAvailable,
      conflictingBookings: overlappingBookings.length,
      message: isAvailable
        ? "Room is available for the selected dates"
        : "Room is not available for the selected dates",
    });
  } catch (error) {
    console.error("Error checking room availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking availability",
      error: error.message,
    });
  }
});

module.exports = router;
