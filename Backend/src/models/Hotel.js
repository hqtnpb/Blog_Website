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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
