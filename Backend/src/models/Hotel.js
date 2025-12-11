const mongoose = require("mongoose");
const { Schema } = mongoose;

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: "users", // Reference to the User model
      required: true,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room", // Reference to the Room model
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: [
        "Hotel",
        "Apartment",
        "Resort",
        "Villa",
        "Hostel",
        "Guesthouse",
        "Cottage",
      ],
      default: "Hotel",
    },
    distanceFromCenter: {
      type: Number, // in km
      default: 0,
    },
    // Amenities
    hasFreeWifi: {
      type: Boolean,
      default: false,
    },
    hasPool: {
      type: Boolean,
      default: false,
    },
    hasParking: {
      type: Boolean,
      default: false,
    },
    hasGym: {
      type: Boolean,
      default: false,
    },
    hasSpa: {
      type: Boolean,
      default: false,
    },
    hasRestaurant: {
      type: Boolean,
      default: false,
    },
    hasBar: {
      type: Boolean,
      default: false,
    },
    hasAC: {
      type: Boolean,
      default: false,
    },
    hasRoomService: {
      type: Boolean,
      default: false,
    },
    has24HourFrontDesk: {
      type: Boolean,
      default: false,
    },
    hasAirportShuttle: {
      type: Boolean,
      default: false,
    },
    hasBeachAccess: {
      type: Boolean,
      default: false,
    },
    hasBreakfast: {
      type: Boolean,
      default: false,
    },
    hasMetro: {
      type: Boolean,
      default: false,
    },
    // Booking options
    freeCancellation: {
      type: Boolean,
      default: false,
    },
    breakfastIncluded: {
      type: Boolean,
      default: false,
    },
    noPrePayment: {
      type: Boolean,
      default: false,
    },
    // Pricing
    discount: {
      type: Number,
      default: 0,
    },
    originalPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
