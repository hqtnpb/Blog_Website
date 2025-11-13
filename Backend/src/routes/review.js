const express = require("express");
const mongoose = require("mongoose");
const {
    createReview,
    getReviewsForHotel,
    replyToReview,
} = require("../controllers/reviewController");
const authMiddleWare = require("../middleWare/authMiddleWare");
// Note: You might need a specific middleware to check for the 'partner' role.
// For now, the role check is handled in the controller.

const router = express.Router();

// @route   POST api/reviews
// @desc    Create a new review for a booking
// @access  Private (User)
router.post("/", authMiddleWare, createReview);

// @route   GET api/reviews/hotel/:hotelId
// @desc    Get all reviews for a specific hotel
// @access  Public
router.get("/hotel/:hotelId", getReviewsForHotel);

// @route   PUT api/reviews/:reviewId/reply
// @desc    Add a partner's reply to a review
// @access  Private (Partner)
router.put("/:reviewId/reply", authMiddleWare, replyToReview);

module.exports = router;
