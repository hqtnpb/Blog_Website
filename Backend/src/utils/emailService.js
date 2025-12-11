const nodemailer = require("nodemailer");
const {
  bookingConfirmationEmail,
  paymentReceiptEmail,
  bookingCancellationEmail,
  passwordResetEmail,
} = require("./emailTemplates");

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generic email sender
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"Travel Booking" <noreply@travelbooking.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// 1. Send booking confirmation email
const sendBookingConfirmation = async (bookingData) => {
  const emailData = {
    guestName: bookingData.guestName,
    guestEmail: bookingData.guestEmail,
    guestPhone: bookingData.guestPhone,
    bookingId: bookingData._id || bookingData.bookingId,
    hotelName: bookingData.hotelName || bookingData.hotel?.name,
    roomTitle: bookingData.roomTitle || bookingData.room?.title,
    checkIn: bookingData.startDate || bookingData.checkIn,
    checkOut: bookingData.endDate || bookingData.checkOut,
    totalPrice: bookingData.totalPrice,
    paymentStatus: bookingData.paymentStatus || "pending",
  };

  const html = bookingConfirmationEmail(emailData);
  const subject = `Xác nhận đặt phòng #${emailData.bookingId} - Travel Booking`;

  return await sendEmail(bookingData.guestEmail, subject, html);
};

// 2. Send payment receipt email
const sendPaymentReceipt = async (paymentData) => {
  const emailData = {
    guestName: paymentData.customerName || paymentData.guestName,
    bookingId: paymentData.bookingId || paymentData.booking?._id,
    paymentId:
      paymentData.transactionId || paymentData._id || paymentData.paymentId,
    hotelName: paymentData.hotelName,
    roomTitle: paymentData.roomTitle,
    totalPrice: paymentData.totalPrice || paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    paymentDate: paymentData.createdAt || new Date(),
  };

  const html = paymentReceiptEmail(emailData);
  const subject = `Hóa đơn thanh toán #${emailData.paymentId} - Travel Booking`;

  const recipientEmail = paymentData.email || paymentData.guestEmail;
  if (!recipientEmail) {
    throw new Error("No recipient email provided");
  }

  return await sendEmail(recipientEmail, subject, html);
};

// 3. Send booking cancellation email
const sendBookingCancellation = async (bookingData, refundAmount = 0) => {
  const emailData = {
    guestName: bookingData.guestName,
    bookingId: bookingData._id || bookingData.bookingId,
    hotelName: bookingData.hotelName || bookingData.hotel?.name,
    roomTitle: bookingData.roomTitle || bookingData.room?.title,
    checkIn: bookingData.startDate || bookingData.checkIn,
    checkOut: bookingData.endDate || bookingData.checkOut,
    refundAmount: refundAmount,
    cancellationDate: new Date(),
  };

  const html = bookingCancellationEmail(emailData);
  const subject = `Hủy đặt phòng #${emailData.bookingId} - Travel Booking`;

  return await sendEmail(bookingData.guestEmail, subject, html);
};

// 4. Send password reset email
const sendPasswordReset = async (userData, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const expiryTime = 60; // minutes

  const emailData = {
    userName: userData.personal_info?.fullname || userData.username,
    resetLink,
    expiryTime,
  };

  const html = passwordResetEmail(emailData);
  const subject = "Đặt lại mật khẩu - Travel Booking";

  return await sendEmail(
    userData.personal_info?.email || userData.email,
    subject,
    html
  );
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server is ready to send emails");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendBookingCancellation,
  sendPasswordReset,
  testEmailConnection,
};
