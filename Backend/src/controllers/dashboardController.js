const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const mongoose = require("mongoose");

const getDashboardStats = async (req, res) => {
  const partnerId = req.user.id;
  const { role } = req.user;

  if (role !== "partner") {
    return res.status(403).json({
      message: "Access denied. Only partners can view dashboard stats.",
    });
  }

  try {
    // Find all hotels owned by the partner
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        message: "No hotels found for this partner.",
        totalRevenue: 0,
        totalBookings: 0,
        occupancyRate: 0,
        averageRating: 0,
        totalReviews: 0,
        totalRooms: 0,
        revenueGrowth: 0,
        bookingGrowth: 0,
      });
    }

    // Calculate current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Previous month for growth calculation
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month stats
    const currentStats = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    // Last month stats for growth
    const lastMonthStats = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    // Calculate growth percentages
    const currentRevenue = currentStats[0]?.totalRevenue || 0;
    const lastRevenue = lastMonthStats[0]?.totalRevenue || 1;
    const revenueGrowth = (
      ((currentRevenue - lastRevenue) / lastRevenue) *
      100
    ).toFixed(1);

    const currentBookings = currentStats[0]?.totalBookings || 0;
    const lastBookings = lastMonthStats[0]?.totalBookings || 1;
    const bookingGrowth = (
      ((currentBookings - lastBookings) / lastBookings) *
      100
    ).toFixed(1);

    // Get total rooms
    const totalRooms = await Room.countDocuments({ hotel: { $in: hotelIds } });

    // Get currently booked rooms
    const activeBookings = await Booking.countDocuments({
      hotel: { $in: hotelIds },
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $in: ["confirmed", "checked-in"] },
    });

    const occupancyRate =
      totalRooms > 0 ? ((activeBookings / totalRooms) * 100).toFixed(1) : 0;

    // Get average rating from hotels
    const hotels = await Hotel.find({ partner: partnerId });
    const totalReviews = hotels.reduce(
      (sum, hotel) => sum + (hotel.reviewCount || 0),
      0
    );
    const avgRating =
      totalReviews > 0
        ? hotels.reduce(
            (sum, hotel) =>
              sum + (hotel.rating || 0) * (hotel.reviewCount || 0),
            0
          ) / totalReviews
        : 0;

    res.status(200).json({
      totalRevenue: currentRevenue,
      totalBookings: currentBookings,
      occupancyRate: parseFloat(occupancyRate),
      averageRating: avgRating,
      totalReviews: totalReviews,
      totalRooms: totalRooms,
      revenueGrowth: parseFloat(revenueGrowth),
      bookingGrowth: parseFloat(bookingGrowth),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching dashboard stats.",
      error: error.message,
    });
  }
};

// Get revenue analytics by period (day, week, month)
const getRevenueAnalytics = async (req, res) => {
  const partnerId = req.user.id;
  const { role } = req.user;
  const {
    period = "daily",
    hotelId,
    startDate: startParam,
    endDate: endParam,
  } = req.query;

  if (role !== "partner") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Filter by specific hotel if provided
    let targetHotelIds = hotelIds;
    if (hotelId && hotelId !== "all") {
      targetHotelIds = [mongoose.Types.ObjectId(hotelId)];
    }

    // Set date range (default last 30 days)
    let startDate = startParam
      ? new Date(startParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let endDate = endParam ? new Date(endParam) : new Date();

    // Configure grouping based on period
    let groupBy, dateFormat;
    if (period === "daily") {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
    } else if (period === "weekly") {
      groupBy = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
    } else {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    }

    const revenueData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: targetHotelIds },
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // Format data for charts
    const formattedData = revenueData.map((item) => {
      let date;
      if (period === "daily") {
        date = `${item._id.day}/${item._id.month}`;
      } else if (period === "weekly") {
        date = `Tuần ${item._id.week}/${item._id.year}`;
      } else {
        date = `${item._id.month}/${item._id.year}`;
      }

      return {
        date,
        revenue: item.revenue,
        bookings: item.bookings,
      };
    });

    res.status(200).json({ data: formattedData });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching revenue analytics",
      error: error.message,
    });
  }
};

