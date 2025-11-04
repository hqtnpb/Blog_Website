const express = require("express");
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
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleWare/authMiddleWare");
dotenv.config();
const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            autoIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Thoát chương trình nếu không kết nối được
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

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

module.exports = { verifyJWT };
