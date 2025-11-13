const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

const bookingController = {
    createBooking: async (req, res) => {
        try {
            const { roomId, startDate, endDate } = req.body;
            const userId = req.user.id;

            if (!roomId || !startDate || !endDate) {
                return res.status(400).json({ message: "Please provide roomId, startDate, and endDate." });
            }

            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: "Room not found." });
            }

            // Check for overlapping bookings
            const overlappingBooking = await Booking.findOne({
                room: roomId,
                status: { $in: ['pending', 'confirmed'] },
                $or: [
                    { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } },
                    { endDate: { $gt: new Date(startDate), $lte: new Date(endDate) } },
                    { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } }
                ]
            });

            if (overlappingBooking) {
                return res.status(409).json({ message: "Room is not available for the selected dates." });
            }

            // Calculate total price
            const start = new Date(startDate);
            const end = new Date(endDate);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (nights <= 0) {
                return res.status(400).json({ message: "End date must be after start date." });
            }
            const totalPrice = nights * room.pricePerNight;

            // Create new booking
            const newBooking = new Booking({
                user: userId,
                hotel: room.hotel,
                room: roomId,
                type: 'hotel',
                startDate: start,
                endDate: end,
                totalPrice,
                status: 'confirmed' // Or 'pending' if you have a payment flow
            });

            const savedBooking = await newBooking.save();

            // Add booking to room's bookings array
            room.bookings.push(savedBooking._id);
            await room.save();

            res.status(201).json(savedBooking);

        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },

    getUserBookings: async (req, res) => {
        try {
            const userId = req.user.id;

            const bookings = await Booking.find({ user: userId })
                .populate({
                    path: 'room',
                    populate: {
                        path: 'hotel',
                        select: 'name address city country images'
                    }
                })
                .populate({
                    path: 'flight',
                    populate: {
                        path: 'airline',
                        select: 'name logo'
                    }
                })
                .sort({ createdAt: -1 });

            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },

    getPartnerBookings: async (req, res) => {
        try {
            const partnerId = req.user.id;

            const bookings = await Booking.aggregate([
                {
                    $lookup: {
                        from: 'rooms',
                        localField: 'room',
                        foreignField: '_id',
                        as: 'roomDetails'
                    }
                },
                { $unwind: { path: "$roomDetails", preserveNullAndEmptyArrays: true } }, // Keep flight bookings
                {
                    $lookup: {
                        from: 'hotels',
                        localField: 'roomDetails.hotel',
                        foreignField: '_id',
                        as: 'hotelDetails'
                    }
                },
                { $unwind: { path: "$hotelDetails", preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        'hotelDetails.partner': new mongoose.Types.ObjectId(partnerId)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        startDate: 1,
                        endDate: 1,
                        totalPrice: 1,
                        bookingDate: 1,
                        type: 1,
                        room: {
                            _id: '$roomDetails._id',
                            roomNumber: '$roomDetails.roomNumber',
                            type: '$roomDetails.type'
                        },
                        hotel: {
                            _id: '$hotelDetails._id',
                            name: '$hotelDetails.name'
                        },
                        user: {
                            _id: '$userDetails._id',
                            fullName: '$userDetails.personal_info.fullName',
                            email: '$userDetails.personal_info.email'
                        }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]);

            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const userId = req.user.id;

            const booking = await Booking.findOne({ _id: bookingId, user: userId });

            if (!booking) {
                return res.status(404).json({ message: "Booking not found or you do not have access to it." });
            }

            if (booking.status === 'cancelled') {
                return res.status(400).json({ message: "Booking has already been cancelled." });
            }

            // Optionally, add logic here to prevent cancellation if the check-in date is too close or in the past

            booking.status = 'cancelled';
            const updatedBooking = await booking.save();

            // Remove the booking reference from the room if it's a hotel booking
            if (booking.type === 'hotel' && booking.room) {
                await Room.findByIdAndUpdate(booking.room, { $pull: { bookings: booking._id } });
            }

            res.status(200).json(updatedBooking);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },

    getHotelBookings: async (req, res) => {
        try {
            const { hotelId } = req.params;
            const partnerId = req.user.id;

            // Check if the partner owns the hotel
            const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
            if (!hotel) {
                return res.status(403).json({ message: "You are not authorized to view bookings for this hotel." });
            }

            const bookings = await Booking.find({ hotel: hotelId })
                .populate('user', 'personal_info.fullName personal_info.email')
                .populate('room', 'roomNumber type')
                .sort({ createdAt: -1 });

            res.status(200).json(bookings);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },

    updateBookingStatus: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const { status } = req.body;
            const partnerId = req.user.id;

            if (!status) {
                return res.status(400).json({ message: "Status is required." });
            }

            const booking = await Booking.findById(bookingId).populate('hotel');

            if (!booking) {
                return res.status(404).json({ message: "Booking not found." });
            }

            // Check if the booking is for a hotel and the partner owns it
            if (!booking.hotel || booking.hotel.partner.toString() !== partnerId) {
                return res.status(403).json({ message: "You are not authorized to update this booking." });
            }

            booking.status = status;
            const updatedBooking = await booking.save();

            res.status(200).json(updatedBooking);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },

    getBookingById: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const userId = req.user.id;

            const booking = await Booking.findOne({ _id: bookingId, user: userId })
                .populate({
                    path: 'room',
                    populate: {
                        path: 'hotel',
                        select: 'name address city country images'
                    }
                })
                .populate({
                    path: 'flight',
                    populate: {
                        path: 'airline',
                        select: 'name logo'
                    }
                });

            if (!booking) {
                return res.status(404).json({ message: "Booking not found or you do not have access to it." });
            }

            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    },
};

module.exports = bookingController;
