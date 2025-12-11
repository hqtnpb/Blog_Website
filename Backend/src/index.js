const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const uploadRoute = require("./routes/upload");
const createBlogRoute = require("./routes/createBlog");
const renderBlogsRoute = require("./routes/renderBlogs");
const userRoute = require("./routes/user");
const commentRoute = require("./routes/comment");
const notificationsRoute = require("./routes/notifications");
const partnerRoute = require("./routes/partner");
const hotelRoute = require("./routes/hotel");
const bookingRoute = require("./routes/booking");
const reviewRoute = require("./routes/review");
const dashboardRoute = require("./routes/dashboard");
const paymentRoute = require("./routes/payment");
const searchRoute = require("./routes/search");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleWare/authMiddleWare");
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      autoIndex: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

connectDB();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);

app.use("/api/upload", uploadRoute);

app.use("/api/create", verifyJWT, createBlogRoute);

app.use("/api/render", renderBlogsRoute);

app.use("/api/user", userRoute);

app.use("/api/comment", commentRoute);

app.use("/api/notifications", notificationsRoute);

app.use("/api/partner", partnerRoute);

app.use("/api/hotels", hotelRoute);

app.use("/api/booking", bookingRoute);

app.use("/api/reviews", reviewRoute);

app.use("/api/dashboard", dashboardRoute);

app.use("/api/payment", paymentRoute);

app.use("/api", searchRoute);
console.log("✅ Search routes mounted at /api");

// Socket.IO for real-time notifications
const connectedUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User joins with their ID
  socket.on("join", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} joined with socket ${socket.id}`);
      console.log(`📊 Total connected users: ${connectedUsers.size}`);
      console.log(`📋 Connected user IDs:`, Array.from(connectedUsers.keys()));
    } else {
      console.warn(`⚠️ Join attempt with invalid userId:`, userId);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io and connectedUsers available globally
global.io = io;
global.connectedUsers = connectedUsers;

server.listen(8000, () => {
  console.log("Server is running on port 8000");
  console.log("🔌 Socket.IO is ready for real-time notifications");
});

module.exports = { verifyJWT, io, connectedUsers };
