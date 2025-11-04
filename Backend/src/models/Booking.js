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
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
