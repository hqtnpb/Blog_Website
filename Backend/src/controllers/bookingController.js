const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const User = require("../models/User");
const {
  sendBookingConfirmation,
  sendBookingCancellation,
} = require("../utils/emailService");
const {
  sendNotificationToUser,
  sendNotificationToUsers,
  NotificationTypes,
  createNotification,
} = require("../utils/notificationHelper");

const bookingController = {
  createBooking: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        roomId,
        startDate,
        endDate,
        guestName,
        guestPhone,
        guestEmail,
        numberOfAdults,
        numberOfChildren,
        specialRequests,
      } = req.body;
      const userId = req.user.id;

      // Validation
      if (
        !roomId ||
        !startDate ||
        !endDate ||
        !guestName ||
        !guestPhone ||
        !guestEmail ||
        !numberOfAdults
      ) {
        await session.abortTransaction();
        return res.status(400).json({
          message:
            "Vui lòng cung cấp đầy đủ thông tin: Phòng, ngày nhận, ngày trả, tên khách, điện thoại, email, số người lớn.",
        });
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start < now) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Ngày nhận phòng không thể là quá khứ." });
      }

      if (end <= start) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Ngày trả phòng phải sau ngày nhận phòng." });
      }

      const room = await Room.findById(roomId).session(session);
      if (!room) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Không tìm thấy phòng." });
      }

      // Validate capacity
      if (numberOfAdults > room.maxAdults) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Phòng chỉ có thể chứa tối đa ${room.maxAdults} người lớn.`,
        });
      }
      if (numberOfChildren > room.maxChildren) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Phòng chỉ có thể chứa tối đa ${room.maxChildren} trẻ em.`,
        });
      }

      // Check for overlapping bookings - IMPROVED LOGIC
      const overlappingBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ["pending", "confirmed", "checked-in"] },
        startDate: { $lt: end },
        endDate: { $gt: start },
      }).session(session);

      if (overlappingBooking) {
        await session.abortTransaction();
        return res.status(409).json({
          message: "Phòng không còn trống trong khoảng thời gian đã chọn.",
        });
      }

      // Calculate total price
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * room.pricePerNight;

      // Calculate cancellable until (24 hours before check-in)
      const cancellableUntil = new Date(start);
      cancellableUntil.setHours(cancellableUntil.getHours() - 24);

      // Create new booking
      const newBooking = new Booking({
        user: userId,
        hotel: room.hotel,
        room: roomId,
        type: "hotel",
        startDate: start,
        endDate: end,
        totalPrice,
        guestName,
        guestPhone,
        guestEmail,
        numberOfAdults,
        numberOfChildren: numberOfChildren || 0,
        specialRequests: specialRequests || "",
        status: "pending", // Will change to confirmed after payment
        paymentStatus: "pending",
        cancellableUntil,
      });

      const savedBooking = await newBooking.save({ session });

      // Add booking to room's bookings array
      await Room.findByIdAndUpdate(
        roomId,
        { $push: { bookings: savedBooking._id } },
        { session }
      );

      await session.commitTransaction();

      // Populate hotel and room info for email
      const populatedBooking = await Booking.findById(savedBooking._id)
        .populate("hotel", "name")
        .populate("room", "title");

      // Send booking confirmation email (async, don't wait)
      sendBookingConfirmation(populatedBooking).catch((err) =>
        console.error("Email error:", err.message)
      );

      // Send notification to user
      try {
        const notification = createNotification(
          NotificationTypes.BOOKING_CREATED,
          "Đặt phòng thành công",
          `Đặt phòng tại ${populatedBooking.hotel?.name || "khách sạn"} đã được tạo. Vui lòng thanh toán để xác nhận.`,
          {
            bookingId: savedBooking._id,
            hotelName: populatedBooking.hotel?.name,
            checkIn: start,
            checkOut: end,
            totalPrice,
          }
        );
        sendNotificationToUser(userId, notification);
      } catch (notifError) {
        console.error("❌ Failed to send notification:", notifError);
      }

      // Notify hotel partner about new booking
      try {
        const hotel = await Hotel.findById(populatedBooking.hotel._id).select(
          "partner name"
        );
        console.log("🏨 Hotel info:", {
          hotelId: hotel?._id,
          hotelName: hotel?.name,
          partnerId: hotel?.partner?.toString(),
        });

        if (hotel && hotel.partner) {
          const partnerNotification = createNotification(
            NotificationTypes.BOOKING_CREATED,
            "Đơn đặt phòng mới",
            `Khách hàng ${guestName} đã đặt phòng tại ${hotel.name}`,
            {
              bookingId: savedBooking._id,
              customerName: guestName,
              hotelName: hotel.name,
              checkIn: start,
              checkOut: end,
              totalPrice,
            }
          );
          console.log(
            "📤 Sending notification to partner:",
            hotel.partner.toString()
          );
          const sent = sendNotificationToUser(
            hotel.partner,
            partnerNotification
          );
          console.log("📬 Partner notification sent:", sent);
        } else {
          console.warn("⚠️ No partner found for hotel");
        }
      } catch (partnerNotifError) {
        console.error(
          "❌ Failed to send partner notification:",
          partnerNotifError
        );
      }

      // Notify all admins about new booking
      try {
        const admins = await User.find({
          "personal_info.role": "admin",
        }).select("_id");
        const adminIds = admins.map((admin) => admin._id);

        const adminNotification = createNotification(
          NotificationTypes.BOOKING_CREATED,
          "Đơn đặt phòng mới",
          `Khách hàng ${guestName} đã đặt phòng tại ${populatedBooking.hotel?.name || "khách sạn"}`,
          {
            bookingId: savedBooking._id,
            customerName: guestName,
            hotelName: populatedBooking.hotel?.name,
            totalPrice,
          }
        );
        sendNotificationToUsers(adminIds, adminNotification);
      } catch (adminNotifError) {
        console.error("❌ Failed to send admin notification:", adminNotifError);
      }

      res.status(201).json({
        success: true,
        message: "Đặt phòng thành công. Vui lòng tiến hành thanh toán.",
        booking: savedBooking,
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.id;

      const bookings = await Booking.find({ user: userId })
        .populate({
          path: "room",
          populate: {
            path: "hotel",
            select: "name address city country images",
          },
        })
        .populate({
          path: "flight",
          populate: {
            path: "airline",
            select: "name logo",
          },
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
            from: "rooms",
            localField: "room",
            foreignField: "_id",
            as: "roomDetails",
          },
        },
        { $unwind: { path: "$roomDetails", preserveNullAndEmptyArrays: true } }, // Keep flight bookings
        {
          $lookup: {
            from: "hotels",
            localField: "roomDetails.hotel",
            foreignField: "_id",
            as: "hotelDetails",
          },
        },
        {
          $unwind: { path: "$hotelDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $match: {
            "hotelDetails.partner": new mongoose.Types.ObjectId(partnerId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            status: 1,
            startDate: 1,
            endDate: 1,
            totalPrice: 1,
            bookingDate: 1,
            type: 1,
            guestName: 1,
            guestPhone: 1,
            guestEmail: 1,
            numberOfAdults: 1,
            numberOfChildren: 1,
            specialRequests: 1,
            paymentStatus: 1,
            room: {
              _id: "$roomDetails._id",
              roomNumber: "$roomDetails.roomNumber",
              type: "$roomDetails.type",
            },
            hotel: {
              _id: "$hotelDetails._id",
              name: "$hotelDetails.name",
            },
            user: {
              _id: "$userDetails._id",
              fullName: "$userDetails.personal_info.fullName",
              email: "$userDetails.personal_info.email",
            },
          },
        },
        {
          $sort: { bookingDate: -1 },
        },
      ]);

      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { cancellationReason } = req.body;
      const userId = req.user.id;

      const booking = await Booking.findOne({ _id: bookingId, user: userId });

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found or you do not have access to it.",
        });
      }

      if (booking.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Booking has already been cancelled." });
      }

      // Check cancellation policy (24 hours before check-in)
      const now = new Date();
      if (booking.cancellableUntil && now > booking.cancellableUntil) {
        return res.status(403).json({
          message: "Cannot cancel booking less than 24 hours before check-in.",
          cancellableUntil: booking.cancellableUntil,
        });
      }

      booking.status = "cancelled";
      booking.cancellationReason = cancellationReason || "User cancelled";
      booking.paymentStatus = "refunded";
      const updatedBooking = await booking.save();

      // Remove the booking reference from the room if it's a hotel booking
      if (booking.type === "hotel" && booking.room) {
        await Room.findByIdAndUpdate(booking.room, {
          $pull: { bookings: booking._id },
        });
      }

      // Populate for email
      const populatedBooking = await Booking.findById(booking._id)
        .populate("hotel", "name")
        .populate("room", "title");

      // Calculate refund amount (full refund if within cancellation window)
      const refundAmount =
        booking.paymentStatus === "completed" ? booking.totalPrice : 0;

      // Send cancellation email (async, don't wait)
      sendBookingCancellation(populatedBooking, refundAmount).catch((err) =>
        console.error("Email error:", err.message)
      );

      // Send notification to user
      try {
        const notification = createNotification(
          NotificationTypes.BOOKING_CANCELLED,
          "Đặt phòng đã hủy",
          `Đơn đặt phòng #${bookingId} đã được hủy thành công. ${refundAmount > 0 ? `Số tiền ${refundAmount.toLocaleString()}đ sẽ được hoàn lại.` : ""}`,
          {
            bookingId: booking._id,
            hotelName: populatedBooking.hotel?.name,
            refundAmount,
          }
        );
        sendNotificationToUser(userId, notification);
      } catch (notifError) {
        console.error("❌ Failed to send notification:", notifError);
      }

      // Notify hotel partner about cancellation
      try {
        const hotel = await Hotel.findById(populatedBooking.hotel._id).select(
          "partner name"
        );
        if (hotel && hotel.partner) {
          const partnerNotification = createNotification(
            NotificationTypes.BOOKING_CANCELLED,
            "Khách hàng hủy đặt phòng",
            `Khách hàng đã hủy đơn đặt phòng tại ${hotel.name}. Lý do: ${cancellationReason || "Không có"}`,
            {
              bookingId: booking._id,
              hotelName: hotel.name,
              reason: cancellationReason,
              refundAmount,
            }
          );
          console.log(
            "📤 Sending cancellation notification to partner:",
            hotel.partner.toString()
          );
          sendNotificationToUser(hotel.partner, partnerNotification);
        }
      } catch (partnerNotifError) {
        console.error(
          "❌ Failed to send partner cancellation notification:",
          partnerNotifError
        );
      }

      // Notify admins about cancellation
      try {
        const admins = await User.find({
          "personal_info.role": "admin",
        }).select("_id personal_info.username");
        console.log(
          "🔍 Found admins for cancellation notification:",
          admins.length
        );
        admins.forEach((admin) => {
          console.log(
            "  - Admin ID:",
            admin._id,
            "Username:",
            admin.personal_info?.username
          );
        });

        const adminIds = admins.map((admin) => admin._id);

        const adminNotification = createNotification(
          NotificationTypes.BOOKING_CANCELLED,
          "Đơn hủy phòng",
          `Khách hàng đã hủy đặt phòng #${bookingId}`,
          {
            bookingId: booking._id,
            reason: cancellationReason,
            refundAmount,
          }
        );
        console.log(
          "📤 Sending cancellation notification to",
          adminIds.length,
          "admins"
        );
        sendNotificationToUsers(adminIds, adminNotification);
      } catch (adminNotifError) {
        console.error("❌ Failed to send admin notification:", adminNotifError);
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
        return res.status(403).json({
          message: "You are not authorized to view bookings for this hotel.",
        });
      }

      const bookings = await Booking.find({ hotel: hotelId })
        .populate("user", "personal_info.fullName personal_info.email")
        .populate("room", "roomNumber type")
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

      const booking = await Booking.findById(bookingId).populate("hotel");

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // Check if the booking is for a hotel and the partner owns it
      if (!booking.hotel || booking.hotel.partner.toString() !== partnerId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this booking." });
      }

      booking.status = status;
      const updatedBooking = await booking.save();

      // Send notification to customer about status change
      try {
        let notificationTitle = "";
        let notificationMessage = "";
        let notificationType = NotificationTypes.BOOKING_CONFIRMED;

        switch (status) {
          case "confirmed":
            notificationTitle = "Đơn đặt phòng đã được xác nhận";
            notificationMessage = `Đơn đặt phòng #${bookingId} tại ${booking.hotel?.name || "khách sạn"} đã được xác nhận. Chúc bạn có kỳ nghỉ vui vẻ!`;
            notificationType = NotificationTypes.BOOKING_CONFIRMED;
            break;
          case "cancelled":
            notificationTitle = "Đơn đặt phòng đã bị hủy";
            notificationMessage = `Đơn đặt phòng #${bookingId} tại ${booking.hotel?.name || "khách sạn"} đã bị hủy bởi khách sạn. Vui lòng liên hệ để biết thêm chi tiết.`;
            notificationType = NotificationTypes.BOOKING_CANCELLED;
            break;
          case "checked-in":
            notificationTitle = "Đã nhận phòng";
            notificationMessage = `Bạn đã nhận phòng tại ${booking.hotel?.name || "khách sạn"}. Chúc bạn có trải nghiệm tuyệt vời!`;
            break;
          case "checked-out":
            notificationTitle = "Đã trả phòng";
            notificationMessage = `Cảm ơn bạn đã lưu trú tại ${booking.hotel?.name || "khách sạn"}. Đừng quên đánh giá trải nghiệm của bạn!`;
            break;
          default:
            notificationTitle = "Trạng thái đơn đặt phòng đã thay đổi";
            notificationMessage = `Đơn đặt phòng #${bookingId} đã được cập nhật trạng thái: ${status}`;
        }

        const notification = createNotification(
          notificationType,
          notificationTitle,
          notificationMessage,
          {
            bookingId: booking._id,
            hotelName: booking.hotel?.name,
            status,
          }
        );
        sendNotificationToUser(booking.user, notification);
      } catch (notifError) {
        console.error(
          "❌ Failed to send status change notification:",
          notifError
        );
      }

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
          path: "room",
          populate: {
            path: "hotel",
            select: "name address city country images",
          },
        })
        .populate({
          path: "flight",
          populate: {
            path: "airline",
            select: "name logo",
          },
        });

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found or you do not have access to it.",
        });
      }

      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  // Check room availability for given dates
  checkAvailability: async (req, res) => {
    try {
      const { roomId, startDate, endDate } = req.query;

      if (!roomId || !startDate || !endDate) {
        return res.status(400).json({
          message: "Please provide roomId, startDate, and endDate.",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const overlappingBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ["pending", "confirmed", "checked-in"] },
        startDate: { $lt: end },
        endDate: { $gt: start },
      });

      res.status(200).json({
        available: !overlappingBooking,
        message: overlappingBooking
          ? "Room is not available for the selected dates."
          : "Room is available.",
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
};

module.exports = bookingController;
