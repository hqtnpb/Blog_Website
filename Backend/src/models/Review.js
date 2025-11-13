const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // Each booking can only have one review
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    partnerReply: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexing for faster queries
reviewSchema.index({ hotel: 1 });

module.exports = mongoose.model("Review", reviewSchema);
