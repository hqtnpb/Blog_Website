const router = require("express").Router();
const hotelController = require("../controllers/hotelController");

// GET all hotels
router.get("/", hotelController.getAllHotels);

// GET a single hotel by ID
router.get("/:id", hotelController.getHotelById);

module.exports = router;
