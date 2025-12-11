const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
const getAllHotels = async (req, res) => {
  try {
    const {
      city,
      checkinDate,
      checkoutDate,
      adults,
      children,
      roomCount,
      // New filters
      minPrice,
      maxPrice,
      stars, // e.g., "3,4,5"
      amenities, // e.g., "wifi,pool"
      sortBy, // e.g., "price-asc", "rating-desc"
    } = req.query;

    // Basic validation
    if (!city || !checkinDate || !checkoutDate || !adults || !roomCount) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin tìm kiếm bắt buộc." });
    }

    const searchAdults = parseInt(adults, 10);
    const searchChildren = parseInt(children, 10) || 0;
    const searchRoomCount = parseInt(roomCount, 10);
    const startDate = new Date(checkinDate);
    const endDate = new Date(checkoutDate);

    // Build the initial match stage for hotels
    const initialHotelMatch = { city: new RegExp(city, "i") };
    if (stars) {
      const starRatings = stars.split(",").map((s) => parseInt(s.trim(), 10));
      initialHotelMatch.rating = { $in: starRatings };
    }

    // Step 1: Find hotels matching city and star rating
    const hotelsInCity = await Hotel.find(initialHotelMatch).select("_id");
    if (!hotelsInCity.length) {
      return res.status(200).json([]); // No hotels match initial criteria
    }
    const hotelIdsInCity = hotelsInCity.map((h) => h._id);

    // Step 2: Find rooms that are booked in the given date range
    const overlappingBookings = await Booking.find({
      room: { $ne: null },
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: endDate, $gte: startDate } },
        { endDate: { $gt: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    }).select("room");

    const bookedRoomIds = overlappingBookings.map((b) => b.room);

    const pipeline = [
      // Step 1: Match hotels in the city and with the right rating
      { $match: { _id: { $in: hotelIdsInCity } } },
      // Step 2: Lookup all rooms for these hotels
      {
        $lookup: {
          from: "rooms",
          localField: "rooms",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      // Step 3: Unwind the rooms array to process each room
      { $unwind: "$roomDetails" },
      // Step 4: Filter out rooms that are already booked
      { $match: { "roomDetails._id": { $nin: bookedRoomIds } } },
    ];

    // Step 5: Apply room-level filters (price, amenities)
    const roomFilters = {};
    if (minPrice) {
      roomFilters["roomDetails.pricePerNight"] = {
        ...roomFilters["roomDetails.pricePerNight"],
        $gte: parseInt(minPrice, 10),
      };
    }
    if (maxPrice) {
      roomFilters["roomDetails.pricePerNight"] = {
        ...roomFilters["roomDetails.pricePerNight"],
        $lte: parseInt(maxPrice, 10),
      };
    }
    if (amenities) {
      const amenitiesList = amenities.split(",").map((a) => a.trim());
      roomFilters["roomDetails.amenities"] = { $all: amenitiesList };
    }
    if (Object.keys(roomFilters).length > 0) {
      pipeline.push({ $match: roomFilters });
    }

    // Step 6: Group by hotel to aggregate available rooms and their combined capacity
    pipeline.push({
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        address: { $first: "$address" },
        city: { $first: "$city" },
        country: { $first: "$country" },
        images: { $first: "$images" },
        rating: { $first: "$rating" },
        availableRooms: { $push: "$roomDetails" },
        totalAdultCapacity: { $sum: "$roomDetails.maxAdults" },
        totalChildCapacity: { $sum: "$roomDetails.maxChildren" },
        availableRoomCount: { $sum: 1 },
        minRoomPrice: { $min: "$roomDetails.pricePerNight" },
      },
    });

    // Step 7: Filter hotels based on aggregated capacity and room count
    pipeline.push({
      $match: {
        availableRoomCount: { $gte: searchRoomCount },
        totalAdultCapacity: { $gte: searchAdults },
        totalChildCapacity: { $gte: searchChildren },
      },
    });

    // Step 8: Add sorting
    const sortStage = {};
    if (sortBy === "price-asc") {
      sortStage.minRoomPrice = 1;
    } else if (sortBy === "price-desc") {
      sortStage.minRoomPrice = -1;
    } else if (sortBy === "rating-desc") {
      sortStage.rating = -1;
    }
    if (Object.keys(sortStage).length > 0) {
      pipeline.push({ $sort: sortStage });
    }

    // Step 9: Project final fields
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        address: 1,
        city: 1,
        country: 1,
        images: 1,
        rating: 1,
        minRoomPrice: 1,
        // Optionally return the specific rooms that are available
        availableRooms: 1,
      },
    });

    const availableHotels = await Hotel.aggregate(pipeline);

    res.status(200).json(availableHotels);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get a single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("rooms");
    if (!hotel) {
      return res.status(404).json({ message: "Không tìm thấy khách sạn" });
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
};
