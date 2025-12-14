const User = require("../models/User");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Room = require("../models/Room");
const Blog = require("../models/Blog");

const adminController = {
  // Platform Statistics
  getPlatformStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({
        "personal_info.role": "user",
      });
      const totalPartners = await User.countDocuments({
        "personal_info.role": "partner",
      });
      const totalHotels = await Hotel.countDocuments();
      const totalRooms = await Room.countDocuments();
      const totalBookings = await Booking.countDocuments();
      const totalReviews = await Review.countDocuments();

      // Revenue stats
      const revenueStats = await Booking.aggregate([
        {
          $match: { paymentStatus: "completed" },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            avgBookingValue: { $avg: "$totalPrice" },
          },
        },
      ]);

      // Recent bookings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentBookings = await Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Active bookings
      const activeBookings = await Booking.countDocuments({
        status: { $in: ["confirmed", "pending"] },
        endDate: { $gte: new Date() },
      });

      res.status(200).json({
        users: totalUsers,
        partners: totalPartners,
        hotels: totalHotels,
        rooms: totalRooms,
        bookings: totalBookings,
        reviews: totalReviews,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        avgBookingValue: revenueStats[0]?.avgBookingValue || 0,
        recentBookings,
        activeBookings,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Lỗi khi tải thống kê", details: error.message });
    }
  },

  // User Management
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        search,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      const filter = {};
      if (role) filter["personal_info.role"] = role;
      if (search) {
        filter.$or = [
          { "personal_info.email": { $regex: search, $options: "i" } },
          { "personal_info.username": { $regex: search, $options: "i" } },
          { "personal_info.fullname": { $regex: search, $options: "i" } },
        ];
      }

      const sortOrder = order === "asc" ? 1 : -1;
      const sortOptions = { [sortBy]: sortOrder };

      const users = await User.find(filter)
        .select("-password -google_auth")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await User.countDocuments(filter);

      res.status(200).json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải danh sách người dùng",
        details: error.message,
      });
    }
  },

  getUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      // Get user's bookings and reviews
      const bookings = await Booking.find({ user: userId })
        .populate("hotel", "name")
        .populate("room", "roomType")
        .sort({ createdAt: -1 })
        .limit(10);

      const reviews = await Review.find({ user: userId })
        .populate("hotel", "name")
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        user,
        bookings,
        reviews,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải thông tin người dùng",
        details: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Prevent updating sensitive fields
      delete updates.password;
      delete updates.google_auth;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Cập nhật người dùng thành công",
        user,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Lỗi khi cập nhật người dùng", details: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      // Don't allow deleting admin users
      if (user.personal_info.role === "admin") {
        return res
          .status(403)
          .json({ error: "Không thể xóa tài khoản quản trị viên" });
      }

      // If it's a partner, check if they have active hotels
      if (user.personal_info.role === "partner") {
        const hotelCount = await Hotel.countDocuments({ partner: userId });
        if (hotelCount > 0) {
          return res.status(400).json({
            error: "Không thể xóa đối tác có khách sạn đang hoạt động",
          });
        }
      }

      await User.findByIdAndDelete(userId);

      res.status(200).json({
        message: "Xóa người dùng thành công",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Lỗi khi xóa người dùng", details: error.message });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["user", "partner", "admin"].includes(role)) {
        return res.status(400).json({ error: "Vai trò không hợp lệ" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { "personal_info.role": role } },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Cập nhật vai trò thành công",
        user,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Lỗi khi cập nhật vai trò", details: error.message });
    }
  },

  // Partner Management
  getAllPartners: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;

      const filter = { "personal_info.role": "partner" };
      if (search) {
        filter.$or = [
          { "personal_info.email": { $regex: search, $options: "i" } },
          { "personal_info.username": { $regex: search, $options: "i" } },
          { "personal_info.fullname": { $regex: search, $options: "i" } },
        ];
      }

      const partners = await User.find(filter)
        .select("-password -google_auth")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      // Get hotel counts for each partner
      const partnersWithStats = await Promise.all(
        partners.map(async (partner) => {
          const hotelCount = await Hotel.countDocuments({
            partner: partner._id,
          });
          const bookingCount = await Booking.countDocuments({
            hotel: {
              $in: await Hotel.find({ partner: partner._id }).distinct("_id"),
            },
          });
          return {
            ...partner,
            hotelCount,
            bookingCount,
          };
        })
      );

      const count = await User.countDocuments(filter);

      res.status(200).json({
        partners: partnersWithStats,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải danh sách đối tác",
        details: error.message,
      });
    }
  },

  updatePartnerStatus: async (req, res) => {
    try {
      const { partnerId } = req.params;
      const { status } = req.body;

      // You can add custom partner status field if needed
      const partner = await User.findById(partnerId);
      if (!partner || partner.personal_info.role !== "partner") {
        return res.status(404).json({ error: "Không tìm thấy đối tác" });
      }

      // Implement status update logic here
      // For now, just return success
      res.status(200).json({
        message: "Cập nhật trạng thái đối tác thành công",
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi cập nhật trạng thái đối tác",
        details: error.message,
      });
    }
  },

  // Hotel Management
  getAllHotels: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        city,
        partnerId,
        search,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      const filter = {};
      if (city) filter.city = city;
      if (partnerId) filter.partner = partnerId;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const sortOrder = order === "asc" ? 1 : -1;
      const sortOptions = { [sortBy]: sortOrder };

      const hotels = await Hotel.find(filter)
        .populate("partner", "personal_info.email personal_info.username")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Hotel.countDocuments(filter);

      res.status(200).json({
        hotels,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải danh sách khách sạn",
        details: error.message,
      });
    }
  },

  getHotel: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const hotel = await Hotel.findById(hotelId)
        .populate("partner", "personal_info")
        .populate("rooms");

      if (!hotel) {
        return res.status(404).json({ error: "Không tìm thấy khách sạn" });
      }

      // Get hotel statistics
      const bookingCount = await Booking.countDocuments({ hotel: hotelId });
      const reviewCount = await Review.countDocuments({ hotel: hotelId });

      res.status(200).json({
        hotel,
        statistics: {
          bookingCount,
          reviewCount,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải thông tin khách sạn",
        details: error.message,
      });
    }
  },

  deleteHotel: async (req, res) => {
    try {
      const { hotelId } = req.params;

      // Check if hotel has active bookings
      const activeBookings = await Booking.countDocuments({
        hotel: hotelId,
        status: { $in: ["confirmed", "pending"] },
        endDate: { $gte: new Date() },
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          error: "Không thể xóa khách sạn có đặt phòng đang hoạt động",
        });
      }

      // Delete associated rooms
      await Room.deleteMany({ hotel: hotelId });

      // Delete hotel
      await Hotel.findByIdAndDelete(hotelId);

      res.status(200).json({
        message: "Xóa khách sạn thành công",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Lỗi khi xóa khách sạn", details: error.message });
    }
  },

  // Booking Management
  getAllBookings: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        paymentStatus,
        startDate,
        endDate,
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (startDate || endDate) {
        filter.startDate = {};
        if (startDate) filter.startDate.$gte = new Date(startDate);
        if (endDate) filter.startDate.$lte = new Date(endDate);
      }

      const bookings = await Booking.find(filter)
        .populate("user", "personal_info.email personal_info.username")
        .populate("hotel", "name city")
        .populate("room", "roomType price")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Booking.countDocuments(filter);

      res.status(200).json({
        bookings,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải danh sách đặt phòng",
        details: error.message,
      });
    }
  },

  getBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findById(bookingId)
        .populate("user", "personal_info")
        .populate("hotel")
        .populate("room");

      if (!booking) {
        return res.status(404).json({ error: "Không tìm thấy đặt phòng" });
      }

      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải thông tin đặt phòng",
        details: error.message,
      });
    }
  },

  // Review Management
  getAllReviews: async (req, res) => {
    try {
      const { page = 1, limit = 20, hotelId, rating, hasReply } = req.query;

      const filter = {};
      if (hotelId) filter.hotel = hotelId;
      if (rating) filter.rating = Number(rating);
      if (hasReply === "true") filter.partnerReply = { $exists: true, $ne: "" };
      if (hasReply === "false") filter.partnerReply = { $in: [null, ""] };

      const reviews = await Review.find(filter)
        .populate("user", "personal_info.username personal_info.profile_img")
        .populate("hotel", "name")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Review.countDocuments(filter);

      res.status(200).json({
        reviews,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải danh sách đánh giá",
        details: error.message,
      });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ error: "Không tìm thấy đánh giá" });
      }

      await Review.findByIdAndDelete(reviewId);

      // Recalculate hotel rating
      const hotelId = review.hotel;
      const stats = await Review.aggregate([
        { $match: { hotel: hotelId } },
        { $group: { _id: "$hotel", avgRating: { $avg: "$rating" } } },
      ]);

      if (stats.length > 0) {
        await Hotel.findByIdAndUpdate(hotelId, { rating: stats[0].avgRating });
      } else {
        await Hotel.findByIdAndUpdate(hotelId, { rating: 0 });
      }

      res.status(200).json({
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Lỗi khi xóa đánh giá", details: error.message });
    }
  },

  // Payment Management
  getAllPayments: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        paymentMethod,
        paymentStatus,
        startDate,
        endDate,
      } = req.query;

      const filter = { paymentStatus: { $ne: "pending" } };
      if (paymentMethod) filter.paymentMethod = paymentMethod;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const payments = await Booking.find(filter)
        .populate("user", "personal_info.email personal_info.username")
        .populate("hotel", "name")
        .select("paymentId paymentMethod paymentStatus totalPrice createdAt")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Booking.countDocuments(filter);

      // Calculate total revenue
      const revenueStats = await Booking.aggregate([
        { $match: { ...filter, paymentStatus: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
      ]);

      res.status(200).json({
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tải danh sách thanh toán",
        details: error.message,
      });
    }
  },

  // System Reports
  getRevenueReport: async (req, res) => {
    try {
      const { startDate, endDate, period = "daily" } = req.query;

      const matchStage = {
        paymentStatus: "completed",
      };

      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      let groupBy;
      if (period === "monthly") {
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
      } else if (period === "yearly") {
        groupBy = { year: { $year: "$createdAt" } };
      } else {
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
      }

      const report = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupBy,
            totalRevenue: { $sum: "$totalPrice" },
            bookingCount: { $sum: 1 },
            avgBookingValue: { $avg: "$totalPrice" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      ]);

      res.status(200).json({ report });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tạo báo cáo doanh thu",
        details: error.message,
      });
    }
  },

  getBookingsReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const matchStage = {};
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const report = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]);

      res.status(200).json({ report });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tạo báo cáo đặt phòng",
        details: error.message,
      });
    }
  },

  getUsersReport: async (req, res) => {
    try {
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: "$personal_info.role",
            count: { $sum: 1 },
          },
        },
      ]);

      const usersByMonth = await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]);

      res.status(200).json({
        usersByRole,
        usersByMonth,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi tạo báo cáo người dùng",
        details: error.message,
      });
    }
  },

  // Blog Management
  getAllBlogs: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        status = "all",
        sortBy = "latest",
      } = req.query;

      const query = {};

      // Search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { desc: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }

      // Status filter
      if (status !== "all") {
        query.draft = status === "draft";
      }

      // Sorting
      let sort = {};
      switch (sortBy) {
        case "latest":
          sort = { publishedAt: -1 };
          break;
        case "oldest":
          sort = { publishedAt: 1 };
          break;
        case "popular":
          sort = { "activity.total_reads": -1 };
          break;
        case "trending":
          sort = { "activity.total_likes": -1 };
          break;
        default:
          sort = { publishedAt: -1 };
      }

      const blogs = await Blog.find(query)
        .populate("author", "personal_info.username personal_info.profile_img")
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Blog.countDocuments(query);

      res.status(200).json({
        blogs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi lấy danh sách blog",
        details: error.message,
      });
    }
  },

  getBlog: async (req, res) => {
    try {
      const { blogId } = req.params;

      const blog = await Blog.findById(blogId)
        .populate(
          "author",
          "personal_info.username personal_info.fullname personal_info.profile_img"
        )
        .populate({
          path: "comments",
          populate: {
            path: "commented_by",
            select: "personal_info.username personal_info.profile_img",
          },
        });

      if (!blog) {
        return res.status(404).json({ error: "Không tìm thấy blog" });
      }

      res.status(200).json(blog);
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi lấy thông tin blog",
        details: error.message,
      });
    }
  },

  deleteBlog: async (req, res) => {
    try {
      const { blogId } = req.params;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ error: "Không tìm thấy blog" });
      }

      // Remove blog from user's blogs array
      await User.findByIdAndUpdate(blog.author, {
        $pull: { blogs: blogId },
      });

      // Delete the blog
      await Blog.findByIdAndDelete(blogId);

      res.status(200).json({ message: "Xóa blog thành công" });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi xóa blog",
        details: error.message,
      });
    }
  },

  updateBlogStatus: async (req, res) => {
    try {
      const { blogId } = req.params;
      const { draft } = req.body;

      const blog = await Blog.findByIdAndUpdate(
        blogId,
        { draft },
        { new: true }
      ).populate("author", "personal_info.username personal_info.profile_img");

      if (!blog) {
        return res.status(404).json({ error: "Không tìm thấy blog" });
      }

      res.status(200).json({
        message: `Blog đã được ${draft ? "ẩn" : "công khai"}`,
        blog,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi cập nhật trạng thái blog",
        details: error.message,
      });
    }
  },
};

module.exports = adminController;
