const mongoose = require("mongoose");
const { Schema } = mongoose;

const flightSchema = new mongoose.Schema(
    {
        airline: {
            type: Schema.Types.ObjectId,
            ref: "Airline",
            required: true,
        },
        flightNumber: {
            type: String,
            required: true,
            unique: true,
        },
        departureAirport: {
            type: String,
            required: true,
        },
        arrivalAirport: {
            type: String,
            required: true,
        },
        departureTime: {
            type: Date,
            required: true,
        },
        arrivalTime: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        availableSeats: {
            type: Number,
            required: true,
        },
        bookings: [
            {
                type: Schema.Types.ObjectId,
                ref: "Booking",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);
