const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// Helper function to normalize Vietnamese text for flexible search
const normalizeVietnamese = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
};

// Get all unique cities that have hotels
const getCities = async (req, res) => {
  try {
    const { query } = req.query;

    // Get distinct cities from hotels
    let cities = await Hotel.distinct("city");

    // Filter cities if query provided
    if (query && query.trim()) {
      const normalizedQuery = normalizeVietnamese(query);
      cities = cities.filter((city) => {
        const normalizedCity = normalizeVietnamese(city);
        return normalizedCity.includes(normalizedQuery);
      });
    }

    // Sort alphabetically
    cities.sort((a, b) => a.localeCompare(b, "vi"));

    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return res.status(500).json({
      success: false,
      error: "Không thể lấy danh sách thành phố",
    });
  }
};

// Search hotels with advanced filters - REFACTORED with Aggregation Pipeline
const searchHotels = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sort = "recommended",
      filters,
      checkIn,
      checkOut,
      adults: requestedAdults,
      children: requestedChildren,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Calculate total guests from adults and children
    const totalGuests =
      (parseInt(requestedAdults) || 0) + (parseInt(requestedChildren) || 0);

    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (e) {
        // Failed to parse filters
      }
    }

    //
    // ===== 1. Build Initial Match Query for Hotels =====
    //
    const initialMatch = {};
    const andConditions = [];

    // --- Text Search with Vietnamese normalization ---
    if (query && query.trim().length >= 2) {
      const normalizedQuery = normalizeVietnamese(query.trim());
      const originalRegex = new RegExp(query.trim(), "i");

      // First try to match original query (handles exact or similar matches)
      andConditions.push({
        $or: [
          { name: originalRegex },
          { city: originalRegex },
          { country: originalRegex },
          { address: originalRegex },
        ],
      });
    }

    // --- Property Type Filter ---
    if (parsedFilters.propertyType && parsedFilters.propertyType.length > 0) {
      andConditions.push({ type: { $in: parsedFilters.propertyType } });
    }

    // --- Star Rating & Guest Review Rating ---
    // Combine star rating and guest review rating into one logic block
    if (parsedFilters.propertyClass && parsedFilters.propertyClass.length > 0) {
      const stars = parsedFilters.propertyClass
        .map((s) => parseInt(s) || 0)
        .filter((s) => s > 0);
      if (stars.length > 0) {
        // Include hotels with specified stars OR no rating field
        andConditions.push({
          $or: [
            { rating: { $in: stars } },
            { rating: { $exists: false } },
            { rating: null },
          ],
        });
      }
    } else if (
      parsedFilters.guestReview &&
      parsedFilters.guestReview.length > 0
    ) {
      const minRating = Math.min(
        ...parsedFilters.guestReview.map((r) => parseFloat(r) || 0)
      );
      if (minRating > 0) {
        // Include hotels with rating >= minRating OR no rating field
        andConditions.push({
          $or: [
            { rating: { $gte: minRating } },
            { rating: { $exists: false } },
            { rating: null },
          ],
        });
      }
    }

    // --- Amenities Filter (AND logic) ---
    if (parsedFilters.amenities && parsedFilters.amenities.length > 0) {
      const amenityFilters = [];
      parsedFilters.amenities.forEach((amenity) => {
        // Map frontend amenity names to database fields
        const amenityMap = {
          "Wi-Fi": "hasFreeWifi",
          "Air Conditioning": "hasAC",
          Pool: "hasPool",
          "Free Parking": "hasParking",
          Gym: "hasGym",
          Restaurant: "hasRestaurant",
          Bar: "hasBar",
          "Breakfast Included": "hasBreakfast",
          "Room Service": "hasRoomService",
          "24-hour Front Desk": "has24HourFrontDesk",
          "Airport Shuttle": "hasAirportShuttle",
          "Private Beach Area": "hasBeachAccess",
        };

        const dbField = amenityMap[amenity];
        if (dbField) {
          amenityFilters.push({ [dbField]: true });
        }
      });
      if (amenityFilters.length > 0) {
        andConditions.push(...amenityFilters);
      }
    }

    if (andConditions.length > 0) {
      initialMatch.$and = andConditions;
    }

    //
    // ===== 2. Find Booked Room IDs for Date Range =====
    //
    let bookedRoomIds = [];
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const overlappingBookings = await Booking.find({
        status: { $in: ["pending", "confirmed"] },
        $or: [
          { startDate: { $lt: endDate, $gte: startDate } },
          { endDate: { $gt: startDate, $lte: endDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
        ],
      }).select("room");

      bookedRoomIds = overlappingBookings.map((b) => b.room);
    }

    //
    // ===== 3. Build the Aggregation Pipeline =====
    //
    const pipeline = [];
    pipeline.push({ $match: initialMatch });

    // --- Look up all rooms for the matched hotels ---
    pipeline.push({
      $lookup: {
        from: "rooms", // The name of the Room collection in MongoDB
        localField: "rooms",
        foreignField: "_id",
        as: "roomsData",
      },
    });

    // --- Unwind the rooms array to process each room ---
    // Use preserveNullAndEmptyArrays to keep hotels without rooms
    pipeline.push({
      $unwind: {
        path: "$roomsData",
        preserveNullAndEmptyArrays: false, // Changed to false - only hotels with rooms
      },
    });

    // --- Filter rooms by availability and guest capacity ---
    const roomMatchConditions = {
      "roomsData._id": { $nin: bookedRoomIds },
    };
    if (totalGuests > 0) {
      roomMatchConditions.$expr = {
        $gte: [
          { $add: ["$roomsData.maxAdults", "$roomsData.maxChildren"] },
          totalGuests,
        ],
      };
    }
    pipeline.push({ $match: roomMatchConditions });

    // --- Group back by hotel, collecting available rooms and finding min price ---
    pipeline.push({
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
        availableRooms: { $push: "$roomsData" },
        minRoomPrice: { $min: "$roomsData.pricePerNight" },
      },
    });

    // --- Replace the root to reshape the document ---
    pipeline.push({
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$doc",
            {
              availableRooms: "$availableRooms",
              minRoomPrice: "$minRoomPrice",
              hasAvailability: { $gt: [{ $size: "$availableRooms" }, 0] },
              totalRooms: { $size: "$doc.rooms" }, // Keep total number of rooms
            },
          ],
        },
      },
    });

    // --- Remove fields that are not needed anymore ---
    pipeline.push({
      $project: {
        roomsData: 0, // remove the intermediate field
      },
    });

    // --- Filter by price range and availability ---
    const postGroupMatch = { hasAvailability: true };
    // Only apply price filters if explicitly set and not default values
    if (parsedFilters.minPrice && parseInt(parsedFilters.minPrice) > 0) {
      postGroupMatch.minRoomPrice = {
        ...postGroupMatch.minRoomPrice,
        $gte: parseInt(parsedFilters.minPrice),
      };
    }
    if (
      parsedFilters.maxPrice &&
      parseInt(parsedFilters.maxPrice) < 100000000
    ) {
      postGroupMatch.minRoomPrice = {
        ...postGroupMatch.minRoomPrice,
        $lte: parseInt(parsedFilters.maxPrice),
      };
    }
    pipeline.push({ $match: postGroupMatch });

    // --- Sorting ---
    let sortQuery = {};
    switch (sort) {
      case "price-low":
        sortQuery = { minRoomPrice: 1 };
        break;
      case "price-high":
        sortQuery = { minRoomPrice: -1 };
        break;
      case "rating-high":
        sortQuery = { rating: -1 };
        break;
      case "rating-low":
        sortQuery = { rating: 1 };
        break;
      default:
        sortQuery = { rating: -1, createdAt: -1 };
    }
    pipeline.push({ $sort: sortQuery });

    // --- Facet for pagination and total count ---
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limitNum }],
        total: [{ $count: "count" }],
      },
    });

    //
    // ===== 4. Execute the pipeline =====
    //
    let results = await Hotel.aggregate(pipeline);

    let data = results[0].data;
    let total = results[0].total.length > 0 ? results[0].total[0].count : 0;

    // Post-filter for Vietnamese text normalization if needed
    if (query && query.trim().length >= 2) {
      const normalizedQuery = normalizeVietnamese(query.trim());

      // Additional filter for normalized Vietnamese text
      data = data.filter((hotel) => {
        const normalizedName = normalizeVietnamese(hotel.name || "");
        const normalizedCity = normalizeVietnamese(hotel.city || "");
        const normalizedCountry = normalizeVietnamese(hotel.country || "");
        const normalizedAddress = normalizeVietnamese(hotel.address || "");

        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedCity.includes(normalizedQuery) ||
          normalizedCountry.includes(normalizedQuery) ||
          normalizedAddress.includes(normalizedQuery) ||
          // Also keep original regex matches
          hotel.name?.toLowerCase().includes(query.trim().toLowerCase()) ||
          hotel.city?.toLowerCase().includes(query.trim().toLowerCase()) ||
          hotel.country?.toLowerCase().includes(query.trim().toLowerCase()) ||
          hotel.address?.toLowerCase().includes(query.trim().toLowerCase())
        );
      });

      total = data.length;
    }

    return res.status(200).json({
      success: true,
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("❌ Error searching hotels:", error);
    return res.status(500).json({
      success: false,
      error: "Không thể tìm kiếm khách sạn",
      message: error.message,
    });
  }
};

// Search rooms
const searchRooms = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ rooms: [] });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const rooms = await Room.find({
      $or: [
        { roomNumber: searchRegex },
        { type: searchRegex },
        { title: searchRegex },
        { desc: searchRegex },
        { roomType: searchRegex },
      ],
    })
      .populate("hotel", "name city country")
      .limit(10)
      .select(
        "roomNumber type title desc pricePerNight maxAdults maxChildren hotel images"
      )
      .lean();

    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("❌ Error searching rooms:", error);
    return res.status(500).json({ error: "Không thể tìm kiếm phòng" });
  }
};

// Search bookings
const searchBookings = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ bookings: [] });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    // Try to find bookings by booking ID or status
    const bookings = await Booking.find({
      $or: [{ bookingId: searchRegex }, { status: searchRegex }],
    })
      .populate("user", "personal_info.fullname personal_info.email")
      .populate("room", "title price")
      .populate({
        path: "room",
        populate: {
          path: "hotel",
          select: "name city",
        },
      })
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error searching bookings:", error);
    return res.status(500).json({ error: "Không thể tìm kiếm đặt phòng" });
  }
};

module.exports = {
  searchHotels,
  searchRooms,
  searchBookings,
  getCities,
};
