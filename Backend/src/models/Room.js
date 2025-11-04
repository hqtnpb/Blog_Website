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
        pricePerNight: {
            type: Number,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
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
