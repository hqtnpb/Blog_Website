require("dotenv").config();
const {
  testEmailConnection,
  sendEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendBookingCancellation,
} = require("./utils/emailService");

// Test email configuration
async function runTests() {
  console.log("🚀 Starting Email Service Tests...\n");

  // Test 1: Connection
  console.log("📡 Test 1: Testing email server connection...");
  const connectionTest = await testEmailConnection();
  console.log(
    connectionTest
      ? "✅ Email server connection successful!\n"
      : "❌ Email server connection failed!\n"
  );

  if (!connectionTest) {
    console.log("⚠️  Please check your .env configuration:");
    console.log("   - EMAIL_HOST");
    console.log("   - EMAIL_PORT");
    console.log("   - EMAIL_USER");
    console.log("   - EMAIL_PASSWORD");
    return;
  }

  // Test 2: Send simple test email
  console.log("📧 Test 2: Sending simple test email...");
  const simpleEmailResult = await sendEmail(
    process.env.EMAIL_USER, // Send to yourself
    "🎉 Test Email from Travel Booking",
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
        <h1 style="color: #667eea;">Email Service Test</h1>
        <p>Chúc mừng! Email service của bạn đã hoạt động thành công.</p>
        <p><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</p>
        <p style="margin-top: 30px; color: #666;">
          Nếu bạn nhận được email này, có nghĩa là cấu hình email đã đúng! ✅
        </p>
      </div>
    </div>
    `
  );

  if (simpleEmailResult.success) {
    console.log("✅ Simple test email sent successfully!");
    console.log(`   Message ID: ${simpleEmailResult.messageId}\n`);
  } else {
    console.log("❌ Failed to send test email");
    console.log(`   Error: ${simpleEmailResult.error}\n`);
    return;
  }

  // Test 3: Send booking confirmation email (with sample data)
  console.log("📧 Test 3: Sending booking confirmation email...");
  const sampleBookingData = {
    _id: "TEST123456",
    guestName: "Nguyễn Văn Test",
    guestEmail: process.env.EMAIL_USER, // Send to yourself
    guestPhone: "0123456789",
    hotel: { name: "Khách Sạn Test 5 Sao" },
    room: { title: "Phòng Deluxe Hướng Biển" },
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    totalPrice: 3500000,
    paymentStatus: "pending",
  };

  const bookingEmailResult = await sendBookingConfirmation(sampleBookingData);
  console.log(
    bookingEmailResult.success
      ? "✅ Booking confirmation email sent!\n"
      : `❌ Failed: ${bookingEmailResult.error}\n`
  );

  // Test 4: Send payment receipt email
  console.log("📧 Test 4: Sending payment receipt email...");
  const samplePaymentData = {
    guestName: "Nguyễn Văn Test",
    guestEmail: process.env.EMAIL_USER,
    bookingId: "TEST123456",
    paymentId: "PAY987654321",
    hotelName: "Khách Sạn Test 5 Sao",
    roomTitle: "Phòng Deluxe Hướng Biển",
    totalPrice: 3500000,
    paymentMethod: "momo",
    createdAt: new Date(),
  };

  const paymentEmailResult = await sendPaymentReceipt(samplePaymentData);
  console.log(
    paymentEmailResult.success
      ? "✅ Payment receipt email sent!\n"
      : `❌ Failed: ${paymentEmailResult.error}\n`
  );

  // Test 5: Send cancellation email
  console.log("📧 Test 5: Sending booking cancellation email...");
  const sampleCancellationData = {
    _id: "TEST123456",
    guestName: "Nguyễn Văn Test",
    guestEmail: process.env.EMAIL_USER,
    hotel: { name: "Khách Sạn Test 5 Sao" },
    room: { title: "Phòng Deluxe Hướng Biển" },
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  };

  const cancellationEmailResult = await sendBookingCancellation(
    sampleCancellationData,
    3500000 // Full refund
  );
  console.log(
    cancellationEmailResult.success
      ? "✅ Cancellation email sent!\n"
      : `❌ Failed: ${cancellationEmailResult.error}\n`
  );

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(
    `Connection Test:        ${connectionTest ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Simple Email:          ${simpleEmailResult.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Booking Confirmation:  ${bookingEmailResult.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Payment Receipt:       ${paymentEmailResult.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Cancellation Email:    ${cancellationEmailResult.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log("=".repeat(50));

  console.log(`\n📬 Kiểm tra hộp thư của bạn: ${process.env.EMAIL_USER}`);
  console.log("   (Có thể kiểm tra cả thư mục Spam)\n");
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
});
