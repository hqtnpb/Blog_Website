const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const User = require("../models/User");

const partnerController = {
    // Hotel CRUD Operations
    createHotel: async (req, res) => {
        try {
            const { name, description, address, city, country, images } = req.body;
            const partnerId = req.user._id; // Assuming user ID is available from verifyJWT

            // Check if partner already has a hotel
            const existingHotel = await Hotel.findOne({ partner: partnerId });
            if (existingHotel) {
                return res.status(400).json({ error: "Partner can only create one hotel." });
            }

            const newHotel = new Hotel({
                name,
                partner: partnerId,
                description,
                address,
                city,
                country,
                images,
            });

            const savedHotel = await newHotel.save();

            // Optionally, update the User model to reference the created Hotel
            await User.findByIdAndUpdate(partnerId, { $set: { 'partner_info.hotel': savedHotel._id } });

            res.status(201).json(savedHotel);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getHotel: async (req, res) => {
        try {
            const { hotelId } = req.params;
            const partnerId = req.user._id;

            const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId }).populate("rooms");

            if (!hotel) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            res.status(200).json(hotel);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateHotel: async (req, res) => {
        try {
            const { hotelId } = req.params;
            const partnerId = req.user._id;
            const { name, description, address, city, country, images } = req.body;

            const updatedHotel = await Hotel.findOneAndUpdate(
                { _id: hotelId, partner: partnerId },
                { $set: { name, description, address, city, country, images } },
                { new: true }
            );

            if (!updatedHotel) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            res.status(200).json(updatedHotel);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteHotel: async (req, res) => {
        try {
            const { hotelId } = req.params;
            const partnerId = req.user._id;

            // Find the hotel to ensure it belongs to the partner
            const hotelToDelete = await Hotel.findOne({ _id: hotelId, partner: partnerId });
            if (!hotelToDelete) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            // Delete all rooms associated with this hotel
            await Room.deleteMany({ hotel: hotelId });

            // Delete the hotel
            await Hotel.deleteOne({ _id: hotelId });

            // Optionally, remove the hotel reference from the User model
            await User.findByIdAndUpdate(partnerId, { $unset: { 'partner_info.hotel': 1 } });

            res.status(200).json({ message: "Hotel and associated rooms deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPartnerHotels: async (req, res) => {
        try {
            const partnerId = req.user._id;
            const hotels = await Hotel.find({ partner: partnerId }).populate("rooms");
            res.status(200).json(hotels);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Room CRUD Operations
    createRoom: async (req, res) => {
        try {
            const { hotelId } = req.params;
            const partnerId = req.user._id;
            const { roomNumber, type, pricePerNight, capacity, amenities, images } = req.body;

            // Verify the hotel belongs to the partner
            const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
            if (!hotel) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            // Check if roomNumber already exists for this hotel
            const existingRoom = await Room.findOne({ hotel: hotelId, roomNumber });
            if (existingRoom) {
                return res.status(400).json({ error: "Room number already exists for this hotel." });
            }

            const newRoom = new Room({
                hotel: hotelId,
                roomNumber,
                type,
                pricePerNight,
                capacity,
                amenities,
                images,
            });

            const savedRoom = await newRoom.save();

            // Add room to hotel's rooms array
            hotel.rooms.push(savedRoom._id);
            await hotel.save();

            res.status(201).json(savedRoom);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getRoom: async (req, res) => {
        try {
            const { hotelId, roomId } = req.params;
            const partnerId = req.user._id;

            // Verify the hotel belongs to the partner
            const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
            if (!hotel) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            const room = await Room.findOne({ _id: roomId, hotel: hotelId });

            if (!room) {
                return res.status(404).json({ error: "Room not found or does not belong to this hotel." });
            }

            res.status(200).json(room);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateRoom: async (req, res) => {
        try {
            const { hotelId, roomId } = req.params;
            const partnerId = req.user._id;
            const { roomNumber, type, pricePerNight, capacity, amenities, images } = req.body;

            // Verify the hotel belongs to the partner
            const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
            if (!hotel) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            const updatedRoom = await Room.findOneAndUpdate(
                { _id: roomId, hotel: hotelId },
                { $set: { roomNumber, type, pricePerNight, capacity, amenities, images } },
                { new: true }
            );

            if (!updatedRoom) {
                return res.status(404).json({ error: "Room not found or does not belong to this hotel." });
            }

            res.status(200).json(updatedRoom);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteRoom: async (req, res) => {
        try {
            const { hotelId, roomId } = req.params;
            const partnerId = req.user._id;

            // Verify the hotel belongs to the partner
            const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
            if (!hotel) {
                return res.status(404).json({ error: "Hotel not found or you do not have access." });
            }

            const deletedRoom = await Room.findOneAndDelete({ _id: roomId, hotel: hotelId });

            if (!deletedRoom) {
                return res.status(404).json({ error: "Room not found or does not belong to this hotel." });
            }

            // Remove room from hotel's rooms array
            hotel.rooms.pull(roomId);
            await hotel.save();

            res.status(200).json({ message: "Room deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = partnerController;
