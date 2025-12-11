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

module.exports = mongoose.model("Room", roomSchema);
