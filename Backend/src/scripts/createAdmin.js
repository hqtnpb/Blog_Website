const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

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

const createAdminUser = async () => {
  try {
    console.log("🚀 Starting admin user creation...");

    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      "personal_info.email": "admin@pathway.com",
    });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists");
      console.log("   Email: admin@pathway.com");
      console.log("   Role:", existingAdmin.personal_info.role);

      // Update role to admin if not already
      if (existingAdmin.personal_info.role !== "admin") {
        existingAdmin.personal_info.role = "admin";
        await existingAdmin.save();
        console.log("✅ Updated user role to admin");
      }

      process.exit(0);
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = await User.create({
      personal_info: {
        fullname: "System Administrator",
        email: "admin@pathway.com",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        bio: "System Administrator with full access to platform management",
        profile_img:
          "https://api.dicebear.com/6.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4",
      },
      google_auth: false,
    });

    console.log("✅ Admin user created successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log("   Email: admin@pathway.com");
    console.log("   Password: Admin@123");
    console.log("   Role: admin");
    console.log("\n🔐 Login at: /signin");
    console.log("🎯 Access System Admin Dashboard at: /system-admin/dashboard");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
