const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const User = require("../models/User");

dotenv.config();

// Hotel names templates
const hotelNames = [
  "Grand Palace Hotel",
  "Royal Crown Hotel",
  "Golden Lotus Resort",
  "Emerald Bay Hotel",
  "Sunset Paradise Resort",
  "Diamond Star Hotel",
  "Pearl Residence",
  "Silver Moon Hotel",
  "Ocean View Resort",
  "Mountain Retreat Hotel",
];

const hotelTypes = ["Hotel", "Resort", "Villa"];

// Cities data with unique hotel images (30 images per city for 10 hotels)
const cities = [
  {
    name: "Hà Nội",
    country: "Việt Nam",
    hotelImages: [
      [
        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
        "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800",
        "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=800",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
      ],
    ],
  },
  {
    name: "Đà Nẵng",
    country: "Việt Nam",
    hotelImages: [
      [
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
        "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      ],
    ],
  },
  {
    name: "TP Hồ Chí Minh",
    country: "Việt Nam",
    hotelImages: [
      [
        "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800",
        "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
        "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
        "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
        "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
      ],
    ],
  },
  {
    name: "Nha Trang",
    country: "Việt Nam",
    hotelImages: [
      [
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
        "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
        "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=800",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
        "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
      ],
    ],
  },
  {
    name: "Phú Quốc",
    country: "Việt Nam",
    hotelImages: [
      [
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
        "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800",
        "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=800",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
        "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800",
      ],
      [
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      ],
    ],
  },
];

function generateHotels() {
  const hotels = [];

  cities.forEach((city, cityIndex) => {
    for (let i = 0; i < 10; i++) {
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5-5.0
      const hasDiscount = Math.random() > 0.6;
      const discount = hasDiscount ? Math.floor(Math.random() * 25) + 10 : 0;

      hotels.push({
        name: `${hotelNames[i]} ${city.name}`,
        description: `Khách sạn ${hotelNames[i].toLowerCase()} sang trọng tại ${city.name} với đầy đủ tiện nghi hiện đại và dịch vụ 5 sao`,
        address: `${Math.floor(Math.random() * 500) + 1} Đường ${["Trần Hưng Đạo", "Lê Duẩn", "Nguyễn Huệ", "Hai Bà Trưng", "Võ Nguyên Giáp"][i % 5]}`,
        city: city.name,
        country: city.country,
        rating: parseFloat(rating),
        reviewCount: Math.floor(Math.random() * 400) + 50,
        type: hotelTypes[i % 3],
        distanceFromCenter: (Math.random() * 10 + 0.5).toFixed(1),
        hasFreeWifi: true,
        hasPool: Math.random() > 0.3,
        hasParking: Math.random() > 0.2,
        hasGym: Math.random() > 0.4,
        hasSpa: Math.random() > 0.5,
        hasRestaurant: true,
        hasBar: Math.random() > 0.3,
        hasAC: true,
        hasMetro: cityIndex < 3, // Only major cities
        freeCancellation: Math.random() > 0.3,
        breakfastIncluded: Math.random() > 0.5,
        noPrePayment: Math.random() > 0.4,
        discount: discount,
        originalPrice:
          discount > 0 ? Math.floor(Math.random() * 200) + 250 : null,
        images: city.hotelImages[i], // Each hotel gets unique set of 3 images
      });
    }
  });

  return hotels;
}

const sampleHotels = generateHotels();

// Room images - unique images for each room type (70 unique room images)
const roomImages = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
  "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
  "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800",
  "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800",
  "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800",
  "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
  "https://images.unsplash.com/photo-1578898886111-aa9ef99a0c99?w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800",
  "https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800",
  "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800",
  "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
  "https://images.unsplash.com/photo-1600121848568-2d9a0fda9f8f?w=800",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
  "https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800",
  "https://images.unsplash.com/photo-1600047508788-786f14fc0bad?w=800",
  "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800",
  "https://images.unsplash.com/photo-1600240644455-3edc55c375fe?w=800",
  "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800",
  "https://images.unsplash.com/photo-1600147131759-de72a01f75c8?w=800",
  "https://images.unsplash.com/photo-1600132806608-231446b2e7af?w=800",
  "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800",
  "https://images.unsplash.com/photo-1600121848632-8c1e39fb7e2c?w=800",
  "https://images.unsplash.com/photo-1600121848668-1b9c717e1e52?w=800",
  "https://images.unsplash.com/photo-1600121848661-d0148de0de04?w=800",
  "https://images.unsplash.com/photo-1600121848676-d85fb4a82ebe?w=800",
  "https://images.unsplash.com/photo-1600121848683-b29d6bc83609?w=800",
  "https://images.unsplash.com/photo-1600076912307-c382d7eec4bb?w=800",
  "https://images.unsplash.com/photo-1600076890806-6fae223b10a3?w=800",
  "https://images.unsplash.com/photo-1600076890671-ca6714e1ac69?w=800",
  "https://images.unsplash.com/photo-1600076890747-f5f7e84f5f4e?w=800",
  "https://images.unsplash.com/photo-1600076890853-d31c9b3f7d66?w=800",
  "https://images.unsplash.com/photo-1600076890869-b5c15ae69e34?w=800",
  "https://images.unsplash.com/photo-1600076890920-1a5d2b1f9c4d?w=800",
  "https://images.unsplash.com/photo-1600076890928-9f3efbc48c67?w=800",
  "https://images.unsplash.com/photo-1600076890973-3e4b1be8ed1c?w=800",
];

