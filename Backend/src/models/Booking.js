const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: ["flight", "hotel"],
      required: true,
    },
    flight: {
      type: Schema.Types.ObjectId,
      ref: "Flight",
      required: function () {
        return this.type === "flight";
      },
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: function () {
        return this.type === "hotel";
      },
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: function () {
        return this.type === "hotel";
      },
    },
    startDate: {
      type: Date,
      required: function () {
        return this.type === "hotel";
      },
    },
    endDate: {
      type: Date,
      required: function () {
        return this.type === "hotel";
      },
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "checked-in", "checked-out"],
      default: "pending",
    },
    // Guest Information
    guestName: {
      type: String,
      required: true,
    },
    guestPhone: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    numberOfAdults: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfChildren: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialRequests: {
      type: String,
      default: "",
    },
    // Payment Information
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "confirmed", "failed", "refunded"],
      default: "pending",
    },
    paymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["momo", "vnpay", "cash"],
    },
    // Cancellation Policy
    cancellableUntil: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
