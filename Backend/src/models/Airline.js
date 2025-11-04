const mongoose = require("mongoose");
const { Schema } = mongoose;

const airlineSchema = new mongoose.Schema(
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
        logo: {
            type: String,
        },
        flights: [
            {
                type: Schema.Types.ObjectId,
                ref: "Flight", // Reference to the Flight model
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Airline", airlineSchema);
