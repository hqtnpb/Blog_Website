const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

const partnerController = {
  // Hotel CRUD Operations
  createHotel: async (req, res) => {
    try {
      const {
        name,
        description,
        address,
        city,
        country,
        images,
        hasFreeWifi,
        hasPool,
        hasParking,
        hasGym,
        hasSpa,
        hasRestaurant,
        hasBar,
        hasAC,
        hasRoomService,
        has24HourFrontDesk,
        hasAirportShuttle,
        hasBeachAccess,
        hasBreakfast,
      } = req.body;
      const partnerId = req.user.id;

      const newHotel = new Hotel({
        name,
        partner: partnerId,
        description,
        address,
        city,
        country,
        images,
        hasFreeWifi,
        hasPool,
        hasParking,
        hasGym,
        hasSpa,
        hasRestaurant,
        hasBar,
        hasAC,
        hasRoomService,
        has24HourFrontDesk,
        hasAirportShuttle,
        hasBeachAccess,
        hasBreakfast,
      });

      const savedHotel = await newHotel.save();

      // Add the new hotel to the partner's list of hotels
      await User.findByIdAndUpdate(partnerId, {
        $push: { "partner_info.hotel": savedHotel._id },
      });

      res.status(201).json(savedHotel);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getHotel: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const partnerId = req.user.id;

      const hotel = await Hotel.findOne({
        _id: hotelId,
        partner: partnerId,
      }).populate("rooms");

      if (!hotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      res.status(200).json(hotel);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateHotel: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const partnerId = req.user.id;
      const {
        name,
        description,
        address,
        city,
        country,
        images,
        hasFreeWifi,
        hasPool,
        hasParking,
        hasGym,
        hasSpa,
        hasRestaurant,
        hasBar,
        hasAC,
        hasRoomService,
        has24HourFrontDesk,
        hasAirportShuttle,
        hasBeachAccess,
        hasBreakfast,
      } = req.body;

      const updatedHotel = await Hotel.findOneAndUpdate(
        { _id: hotelId, partner: partnerId },
        {
          $set: {
            name,
            description,
            address,
            city,
            country,
            images,
            hasFreeWifi,
            hasPool,
            hasParking,
            hasGym,
            hasSpa,
            hasRestaurant,
            hasBar,
            hasAC,
            hasRoomService,
            has24HourFrontDesk,
            hasAirportShuttle,
            hasBeachAccess,
            hasBreakfast,
          },
        },
        { new: true }
      );

      if (!updatedHotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      res.status(200).json(updatedHotel);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteHotel: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const partnerId = req.user.id;

      // Find the hotel to ensure it belongs to the partner
      const hotelToDelete = await Hotel.findOne({
        _id: hotelId,
        partner: partnerId,
      });
      if (!hotelToDelete) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      // Delete all rooms associated with this hotel
      await Room.deleteMany({ hotel: hotelId });

      // Delete the hotel
      await Hotel.deleteOne({ _id: hotelId });

      // Remove the hotel reference from the User's hotel array
      await User.findByIdAndUpdate(partnerId, {
        $pull: { "partner_info.hotel": hotelId },
      });

      res
        .status(200)
        .json({
          message: "Đã xóa khách sạn và các phòng liên quan thành công",
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPartnerHotels: async (req, res) => {
    try {
      const partnerId = req.user.id;
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
      const partnerId = req.user.id;
      const {
        roomNumber,
        type,
        title,
        desc,
        pricePerNight,
        maxAdults,
        maxChildren,
        amenities,
        images,
      } = req.body;

      // Verify the hotel belongs to the partner
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      // Check if roomNumber already exists for this hotel
      const existingRoom = await Room.findOne({ hotel: hotelId, roomNumber });
      if (existingRoom) {
        return res
          .status(400)
          .json({ error: "Số phòng đã tồn tại cho khách sạn này" });
      }

      // Auto-generate title and desc if not provided
      const roomTitle = title || `${type} - Phòng ${roomNumber}`;
      const roomDesc =
        desc || `Phòng ${type} số ${roomNumber} tại ${hotel.name}`;

      const newRoom = new Room({
        hotel: hotelId,
        roomNumber,
        type,
        title: roomTitle,
        desc: roomDesc,
        roomType: type, // Set roomType giống với type
        pricePerNight,
        maxAdults,
        maxChildren,
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
      const partnerId = req.user.id;

      // Verify the hotel belongs to the partner
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      const room = await Room.findOne({ _id: roomId, hotel: hotelId });

      if (!room) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy phòng hoặc không thuộc khách sạn này",
          });
      }

      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateRoom: async (req, res) => {
    try {
      const { hotelId, roomId } = req.params;
      const partnerId = req.user.id;
      const {
        roomNumber,
        type,
        title,
        desc,
        pricePerNight,
        maxAdults,
        maxChildren,
        amenities,
        images,
      } = req.body;

      // Verify the hotel belongs to the partner
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      const updateData = {
        roomNumber,
        type,
        roomType: type,
        pricePerNight,
        maxAdults,
        maxChildren,
        amenities,
        images,
      };

      // Only update title/desc if provided
      if (title) updateData.title = title;
      if (desc) updateData.desc = desc;

      const updatedRoom = await Room.findOneAndUpdate(
        { _id: roomId, hotel: hotelId },
        { $set: updateData },
        { new: true }
      );

      if (!updatedRoom) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy phòng hoặc không thuộc khách sạn này",
          });
      }

      res.status(200).json(updatedRoom);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      const { hotelId, roomId } = req.params;
      const partnerId = req.user.id;

      // Verify the hotel belongs to the partner
      const hotel = await Hotel.findOne({ _id: hotelId, partner: partnerId });
      if (!hotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      const deletedRoom = await Room.findOneAndDelete({
        _id: roomId,
        hotel: hotelId,
      });

      if (!deletedRoom) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy phòng hoặc không thuộc khách sạn này",
          });
      }

      // Remove room from hotel's rooms array
      hotel.rooms.pull(roomId);
      await hotel.save();

      res.status(200).json({ message: "Đã xóa phòng thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Calendar & Availability
  getCalendarBookings: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const { month, year } = req.query;
      const partnerId = req.user.id;

      // Verify the hotel belongs to the partner
      const hotel = await Hotel.findOne({
        _id: hotelId,
        partner: partnerId,
      }).populate("rooms");
      if (!hotel) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy khách sạn hoặc bạn không có quyền truy cập",
          });
      }

      // Build date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get all bookings for this hotel's rooms in the specified month
      const roomIds = hotel.rooms.map((room) => room._id);

      const bookings = await Booking.find({
        room: { $in: roomIds },
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          {
            startDate: { $lte: startDate },
            endDate: { $gte: endDate },
          },
        ],
      })
        .populate("room", "roomNumber type")
        .populate("user", "personal_info.username personal_info.profile_img")
        .sort({ startDate: 1 });

      res.status(200).json({
        hotel: {
          _id: hotel._id,
          name: hotel.name,
          rooms: hotel.rooms,
        },
        bookings,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Profile Management
  getProfile: async (req, res) => {
    try {
      const partnerId = req.user.id;

      const user = await User.findById(partnerId).select(
        "-personal_info.password -google_auth -blogs"
      );

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { username, bio, social_links } = req.body;

      const updateData = {};

      if (username) {
        // Check if username already exists
        const existingUser = await User.findOne({
          "personal_info.username": username,
          _id: { $ne: partnerId },
        });

        if (existingUser) {
          return res
            .status(400)
            .json({ error: "Tên người dùng đã được sử dụng" });
        }

        updateData["personal_info.username"] = username;
      }

      if (bio !== undefined) {
        updateData["personal_info.bio"] = bio;
      }

      if (social_links) {
        if (social_links.youtube !== undefined) {
          updateData["social_links.youtube"] = social_links.youtube;
        }
        if (social_links.instagram !== undefined) {
          updateData["social_links.instagram"] = social_links.instagram;
        }
        if (social_links.facebook !== undefined) {
          updateData["social_links.facebook"] = social_links.facebook;
        }
        if (social_links.twitter !== undefined) {
          updateData["social_links.twitter"] = social_links.twitter;
        }
        if (social_links.github !== undefined) {
          updateData["social_links.github"] = social_links.github;
        }
        if (social_links.website !== undefined) {
          updateData["social_links.website"] = social_links.website;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        partnerId,
        { $set: updateData },
        { new: true }
      ).select("-personal_info.password -google_auth -blogs");

      if (!updatedUser) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Đã cập nhật hồ sơ thành công",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAvatar: async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { profile_img } = req.body;

      if (!profile_img) {
        return res.status(400).json({ error: "URL ảnh đại diện là bắt buộc" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        partnerId,
        { $set: { "personal_info.profile_img": profile_img } },
        { new: true }
      ).select("-personal_info.password -google_auth -blogs");

      if (!updatedUser) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Đã cập nhật ảnh đại diện thành công",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc",
        });
      }

      const user = await User.findById(partnerId);

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      // Check if user has Google auth (no password)
      if (user.google_auth) {
        return res.status(400).json({
          error: "Bạn đã đăng ký bằng Google. Không thể thay đổi mật khẩu",
        });
      }

      // Verify current password
      const bcrypt = require("bcrypt");
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.personal_info.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Mật khẩu hiện tại không đúng" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.personal_info.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Đã thay đổi mật khẩu thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Partner Notifications
  getNotifications: async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { page = 1, filter = "all", limit = 10 } = req.query;

      // Build query
      let query = { notification_for: partnerId };

      if (filter !== "all") {
        query.type = filter;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get notifications with populated fields
      const notifications = await Notification.find(query)
        .populate("user", "personal_info.username personal_info.profile_img")
        .populate("blog", "title blog_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const totalCount = await Notification.countDocuments(query);

      // Mark fetched notifications as seen
      const notificationIds = notifications.map((n) => n._id);
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { seen: true } }
      );

      res.status(200).json({
        notifications,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        hasMore: skip + notifications.length < totalCount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const partnerId = req.user.id;

      const count = await Notification.countDocuments({
        notification_for: partnerId,
        seen: false,
      });

      res.status(200).json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const partnerId = req.user.id;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, notification_for: partnerId },
        { $set: { seen: true } },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ error: "Không tìm thấy thông báo" });
      }

      res.status(200).json({ message: "Đã đánh dấu đã đọc", notification });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const partnerId = req.user.id;

      await Notification.updateMany(
        { notification_for: partnerId, seen: false },
        { $set: { seen: true } }
      );

      res.status(200).json({ message: "Đã đánh dấu tất cả thông báo đã đọc" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const partnerId = req.user.id;

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        notification_for: partnerId,
      });

      if (!notification) {
        return res.status(404).json({ error: "Không tìm thấy thông báo" });
      }

      res.status(200).json({ message: "Đã xóa thông báo thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = partnerController;
