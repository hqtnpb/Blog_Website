const router = require("express").Router();
const searchController = require("../controllers/searchController");

// Search routes - PUBLIC (no authentication required)
// These routes are available to all users for searching hotels, rooms, and bookings

router.get("/search-hotels", searchController.searchHotels);
router.get("/search-rooms", searchController.searchRooms);
router.get("/search-bookings", searchController.searchBookings);
router.get("/cities", searchController.getCities);

module.exports = router;
