const express = require("express");
const mongoose = require("mongoose");
const {
  createReview,
  getReviewsForHotel,
  replyToReview,
  updateReview,
  deleteReview,
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

// IMPORTANT: More specific routes (with /reply) must come BEFORE generic :reviewId routes
// @route   PUT api/reviews/:reviewId/reply
// @desc    Add a partner's reply to a review
// @access  Private (Partner)
router.put("/:reviewId/reply", authMiddleWare, replyToReview);

// @route   PUT api/reviews/:reviewId
// @desc    Update a review (only by the review owner)
// @access  Private (User)
router.put("/:reviewId", authMiddleWare, updateReview);

// @route   DELETE api/reviews/:reviewId
// @desc    Delete a review (only by the review owner or admin)
// @access  Private (User/Admin)
router.delete("/:reviewId", authMiddleWare, deleteReview);

module.exports = router;
