const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const mongoose = require("mongoose");

const getDashboardStats = async (req, res) => {
  const partnerId = req.user.id;
  const { role } = req.user;

  if (role !== "partner") {
    return res.status(403).json({ message: "Access denied. Only partners can view dashboard stats." });
  }

  try {
    // Find all hotels owned by the partner
    const partnerHotels = await Hotel.find({ partner: partnerId }).select("_id");
    const hotelIds = partnerHotels.map(hotel => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ 
        message: "No hotels found for this partner.",
        stats: { totalRevenue: 0, totalBookings: 0, recentBookings: [], revenueByHotel: [] }
      });
    }

    // 1. Calculate Total Revenue and Total Bookings
    const generalStats = await Booking.aggregate([
      { $match: { hotel: { $in: hotelIds } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    // 2. Get recent bookings (e.g., last 5)
    const recentBookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate("user", "username")
      .populate("hotel", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Calculate revenue per hotel
    const revenueByHotel = await Booking.aggregate([
        { $match: { hotel: { $in: hotelIds } } },
        {
          $group: {
            _id: "$hotel",
            revenue: { $sum: "$totalPrice" },
          },
        },
        {
            $lookup: { // Join with hotels collection to get hotel name
                from: "hotels",
                localField: "_id",
                foreignField: "_id",
                as: "hotelDetails"
            }
        },
        {
            $unwind: "$hotelDetails"
        },
        {
            $project: { // Select the fields to return
                _id: 0,
                hotelId: "$_id",
                hotelName: "$hotelDetails.name",
                revenue: "$revenue"
            }
        }
      ]);

    const stats = {
      totalRevenue: generalStats[0]?.totalRevenue || 0,
      totalBookings: generalStats[0]?.totalBookings || 0,
      recentBookings,
      revenueByHotel,
    };

    res.status(200).json({ message: "Stats fetched successfully", stats });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching dashboard stats.", error: error.message });
  }
};

module.exports = { getDashboardStats };
