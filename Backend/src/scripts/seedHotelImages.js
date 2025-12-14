const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

// Sample hotel images from Unsplash (free to use)
const hotelImageSets = [
  [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
  ],
  [
    "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
    "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
    "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800",
    "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
  ],
  [
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  ],
];

// Sample room images
const roomImageSets = [
  // Standard rooms
  [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
  ],
  // Deluxe rooms
  [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
  ],
  // Suite rooms
  [
    "https://images.unsplash.com/photo-1617104424032-7d6c3a8b2f16?w=800",
    "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=800",
    "https://images.unsplash.com/photo-1560185127-6a7e6c5c2d4d?w=800",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
  ],
  // Family rooms
  [
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
  ],
  // Executive rooms
  [
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800",
    "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800",
    "https://images.unsplash.com/photo-1559508551-44bff1de756b?w=800",
  ],
];

async function seedHotelImages() {
  try {
    // Load environment variables
    require("dotenv").config();

    // Connect to MongoDB (use env variable or fallback to local)
    const mongoUrl =
      process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/blog-website";
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");

    // Get all hotels
    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels`);

    let hotelUpdateCount = 0;
    let roomUpdateCount = 0;

    // Update each hotel with images
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      const imageSetIndex = i % hotelImageSets.length;
      const hotelImages = hotelImageSets[imageSetIndex];

      // Update hotel images if empty or has less than 3 images
      if (!hotel.images || hotel.images.length < 3) {
        hotel.images = hotelImages;
        await hotel.save();
        hotelUpdateCount++;
        console.log(`✅ Updated images for hotel: ${hotel.name}`);
      }

      // Get all rooms for this hotel
      const rooms = await Room.find({ hotel: hotel._id });
      console.log(`  Found ${rooms.length} rooms for ${hotel.name}`);

      // Update each room with images
      for (let j = 0; j < rooms.length; j++) {
        const room = rooms[j];

        // Select image set based on room type
        let roomImageSet;
        const roomType = room.roomType?.toLowerCase() || "standard";

        if (roomType.includes("suite")) {
          roomImageSet = roomImageSets[2];
        } else if (
          roomType.includes("deluxe") ||
          roomType.includes("executive")
        ) {
          roomImageSet = roomImageSets[1];
        } else if (roomType.includes("family")) {
          roomImageSet = roomImageSets[3];
        } else {
          roomImageSet = roomImageSets[0];
        }

        // Update room images if empty or has less than 2 images
        if (!room.images || room.images.length < 2) {
          room.images = roomImageSet;
          await room.save();
          roomUpdateCount++;
          console.log(
            `  ✅ Updated images for room: ${room.title || room.roomNumber}`
          );
        }
      }
    }

    console.log("\n🎉 Seed completed!");
    console.log(`📊 Updated ${hotelUpdateCount} hotels with images`);
    console.log(`📊 Updated ${roomUpdateCount} rooms with images`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding images:", error);
    process.exit(1);
  }
}

// Run the seed function
seedHotelImages();