// Room templates - Using valid enum values from Room model
const roomTemplates = [
  {
    type: "Suite",
    titles: [
      "Deluxe King Suite",
      "Presidential Suite",
      "Executive Suite",
      "Royal Suite",
    ],
    desc: "Phòng suite sang trọng với đầy đủ tiện nghi cao cấp",
    priceRange: [1500000, 3000000],
    maxAdults: 2,
    maxChildren: 1,
    roomType: "Suite",
    amenities: [
      "Wi-Fi",
      "Điều hòa",
      "Mini Bar",
      "Dịch vụ phòng",
      "Bồn tắm nằm",
    ],
  },
  {
    type: "Deluxe",
    titles: ["Deluxe Double Room", "Deluxe King Room", "Deluxe Twin Room"],
    desc: "Phòng deluxe rộng rãi với view đẹp",
    priceRange: [1000000, 2000000],
    maxAdults: 2,
    maxChildren: 1,
    roomType: "Deluxe",
    amenities: ["Wi-Fi", "Điều hòa", "TV màn hình phẳng", "Minibar", "Két sắt"],
  },
  {
    type: "Executive",
    titles: [
      "Executive Double Room",
      "Executive King Room",
      "Executive City View",
    ],
    desc: "Phòng executive tiện nghi với không gian thoải mái",
    priceRange: [800000, 1500000],
    maxAdults: 2,
    maxChildren: 1,
    roomType: "Executive",
    amenities: ["Wi-Fi", "Điều hòa", "TV", "Bàn làm việc"],
  },
  {
    type: "Standard",
    titles: [
      "Standard Double Room",
      "Standard Twin Room",
      "Standard Queen Room",
    ],
    desc: "Phòng standard ấm cúng với tiện nghi cơ bản",
    priceRange: [400000, 800000],
    maxAdults: 2,
    maxChildren: 0,
    roomType: "Standard",
    amenities: ["Wi-Fi", "Điều hòa", "TV"],
  },
  {
    type: "Family",
    titles: ["Family Room", "Family Suite", "Connecting Rooms"],
    desc: "Phòng gia đình rộng rãi phù hợp cho cả gia đình",
    priceRange: [1200000, 2500000],
    maxAdults: 2,
    maxChildren: 2,
    roomType: "Family Room",
    amenities: ["Wi-Fi", "Điều hòa", "TV", "Tủ lạnh mini", "Khu vực sinh hoạt"],
  },
  {
    type: "Twin",
    titles: ["Twin Room", "Twin City View", "Twin Deluxe"],
    desc: "Phòng twin với 2 giường đơn",
    priceRange: [500000, 1200000],
    maxAdults: 2,
    maxChildren: 0,
    roomType: "Twin Room",
    amenities: ["Wi-Fi", "Điều hòa", "TV", "Bàn làm việc"],
  },
  {
    type: "Double",
    titles: ["Double Room", "Double Comfort", "Double Economy"],
    desc: "Phòng đôi tiện nghi với giá tốt",
    priceRange: [200000, 600000],
    maxAdults: 2,
    maxChildren: 0,
    roomType: "Double Room",
    amenities: ["Wi-Fi", "Điều hòa", "TV"],
  },
];

let roomImageIndex = 0;

function generateRoomsForHotel() {
  const rooms = [];

  for (let i = 0; i < 10; i++) {
    const template = roomTemplates[i % roomTemplates.length];
    // Generate random price and round to nearest 50,000 VND for clean numbers
    const randomPrice =
      Math.random() * (template.priceRange[1] - template.priceRange[0]) +
      template.priceRange[0];
    const pricePerNight = Math.round(randomPrice / 50000) * 50000;

    // Get unique image for each room
    const uniqueImage = roomImages[roomImageIndex % roomImages.length];
    roomImageIndex++;

    rooms.push({
      type: template.type,
      title: template.titles[i % template.titles.length],
      desc: template.desc,
      pricePerNight: pricePerNight,
      maxAdults: template.maxAdults,
      maxChildren: template.maxChildren,
      roomType: template.roomType,
      amenities: [...template.amenities],
      images: [uniqueImage], // Each room gets a unique image
    });
  }

  return rooms;
}

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

    // Find or create partner1 user
    let partner = await User.findOne({
      "personal_info.email": "partner1@example.com",
    });
    if (!partner) {
      const hashedPassword = await bcrypt.hash("Partner1@123", 10);
      partner = await User.create({
        personal_info: {
          fullname: "Partner One",
          email: "partner1@example.com",
          username: "partner1",
          password: hashedPassword,
          role: "partner",
        },
        google_auth: false,
      });
      console.log(
        "✅ Created partner1 user (email: partner1@example.com, password: Partner1@123)"
      );
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

      // Create 10 rooms for each hotel
      const roomsToCreate = generateRoomsForHotel();
      const createdRooms = [];

      for (const roomData of roomsToCreate) {
        const room = await Room.create({
          ...roomData,
          hotel: hotel._id,
          roomNumber: `${(i + 1) * 100 + createdRooms.length + 1}`,
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
