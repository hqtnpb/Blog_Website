const mongoose = require("mongoose");
const Review = require("../models/Review");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const User = require("../models/User");
const {
  sendNotificationToUser,
  sendNotificationToUsers,
  NotificationTypes,
  createNotification,
} = require("../utils/notificationHelper");

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
    // Error updating hotel rating - handled silently
  }
};

// 1. CREATE A REVIEW
const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const userId = req.user.id; // from auth middleware

  if (!bookingId || !rating || !comment) {
    return res
      .status(400)
      .json({ message: "Đánh giá, bình luận và mã đặt phòng là bắt buộc." });
  }

  try {
    // Check if a review for this booking already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res
        .status(403)
        .json({ message: "Bạn đã đánh giá đặt phòng này rồi." });
    }

    // Find the booking to validate
    const booking = await Booking.findById(bookingId);

    // Validate booking
    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đặt phòng." });
    }

    // Check if the user making the review is the one who made the booking
    if (booking.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền đánh giá đặt phòng này." });
    }

    // Optional: Check if the booking is completed (checkout date is in the past)
    if (new Date(booking.endDate) > new Date()) {
      return res.status(403).json({
        message: "Bạn chỉ có thể đánh giá sau khi hoàn thành lưu trú.",
      });
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

    // Send notification to hotel partner about new review
    try {
      const hotel = await Hotel.findById(booking.hotel).select("name partner");

      if (hotel && hotel.partner) {
        const partnerNotification = createNotification(
          NotificationTypes.REVIEW_RECEIVED,
          "Đánh giá mới cho khách sạn",
          `Khách sạn ${hotel.name} nhận được đánh giá ${rating} sao: "${comment.substring(0, 80)}..."`,
          {
            hotelId: booking.hotel,
            hotelName: hotel.name,
            reviewId: savedReview._id,
            rating,
            comment: comment.substring(0, 100),
          }
        );
        sendNotificationToUser(hotel.partner, partnerNotification);
      }

      // Also notify admins
      const admins = await User.find({ "personal_info.role": "admin" }).select(
        "_id"
      );
      const adminIds = admins.map((admin) => admin._id);

      const adminNotification = createNotification(
        NotificationTypes.REVIEW_RECEIVED,
        "Đánh giá mới",
        `Khách sạn ${hotel?.name || "Hotel"} nhận được đánh giá ${rating} sao`,
        {
          hotelId: booking.hotel,
          hotelName: hotel?.name,
          reviewId: savedReview._id,
          rating,
          comment: comment.substring(0, 100),
        }
      );
      sendNotificationToUsers(adminIds, adminNotification);
    } catch (notifError) {
      console.error("❌ Failed to send notification:", notifError);
    }

    res.status(201).json({
      message: "Đánh giá đã được gửi thành công!",
      review: savedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ khi tạo đánh giá.",
      error: error.message,
    });
  }
};

// 2. GET REVIEWS FOR A HOTEL
const getReviewsForHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    // First, check if the hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Không tìm thấy khách sạn." });
    }

    const reviews = await Review.find({ hotel: hotelId })
      .populate("user", "personal_info.username personal_info.profile_img") // Populate user info
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ khi tải đánh giá.",
      error: error.message,
    });
  }
};

// 3. PARTNER REPLIES TO A REVIEW
const replyToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { replyText } = req.body;
  const partnerId = req.user.id; // from auth middleware

  if (!replyText) {
    return res.status(400).json({ message: "Nội dung phản hồi là bắt buộc." });
  }

  try {
    const review = await Review.findById(reviewId).populate("hotel");

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá." });
    }

    // Check if the logged-in user is the partner of the hotel
    if (review.hotel.partner.toString() !== partnerId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền phản hồi đánh giá này." });
    }

    review.partnerReply = replyText;
    const updatedReview = await review.save();

    // Send notification to the reviewer about partner's reply
    try {
      const booking = await Booking.findById(review.booking).select("user");
      if (booking && booking.user) {
        const notification = createNotification(
          NotificationTypes.REVIEW_RECEIVED,
          "Khách sạn đã phản hồi đánh giá",
          `${review.hotel.name} đã phản hồi đánh giá của bạn: "${replyText.substring(0, 80)}..."`,
          {
            reviewId: review._id,
            hotelId: review.hotel._id,
            hotelName: review.hotel.name,
            reply: replyText.substring(0, 100),
          }
        );
        sendNotificationToUser(booking.user, notification);
      }
    } catch (notifError) {
      console.error("❌ Failed to send reply notification:", notifError);
    }

    res.status(200).json({
      message: "Phản hồi đã được đăng thành công.",
      review: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi máy chủ khi phản hồi đánh giá.",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviewsForHotel,
  replyToReview,
};
