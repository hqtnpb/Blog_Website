const Review = require("../models/Review");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// Utility function to update hotel's average rating
const updateHotelRating = async (hotelId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { hotel: new mongoose.Types.ObjectId(hotelId) },
      },
      {
        $group: {
          _id: "$hotel",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (stats.length > 0) {
      await Hotel.findByIdAndUpdate(hotelId, {
        rating: stats[0].avgRating,
      });
    } else {
      // If there are no reviews, reset the rating
      await Hotel.findByIdAndUpdate(hotelId, {
        rating: 0, // Or your preferred default
      });
    }
  } catch (error) {
    console.error(`Error updating rating for hotel ${hotelId}:`, error);
    // Handle error appropriately
  }
};

// 1. CREATE A REVIEW
const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const userId = req.user.id; // from auth middleware

  if (!bookingId || !rating || !comment) {
    return res.status(400).json({ message: "Rating, comment, and bookingId are required." });
  }

  try {
    // Check if a review for this booking already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(403).json({ message: "You have already reviewed this booking." });
    }

    // Find the booking to validate
    const booking = await Booking.findById(bookingId);

    // Validate booking
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Check if the user making the review is the one who made the booking
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to review this booking." });
    }

    // Optional: Check if the booking is completed (checkout date is in the past)
    if (new Date(booking.endDate) > new Date()) {
        return res.status(403).json({ message: "You can only review after your stay is complete." });
    }

    // Create and save the new review
    const newReview = new Review({
      hotel: booking.hotel,
      user: userId,
      booking: bookingId,
      rating,
      comment,
    });

    const savedReview = await newReview.save();

    // Update the hotel's average rating
    await updateHotelRating(booking.hotel);

    res.status(201).json({ message: "Review submitted successfully!", review: savedReview });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating review.", error: error.message });
  }
};

// 2. GET REVIEWS FOR A HOTEL
const getReviewsForHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    // First, check if the hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const reviews = await Review.find({ hotel: hotelId })
      .populate("user", "personal_info.username personal_info.profile_img") // Populate user info
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching reviews.", error: error.message });
  }
};

// 3. PARTNER REPLIES TO A REVIEW
const replyToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { replyText } = req.body;
  const partnerId = req.user.id; // from auth middleware

  if (!replyText) {
    return res.status(400).json({ message: "Reply text is required." });
  }

  try {
    const review = await Review.findById(reviewId).populate('hotel');

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Check if the logged-in user is the partner of the hotel
    if (review.hotel.partner.toString() !== partnerId) {
      return res.status(403).json({ message: "You are not authorized to reply to this review." });
    }

    review.partnerReply = replyText;
    const updatedReview = await review.save();

    res.status(200).json({ message: "Reply posted successfully.", review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: "Server error while replying to review.", error: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsForHotel,
  replyToReview,
};