// Get occupancy rate
const getOccupancyRate = async (req, res) => {
  const partnerId = req.user.id;
  const { role } = req.user;
  const { hotelId, startDate: startParam, endDate: endParam } = req.query;

  if (role !== "partner") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Filter by specific hotel if provided
    let targetHotelIds = hotelIds;
    if (hotelId && hotelId !== "all") {
      targetHotelIds = [mongoose.Types.ObjectId(hotelId)];
    }

    // Get total rooms
    const totalRooms = await Room.countDocuments({
      hotel: { $in: targetHotelIds },
    });

    // Get currently booked rooms (active bookings)
    const now = new Date();
    const activeBookings = await Booking.countDocuments({
      hotel: { $in: targetHotelIds },
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $in: ["confirmed", "checked-in"] },
    });

    const availableRooms = totalRooms - activeBookings;
    const occupancyRate =
      totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0;

    // Return data for both pie chart and stats
    const data = {
      occupancyRate,
      totalRooms,
      occupiedRooms: activeBookings,
      availableRooms,
      chartData: [
        { name: "Đã đặt", value: activeBookings },
        { name: "Còn trống", value: availableRooms },
      ],
    };

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating occupancy rate",
      error: error.message,
    });
  }
};

// Get top performing rooms
const getTopRooms = async (req, res) => {
  const partnerId = req.user.id;
  const { role } = req.user;
  const { limit = 5 } = req.query;

  if (role !== "partner") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const topRooms = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$room",
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      { $unwind: "$roomDetails" },
      {
        $lookup: {
          from: "hotels",
          localField: "roomDetails.hotel",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      { $unwind: "$hotelDetails" },
      {
        $project: {
          roomNumber: "$roomDetails.roomNumber",
          roomType: "$roomDetails.type",
          hotelName: "$hotelDetails.name",
          revenue: 1,
          bookings: 1,
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json({ data: topRooms });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching top rooms", error: error.message });
  }
};

// Get payment analytics
const getPaymentAnalytics = async (req, res) => {
  const partnerId = req.user.id;

  try {
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        totalPayments: 0,
        totalAmount: 0,
        byStatus: [],
        byMethod: [],
      });
    }

    // Get payment statistics by status
    const byStatus = await Booking.aggregate([
      { $match: { hotel: { $in: hotelIds } } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          amount: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Get payment statistics by method
    const byMethod = await Booking.aggregate([
      {
        $match: { hotel: { $in: hotelIds }, paymentMethod: { $exists: true } },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          amount: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Get total payments
    const totals = await Booking.aggregate([
      { $match: { hotel: { $in: hotelIds } } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.status(200).json({
      totalPayments: totals[0]?.totalPayments || 0,
      totalAmount: totals[0]?.totalAmount || 0,
      byStatus,
      byMethod,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment analytics",
      error: error.message,
    });
  }
};

// Get payment history with filters
const getPaymentHistory = async (req, res) => {
  const partnerId = req.user.id;
  const {
    page = 1,
    limit = 10,
    paymentStatus,
    paymentMethod,
    startDate,
    endDate,
    search,
  } = req.query;

  try {
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        payments: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });
    }

    // Build query
    const query = { hotel: { $in: hotelIds } };

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { paymentId: { $regex: search, $options: "i" } },
        { guestName: { $regex: search, $options: "i" } },
        { guestEmail: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Booking.find(query)
      .populate("hotel", "name")
      .populate("room", "roomNumber roomType")
      .populate("user", "personal_info.username personal_info.email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "paymentId paymentStatus paymentMethod totalPrice guestName guestEmail createdAt bookingDate startDate endDate"
      );

    const totalCount = await Booking.countDocuments(query);

    res.status(200).json({
      payments,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

// Export payment report as CSV
const exportPaymentReport = async (req, res) => {
  const partnerId = req.user.id;
  const { startDate, endDate, paymentStatus, paymentMethod } = req.query;

  try {
    const partnerHotels = await Hotel.find({ partner: partnerId }).select(
      "_id"
    );
    const hotelIds = partnerHotels.map((hotel) => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Build query
    const query = { hotel: { $in: hotelIds } };

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Booking.find(query)
      .populate("hotel", "name")
      .populate("room", "roomNumber roomType")
      .sort({ createdAt: -1 })
      .select(
        "paymentId paymentStatus paymentMethod totalPrice guestName guestEmail guestPhone createdAt bookingDate startDate endDate"
      );

    // Format data for export
    const exportData = payments.map((payment) => ({
      paymentId: payment.paymentId || "N/A",
      bookingDate: payment.bookingDate?.toLocaleDateString("vi-VN"),
      hotelName: payment.hotel?.name || "N/A",
      roomInfo: payment.room
        ? `${payment.room.roomNumber} - ${payment.room.roomType}`
        : "N/A",
      guestName: payment.guestName,
      guestEmail: payment.guestEmail,
      guestPhone: payment.guestPhone,
      checkIn: payment.startDate?.toLocaleDateString("vi-VN"),
      checkOut: payment.endDate?.toLocaleDateString("vi-VN"),
      totalPrice: payment.totalPrice,
      paymentMethod: payment.paymentMethod || "N/A",
      paymentStatus: payment.paymentStatus,
      createdAt: payment.createdAt?.toLocaleDateString("vi-VN"),
    }));

    res.status(200).json({ data: exportData });
  } catch (error) {
    res.status(500).json({
      message: "Error exporting payment report",
      error: error.message,
    });
  }
};

// Export Revenue Report
const exportRevenueReport = async (req, res) => {
  const partnerId = req.user.id;
  const { hotelId, startDate, endDate } = req.query;

  try {
    let query = {};

    // Filter by partner's hotels
    if (hotelId && hotelId !== "all") {
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res.status(403).json({ message: "Access denied to this hotel" });
      }
      query.hotel = hotelId;
    } else {
      const partnerHotels = await Hotel.find({ partner: partnerId }).select(
        "_id"
      );
      query.hotel = { $in: partnerHotels.map((h) => h._id) };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("hotel", "name")
      .populate("room", "roomNumber roomType")
      .sort({ createdAt: -1 })
      .select(
        "bookingDate startDate endDate totalPrice paymentStatus hotel room createdAt"
      );

    const exportData = bookings.map((booking) => ({
      date: booking.bookingDate?.toISOString().split("T")[0] || "N/A",
      hotelName: booking.hotel?.name || "N/A",
      roomNumber: booking.room?.roomNumber || "N/A",
      roomType: booking.room?.roomType || "N/A",
      checkIn: booking.startDate?.toISOString().split("T")[0] || "N/A",
      checkOut: booking.endDate?.toISOString().split("T")[0] || "N/A",
      revenue: booking.totalPrice || 0,
      status: booking.paymentStatus || "N/A",
    }));

    res.status(200).json({ data: exportData });
  } catch (error) {
    res.status(500).json({
      message: "Error exporting revenue report",
      error: error.message,
    });
  }
};

// Export Bookings Report
const exportBookingsReport = async (req, res) => {
  const partnerId = req.user.id;
  const { hotelId, startDate, endDate } = req.query;

  try {
    let query = {};

    if (hotelId && hotelId !== "all") {
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res.status(403).json({ message: "Access denied to this hotel" });
      }
      query.hotel = hotelId;
    } else {
      const partnerHotels = await Hotel.find({ partner: partnerId }).select(
        "_id"
      );
      query.hotel = { $in: partnerHotels.map((h) => h._id) };
    }

    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) query.bookingDate.$gte = new Date(startDate);
      if (endDate) query.bookingDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate("hotel", "name")
      .populate("room", "roomNumber roomType")
      .populate("user", "personal_info.username personal_info.email")
      .sort({ bookingDate: -1 })
      .select(
        "bookingDate startDate endDate guestName guestEmail guestPhone totalPrice status paymentStatus"
      );

    const exportData = bookings.map((booking) => ({
      bookingDate: booking.bookingDate?.toISOString().split("T")[0] || "N/A",
      hotelName: booking.hotel?.name || "N/A",
      roomNumber: booking.room?.roomNumber || "N/A",
      roomType: booking.room?.roomType || "N/A",
      guestName: booking.guestName || "N/A",
      guestEmail: booking.guestEmail || "N/A",
      guestPhone: booking.guestPhone || "N/A",
      checkIn: booking.startDate?.toISOString().split("T")[0] || "N/A",
      checkOut: booking.endDate?.toISOString().split("T")[0] || "N/A",
      totalPrice: booking.totalPrice || 0,
      bookingStatus: booking.status || "N/A",
      paymentStatus: booking.paymentStatus || "N/A",
    }));

    res.status(200).json({ data: exportData });
  } catch (error) {
    res.status(500).json({
      message: "Error exporting bookings report",
      error: error.message,
    });
  }
};

// Export Reviews Report
const exportReviewsReport = async (req, res) => {
  const partnerId = req.user.id;
  const { hotelId, startDate, endDate } = req.query;

  try {
    const Review = require("../models/Review");
    let hotelQuery = {};

    if (hotelId && hotelId !== "all") {
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res.status(403).json({ message: "Access denied to this hotel" });
      }
      hotelQuery._id = hotelId;
    } else {
      hotelQuery.partner = partnerId;
    }

    const hotels = await Hotel.find(hotelQuery).select("_id name");
    const hotelIds = hotels.map((h) => h._id);

    let query = { hotel: { $in: hotelIds } };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const reviews = await Review.find(query)
      .populate("hotel", "name")
      .populate("user", "personal_info.username personal_info.email")
      .sort({ createdAt: -1 })
      .select("rating comment createdAt partnerReply");

    const exportData = reviews.map((review) => ({
      date: review.createdAt?.toISOString().split("T")[0] || "N/A",
      hotelName: review.hotel?.name || "N/A",
      username: review.user?.personal_info?.username || "Anonymous",
      email: review.user?.personal_info?.email || "N/A",
      rating: review.rating || 0,
      comment: review.comment || "",
      partnerReply: review.partnerReply || "No reply",
    }));

    res.status(200).json({ data: exportData });
  } catch (error) {
    res.status(500).json({
      message: "Error exporting reviews report",
      error: error.message,
    });
  }
};

// Export Occupancy Report
const exportOccupancyReport = async (req, res) => {
  const partnerId = req.user.id;
  const { hotelId, startDate, endDate } = req.query;

  try {
    let hotelQuery = {};

    if (hotelId && hotelId !== "all") {
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res.status(403).json({ message: "Access denied to this hotel" });
      }
      hotelQuery._id = hotelId;
    } else {
      hotelQuery.partner = partnerId;
    }

    const hotels = await Hotel.find(hotelQuery).select("_id name");
    const exportData = [];

    for (const hotel of hotels) {
      const rooms = await Room.find({ hotel: hotel._id });
      const totalRooms = rooms.length;

      let bookingQuery = {
        hotel: hotel._id,
        status: { $in: ["confirmed", "checked-in"] },
      };

      if (startDate && endDate) {
        bookingQuery.$or = [
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) },
          },
        ];
      }

      const occupiedRooms = await Booking.distinct("room", bookingQuery);
      const occupancyRate =
        totalRooms > 0
          ? ((occupiedRooms.length / totalRooms) * 100).toFixed(2)
          : 0;

      exportData.push({
        hotelName: hotel.name,
        totalRooms: totalRooms,
        occupiedRooms: occupiedRooms.length,
        availableRooms: totalRooms - occupiedRooms.length,
        occupancyRate: `${occupancyRate}%`,
        period: `${startDate || "All"} to ${endDate || "All"}`,
      });
    }

    res.status(200).json({ data: exportData });
  } catch (error) {
    res.status(500).json({
      message: "Error exporting occupancy report",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getOccupancyRate,
  getTopRooms,
  getPaymentAnalytics,
  getPaymentHistory,
  exportPaymentReport,
  exportRevenueReport,
  exportBookingsReport,
  exportReviewsReport,
  exportOccupancyReport,
};
