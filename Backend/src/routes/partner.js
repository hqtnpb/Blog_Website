const partnerController = require("../controllers/partnerController");
const bookingController = require("../controllers/bookingController");
const router = require("express").Router();
const  verifyJWT  = require("../middleWare/authMiddleWare");

// Middleware to check if the user is a partner
const isPartner = (req, res, next) => {
    if (req.user && req.user.role === 'partner') {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Not a partner." });
    }
};

// Hotel Routes
router.post("/hotel", verifyJWT, isPartner, partnerController.createHotel);
router.get("/hotel/:hotelId", verifyJWT, isPartner, partnerController.getHotel);
router.put("/hotel/:hotelId", verifyJWT, isPartner, partnerController.updateHotel);
router.delete("/hotel/:hotelId", verifyJWT, isPartner, partnerController.deleteHotel);
router.get("/hotels", verifyJWT, isPartner, partnerController.getPartnerHotels);

// Room Routes
router.post("/hotel/:hotelId/room", verifyJWT, isPartner, partnerController.createRoom);
router.get("/hotel/:hotelId/room/:roomId", verifyJWT, isPartner, partnerController.getRoom);
router.put("/hotel/:hotelId/room/:roomId", verifyJWT, isPartner, partnerController.updateRoom);
router.delete("/hotel/:hotelId/room/:roomId", verifyJWT, isPartner, partnerController.deleteRoom);

// Booking Routes for Partner
router.get("/bookings", verifyJWT, isPartner, bookingController.getPartnerBookings);
router.put("/bookings/:bookingId", verifyJWT, isPartner, bookingController.updateBookingStatus);

module.exports = router;
