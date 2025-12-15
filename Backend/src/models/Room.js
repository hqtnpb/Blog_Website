const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      default: "",
    },
    roomType: {
      type: String,
      enum: [
        "Standard",
        "Deluxe",
        "Suite",
        "Executive",
        "Family Room",
        "Twin Room",
        "Double Room",
      ],
      default: "Standard",
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    pricePerDay: {
      type: Number,
      default: 0,
    },
    bookingTypes: {
      type: [String],
      enum: ["night", "day", "both"],
      default: ["night"],
    },
    maxAdults: {
      type: Number,
      required: true,
    },
    maxChildren: {
      type: Number,
      required: true,
      default: 0,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  { timestamps: true }
);

// Add indexes for better query performance
roomSchema.index({ hotel: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ hotel: 1, pricePerNight: 1 });
roomSchema.index({ hotel: 1, roomType: 1 });

module.exports = mongoose.model("Room", roomSchema);
