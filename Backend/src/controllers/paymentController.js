const crypto = require("crypto");
const axios = require("axios");
const Booking = require("../models/Booking");
const {
  createVNPayPaymentUrl,
  verifyVNPayCallback,
  parseVNPayResponseCode,
} = require("../utils/vnpayHelper");
const { sendPaymentReceipt } = require("../utils/emailService");
const {
  sendNotificationToUser,
  NotificationTypes,
  createNotification,
} = require("../utils/notificationHelper");

const paymentController = {
  // Create MoMo payment
  createMoMoPayment: async (req, res) => {
    try {
      console.log("📝 MoMo Payment Request:", {
        body: req.body,
        userId: req.user.id,
      });

      const { bookingId } = req.body;
      const userId = req.user.id;

      // Find booking
      const booking = await Booking.findOne({ _id: bookingId, user: userId });

      console.log("🔍 Booking found:", booking ? "Yes" : "No");

      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found." });
      }

      console.log("💰 Booking status:", {
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
      });

      if (booking.paymentStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This booking has already been processed.",
        });
      }

      // MoMo configuration (SANDBOX)
      const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
      const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
      const secretKey =
        process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const redirectUrl =
        process.env.MOMO_REDIRECT_URL ||
        `${process.env.FRONTEND_URL}/payment/callback`;
      const ipnUrl =
        process.env.MOMO_IPN_URL ||
        `${process.env.BACKEND_URL}/api/payment/momo/callback`;
      const requestType = "payWithMethod";

      // Generate unique IDs
      const orderId = `${bookingId}_${Date.now()}`;
      const requestId = orderId;
      const amount = booking.totalPrice.toString();
      const orderInfo = `Payment for booking ${bookingId}`;
      const extraData = "";
      const autoCapture = true;
      const lang = "vi";

      // Create signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      // Request body
      const requestBody = {
        partnerCode,
        partnerName: "Travel Booking",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature,
      };

      // Call MoMo API
      console.log("🚀 Calling MoMo API with:", {
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
      });

      const momoResponse = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody
      );

      console.log("✅ MoMo Response:", {
        resultCode: momoResponse.data.resultCode,
        message: momoResponse.data.message,
      });

      if (momoResponse.data.resultCode === 0) {
        // Update booking with payment info
        booking.paymentId = orderId;
        booking.paymentMethod = "momo";
        booking.paymentStatus = "processing";
        await booking.save();

        return res.status(200).json({
          success: true,
          message: "Payment URL created successfully",
          paymentUrl: momoResponse.data.payUrl,
          orderId,
          bookingId: booking._id,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to create payment URL",
          error: momoResponse.data,
        });
      }
    } catch (error) {
      console.error("❌ MoMo Payment Error:", error);
      console.error("   Error details:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
        details: error.response?.data || error.message,
      });
    }
  },

  // MoMo IPN Callback
  handleMoMoCallback: async (req, res) => {
    try {
      const { orderId, resultCode, message, transId, signature, amount } =
        req.body;

      // Verify signature
      const secretKey =
        process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
      const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";

      // Extract bookingId from orderId
      const bookingId = orderId.split("_")[0];

      const booking = await Booking.findById(bookingId)
        .populate(
          "user",
          "personal_info.email personal_info.fullname personal_info.username"
        )
        .populate("hotel", "name")
        .populate("room", "roomType");

      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found." });
      }

      // Check payment result
      if (resultCode === 0) {
        // Payment successful
        booking.paymentStatus = "confirmed";
        booking.status = "confirmed";
        await booking.save();

        // Send payment receipt email
        try {
          const userEmail = booking.user?.personal_info?.email;
          const customerName =
            booking.user?.personal_info?.fullname ||
            booking.user?.personal_info?.username ||
            "Customer";
          const hotelName = booking.hotel?.name || "Hotel";

          if (userEmail) {
            await sendPaymentReceipt({
              email: userEmail,
              customerName: customerName,
              bookingId: booking._id,
              hotelName: hotelName,
              checkInDate: booking.startDate,
              checkOutDate: booking.endDate,
              totalPrice: booking.totalPrice,
              paymentMethod: "MoMo",
              transactionId: transId,
            });
            console.log(`✅ Payment receipt sent to ${userEmail}`);
          } else {
            console.warn(`⚠️ No email found for booking ${bookingId}`);
          }
        } catch (emailError) {
          console.error("❌ Failed to send payment receipt:", emailError);
        }

        // Send real-time notification to user
        try {
          const notification = createNotification(
            NotificationTypes.PAYMENT_SUCCESS,
            "Thanh toán thành công",
            `Đơn đặt phòng #${bookingId} đã được thanh toán thành công qua MoMo`,
            {
              bookingId: booking._id,
              amount: booking.totalPrice,
              paymentMethod: "MoMo",
              transactionId: transId,
            }
          );
          sendNotificationToUser(booking.user._id, notification);
        } catch (notifError) {
          console.error(
            "❌ Failed to send real-time notification:",
            notifError
          );
        }

        // Notify hotel partner about successful payment
        try {
          const Hotel = require("../models/Hotel");
          const hotel = await Hotel.findById(booking.hotel._id).select(
            "partner name"
          );
          if (hotel && hotel.partner) {
            const partnerNotification = createNotification(
              NotificationTypes.PAYMENT_SUCCESS,
              "Thanh toán đã xác nhận",
              `Khách hàng đã thanh toán thành công cho đơn đặt phòng tại ${hotel.name}`,
              {
                bookingId: booking._id,
                hotelName: hotel.name,
                amount: booking.totalPrice,
                paymentMethod: "MoMo",
                transactionId: transId,
              }
            );
            sendNotificationToUser(hotel.partner, partnerNotification);
          }
        } catch (partnerNotifError) {
          console.error(
            "❌ Failed to send partner payment notification:",
            partnerNotifError
          );
        }

        console.log(`Payment successful for booking ${bookingId}`);

        return res
          .status(200)
          .json({ success: true, message: "Payment processed successfully" });
      } else {
        // Payment failed
        booking.paymentStatus = "failed";
        await booking.save();

        console.log(`Payment failed for booking ${bookingId}: ${message}`);

        return res
          .status(200)
          .json({ success: false, message: "Payment failed" });
      }
    } catch (error) {
      console.error("MoMo Callback Error:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  },

  // For frontend redirect (after user completes payment)
  handleMoMoRedirect: async (req, res) => {
    try {
      const { orderId, resultCode, message } = req.query;

      const bookingId = orderId.split("_")[0];

      if (resultCode == 0 || resultCode === "0") {
        // Redirect to success page
        return res.redirect(
          `${process.env.FRONTEND_URL}/booking/success?bookingId=${bookingId}`
        );
      } else {
        // Redirect to failure page
        return res.redirect(
          `${process.env.FRONTEND_URL}/booking/failed?bookingId=${bookingId}&message=${encodeURIComponent(message)}`
        );
      }
    } catch (error) {
      console.error("MoMo Redirect Error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/booking/error`);
    }
  },

  // ==================== VNPAY PAYMENT ====================

  // Create VNPay payment
  createVNPayPayment: async (req, res) => {
    try {
      console.log("📝 VNPay Payment Request:", {
        body: req.body,
        userId: req.user.id,
      });

      const { bookingId } = req.body;
      const userId = req.user.id;

      // Find booking
      const booking = await Booking.findOne({ _id: bookingId, user: userId });

      console.log("🔍 Booking found:", booking ? "Yes" : "No");

      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found." });
      }

      console.log("💰 Booking details:", {
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
      });

      if (booking.paymentStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This booking has already been processed.",
        });
      }

      // Create VNPay payment URL
      const orderId = `${bookingId}_${Date.now()}`;
      const amount = booking.totalPrice;
      const orderInfo = `Payment for booking ${bookingId}`;
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        "127.0.0.1";

      console.log("🚀 Creating VNPay payment URL...");

      const paymentUrl = createVNPayPaymentUrl({
        orderId,
        amount,
        orderInfo,
        ipAddr,
        returnUrl:
          process.env.VNPAY_RETURN_URL ||
          `${process.env.BACKEND_URL || "http://localhost:8000"}/api/payment/vnpay/callback`,
      });

      // Update booking with payment info
      booking.paymentId = orderId;
      booking.paymentMethod = "vnpay";
      booking.paymentStatus = "processing";
      await booking.save();

      console.log("✅ VNPay payment URL created:", paymentUrl);

      return res.status(200).json({
        success: true,
        message: "Payment URL created successfully",
        paymentUrl,
        orderId,
        bookingId: booking._id,
      });
    } catch (error) {
      console.error("❌ VNPay Payment Error:", error);
      console.error("   Error details:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  },

  // VNPay Callback (return URL)
  handleVNPayCallback: async (req, res) => {
    try {
      console.log("📥 VNPay Callback received:", req.query);

      const vnpayParams = req.query;

      // Verify signature
      const isValid = verifyVNPayCallback(vnpayParams);

      if (!isValid) {
        console.error("❌ Invalid VNPay signature");
        return res.redirect(
          `${process.env.FRONTEND_URL}/booking/failed?message=${encodeURIComponent("Invalid payment signature")}`
        );
      }

      const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } =
        vnpayParams;

      // Extract bookingId from orderId
      const bookingId = vnp_TxnRef.split("_")[0];

      const booking = await Booking.findById(bookingId)
        .populate(
          "user",
          "personal_info.email personal_info.fullname personal_info.username"
        )
        .populate("hotel", "name")
        .populate("room", "roomType");

      if (!booking) {
        console.error("❌ Booking not found:", bookingId);
        return res.redirect(
          `${process.env.FRONTEND_URL}/booking/failed?message=${encodeURIComponent("Booking not found")}`
        );
      }

      // Check payment result
      if (vnp_ResponseCode === "00") {
        // Payment successful
        booking.paymentStatus = "confirmed";
        booking.status = "confirmed";
        booking.transactionId = vnp_TransactionNo;
        await booking.save();

        // Send payment receipt email
        try {
          const userEmail = booking.user?.personal_info?.email;
          const customerName =
            booking.user?.personal_info?.fullname ||
            booking.user?.personal_info?.username ||
            "Customer";
          const hotelName = booking.hotel?.name || "Hotel";

          if (userEmail) {
            await sendPaymentReceipt({
              email: userEmail,
              customerName: customerName,
              bookingId: booking._id,
              hotelName: hotelName,
              checkInDate: booking.startDate,
              checkOutDate: booking.endDate,
              totalPrice: booking.totalPrice,
              paymentMethod: "VNPay",
              transactionId: vnp_TransactionNo,
            });
            console.log(`✅ Payment receipt sent to ${userEmail}`);
          } else {
            console.warn(`⚠️ No email found for booking ${bookingId}`);
          }
        } catch (emailError) {
          console.error("❌ Failed to send payment receipt:", emailError);
        }

        // Send real-time notification to user
        try {
          const notification = createNotification(
            NotificationTypes.PAYMENT_SUCCESS,
            "Thanh toán thành công",
            `Đơn đặt phòng #${bookingId} đã được thanh toán thành công qua VNPay`,
            {
              bookingId: booking._id,
              amount: booking.totalPrice,
              paymentMethod: "VNPay",
              transactionId: vnp_TransactionNo,
            }
          );
          sendNotificationToUser(booking.user._id, notification);
        } catch (notifError) {
          console.error(
            "❌ Failed to send real-time notification:",
            notifError
          );
        }

        // Notify hotel partner about successful payment
        try {
          const Hotel = require("../models/Hotel");
          const hotel = await Hotel.findById(booking.hotel._id).select(
            "partner name"
          );
          if (hotel && hotel.partner) {
            const partnerNotification = createNotification(
              NotificationTypes.PAYMENT_SUCCESS,
              "Thanh toán đã xác nhận",
              `Khách hàng đã thanh toán thành công cho đơn đặt phòng tại ${hotel.name}`,
              {
                bookingId: booking._id,
                hotelName: hotel.name,
                amount: booking.totalPrice,
                paymentMethod: "VNPay",
                transactionId: vnp_TransactionNo,
              }
            );
            sendNotificationToUser(hotel.partner, partnerNotification);
          }
        } catch (partnerNotifError) {
          console.error(
            "❌ Failed to send partner payment notification:",
            partnerNotifError
          );
        }

        console.log(`✅ VNPay payment successful for booking ${bookingId}`);

        return res.redirect(
          `${process.env.FRONTEND_URL}/booking/success?bookingId=${bookingId}`
        );
      } else {
        // Payment failed
        booking.paymentStatus = "failed";
        await booking.save();

        const errorMessage = parseVNPayResponseCode(vnp_ResponseCode);
        console.log(
          `❌ VNPay payment failed for booking ${bookingId}: ${errorMessage}`
        );

        return res.redirect(
          `${process.env.FRONTEND_URL}/booking/failed?bookingId=${bookingId}&message=${encodeURIComponent(errorMessage)}`
        );
      }
    } catch (error) {
      console.error("❌ VNPay Callback Error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL}/booking/error?message=${encodeURIComponent("Payment processing error")}`
      );
    }
  },

  // VNPay IPN (Instant Payment Notification)
  handleVNPayIPN: async (req, res) => {
    try {
      console.log("📥 VNPay IPN received:", req.query);

      const vnpayParams = req.query;

      // Verify signature
      const isValid = verifyVNPayCallback(vnpayParams);

      if (!isValid) {
        console.error("❌ Invalid VNPay IPN signature");
        return res
          .status(200)
          .json({ RspCode: "97", Message: "Invalid signature" });
      }

      const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } =
        vnpayParams;

      // Extract bookingId from orderId
      const bookingId = vnp_TxnRef.split("_")[0];

      const booking = await Booking.findById(bookingId)
        .populate(
          "user",
          "personal_info.email personal_info.fullname personal_info.username"
        )
        .populate("hotel", "name")
        .populate("room", "roomType");

      if (!booking) {
        console.error("❌ Booking not found:", bookingId);
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Booking not found" });
      }

      // Check payment result
      if (vnp_ResponseCode === "00") {
        // Payment successful
        if (booking.paymentStatus !== "confirmed") {
          booking.paymentStatus = "confirmed";
          booking.status = "confirmed";
          booking.transactionId = vnp_TransactionNo;
          await booking.save();

          console.log(
            `✅ VNPay IPN: Payment confirmed for booking ${bookingId}`
          );
        }

        return res.status(200).json({ RspCode: "00", Message: "Success" });
      } else {
        // Payment failed
        booking.paymentStatus = "failed";
        await booking.save();

        console.log(`❌ VNPay IPN: Payment failed for booking ${bookingId}`);

        return res.status(200).json({ RspCode: "00", Message: "Success" });
      }
    } catch (error) {
      console.error("❌ VNPay IPN Error:", error);
      res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  },
};

module.exports = paymentController;
