const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const User = require("../models/User");

dotenv.config();

const sampleHotels = [
  {
    name: "Grand Palace Hotel",
    description:
      "Luxury 5-star hotel in the heart of Barcelona with stunning city views",
    address: "123 La Rambla",
    city: "Barcelona",
    country: "Spain",
    rating: 5,
    reviewCount: 248,
    type: "Hotel",
    distanceFromCenter: 0.5,
    hasFreeWifi: true,
    hasPool: true,
    hasParking: true,
    hasGym: true,
    hasSpa: true,
    hasRestaurant: true,
    hasBar: true,
    hasAC: true,
    hasMetro: true,
    freeCancellation: true,
    breakfastIncluded: true,
    noPrePayment: false,
    discount: 15,
    originalPrice: 294,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    ],
  },
  {
    name: "Seaside Resort & Spa",
    description:
      "Beachfront resort with private beach access and world-class spa facilities",
    address: "456 Beach Avenue",
    city: "Barcelona",
    country: "Spain",
    rating: 4.5,
    reviewCount: 189,
    type: "Resort",
    distanceFromCenter: 3.2,
    hasFreeWifi: true,
    hasPool: true,
    hasParking: true,
    hasGym: true,
    hasSpa: true,
    hasRestaurant: true,
    hasBar: true,
    hasAC: true,
    hasMetro: false,
    freeCancellation: true,
    breakfastIncluded: true,
    noPrePayment: true,
    discount: 20,
    originalPrice: 300,
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
    ],
  },
  {
    name: "Urban Boutique Hotel",
    description:
      "Modern boutique hotel in Gothic Quarter with contemporary design",
    address: "789 Gothic Street",
    city: "Barcelona",
    country: "Spain",
    rating: 4.2,
    reviewCount: 124,
    type: "Hotel",
    distanceFromCenter: 0.8,
    hasFreeWifi: true,
    hasPool: false,
    hasParking: false,
    hasGym: true,
    hasSpa: false,
    hasRestaurant: true,
    hasBar: true,
    hasAC: true,
    hasMetro: true,
    freeCancellation: true,
    breakfastIncluded: false,
    noPrePayment: false,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    ],
  },
  {
    name: "Mountain View Lodge",
    description: "Cozy mountain retreat with panoramic views and hiking trails",
    address: "321 Mountain Road",
    city: "Madrid",
    country: "Spain",
    rating: 4.8,
    reviewCount: 312,
    type: "Resort",
    distanceFromCenter: 15.5,
    hasFreeWifi: true,
    hasPool: true,
    hasParking: true,
    hasGym: true,
    hasSpa: true,
    hasRestaurant: true,
    hasBar: true,
    hasAC: true,
    hasMetro: false,
    freeCancellation: true,
    breakfastIncluded: true,
    noPrePayment: true,
    discount: 10,
    originalPrice: 350,
    images: [
      "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
  },
  {
    name: "City Center Business Hotel",
    description:
      "Perfect for business travelers with modern conference facilities",
    address: "555 Business Plaza",
    city: "Madrid",
    country: "Spain",
    rating: 4.0,
    reviewCount: 95,
    type: "Hotel",
    distanceFromCenter: 1.2,
    hasFreeWifi: true,
    hasPool: false,
    hasParking: true,
    hasGym: true,
    hasSpa: false,
    hasRestaurant: true,
    hasBar: true,
    hasAC: true,
    hasMetro: true,
    freeCancellation: false,
    breakfastIncluded: false,
    noPrePayment: false,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    ],
  },
];

const sampleRooms = [
  {
    type: "Suite",
    title: "Deluxe King Suite",
    desc: "Spacious suite with king bed and city views",
    pricePerNight: 250,
    maxAdults: 2,
    maxChildren: 1,
    roomType: "Suite",
    amenities: ["Wi-Fi", "Air Conditioning", "Mini Bar", "Room Service"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    ],
  },
  {
    type: "Standard",
    title: "Standard Double Room",
    desc: "Comfortable room with double bed",
    pricePerNight: 150,
    maxAdults: 2,
    maxChildren: 0,
    roomType: "Standard",
    amenities: ["Wi-Fi", "Air Conditioning", "TV"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    ],
  },
  {
    type: "Family",
    title: "Family Room",
    desc: "Large room perfect for families with children",
    pricePerNight: 200,
    maxAdults: 2,
    maxChildren: 2,
    roomType: "Family Room",
    amenities: ["Wi-Fi", "Air Conditioning", "TV", "Mini Fridge"],
    images: [
      "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
    ],
  },
  {
    type: "Suite",
    title: "Ocean View Suite",
    desc: "Luxury suite with private balcony and ocean views",
    pricePerNight: 350,
    maxAdults: 2,
    maxChildren: 1,
    roomType: "Suite",
    amenities: ["Wi-Fi", "Air Conditioning", "Balcony", "Spa", "Breakfast"],
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    ],
  },
  {
    title: "Business Executive Room",
    desc: "Modern room with workspace and high-speed internet",
    pricePerNight: 180,
    maxAdults: 1,
    maxChildren: 0,
    roomType: "Business",
    amenities: ["Wi-Fi", "Air Conditioning", "Desk", "Coffee Maker"],
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    ],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      autoIndex: true,
    });
    console.log("✅ MongoDB connected");

    // Clear existing data
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    console.log("🗑️  Cleared existing hotels and rooms");

    // Find or create a default partner user
    let partner = await User.findOne({ "personal_info.role": "partner" });
    if (!partner) {
      partner = await User.create({
        personal_info: {
          fullname: "Default Partner",
          email: "partner@example.com",
          username: "defaultpartner",
          role: "partner",
        },
        google_auth: false,
      });
      console.log("✅ Created default partner user");
    } else {
      console.log("✅ Using existing partner:", partner.personal_info.fullname);
    }

    // Create hotels with rooms
    for (let i = 0; i < sampleHotels.length; i++) {
      const hotelData = {
        ...sampleHotels[i],
        partner: partner._id, // Add partner ID
      };

      // Create hotel
      const hotel = await Hotel.create(hotelData);
      console.log(`✅ Created hotel: ${hotel.name}`);

      // Create 2-3 rooms for each hotel
      const roomsToCreate = sampleRooms.slice(
        0,
        Math.floor(Math.random() * 2) + 2
      );
      const createdRooms = [];

      for (const roomData of roomsToCreate) {
        const room = await Room.create({
          ...roomData,
          hotel: hotel._id,
          roomNumber: `${i + 1}0${createdRooms.length + 1}`,
        });
        createdRooms.push(room._id);
        console.log(`  ✅ Created room: ${room.title}`);
      }

      // Update hotel with room references
      hotel.rooms = createdRooms;
      await hotel.save();
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log(`📊 Created ${sampleHotels.length} hotels with rooms`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
