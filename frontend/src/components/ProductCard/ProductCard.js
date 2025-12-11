import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ProductCard.module.scss";

const cx = classNames.bind(styles);

function ProductCard({ hotel }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  // Default data if hotel is not provided
  const defaultHotel = {
    name: "Sample Hotel",
    images: [],
    city: "Unknown",
    rating: 5.0,
    reviewCount: 0,
    type: "Hotel",
    minRoomPrice: 100,
    rooms: [],
  };

  const hotelData = hotel || defaultHotel;
  const images = hotelData.images || [];
  const totalImages = images.length;

  // Get rooms from either rooms or availableRooms field
  // availableRooms contains full room objects from search
  // rooms might be array of IDs or full objects depending on API
  let hotelRooms = hotelData.availableRooms || [];

  // If no availableRooms, check if rooms is populated
  if (hotelRooms.length === 0 && hotelData.rooms) {
    // Check if rooms are populated (objects) or just IDs (strings)
    if (Array.isArray(hotelData.rooms) && hotelData.rooms.length > 0) {
      // If first element is an object with properties, it's populated
      if (
        typeof hotelData.rooms[0] === "object" &&
        hotelData.rooms[0] !== null &&
        hotelData.rooms[0]._id
      ) {
        hotelRooms = hotelData.rooms;
      }
      // If it's just ObjectId strings, we still want to show the count
      // So we keep the array for counting purposes
      else if (typeof hotelData.rooms[0] === "string") {
        hotelRooms = hotelData.rooms;
      }
    }
  }

  // Calculate room details from available rooms (only if populated)
  const roomDetails =
    hotelRooms.length > 0 && typeof hotelRooms[0] === "object"
      ? hotelRooms[0]
      : {};

  // Extract all amenities from hotel
  const amenitiesList = [];
  if (hotelData.hasFreeWifi)
    amenitiesList.push({ icon: "wifi", label: "Free WiFi" });
  if (hotelData.hasPool) amenitiesList.push({ icon: "pool", label: "Pool" });
  if (hotelData.hasParking)
    amenitiesList.push({ icon: "parking", label: "Free Parking" });
  if (hotelData.hasGym) amenitiesList.push({ icon: "gym", label: "Gym" });
  if (hotelData.hasSpa) amenitiesList.push({ icon: "spa", label: "Spa" });
  if (hotelData.hasRestaurant)
    amenitiesList.push({ icon: "restaurant", label: "Restaurant" });
  if (hotelData.hasBar) amenitiesList.push({ icon: "bar", label: "Bar" });
  if (hotelData.hasAC)
    amenitiesList.push({ icon: "ac", label: "Air Conditioning" });
  if (hotelData.hasRoomService)
    amenitiesList.push({ icon: "service", label: "Room Service" });
  if (hotelData.has24HourFrontDesk)
    amenitiesList.push({ icon: "desk", label: "24-Hour Front Desk" });
  if (hotelData.hasAirportShuttle)
    amenitiesList.push({ icon: "shuttle", label: "Airport Shuttle" });
  if (hotelData.hasBeachAccess)
    amenitiesList.push({ icon: "beach", label: "Beach Access" });
  if (hotelData.hasBreakfast)
    amenitiesList.push({ icon: "breakfast", label: "Breakfast" });

  const nextImage = () => {
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on favorite button or image controls
    if (
      e.target.closest(`.${cx("favorite-btn")}`) ||
      e.target.closest(`.${cx("nav-btn")}`) ||
      e.target.closest(`.${cx("carousel-dots")}`)
    ) {
      return;
    }

    if (hotelData._id || hotelData.id) {
      navigate(`/hotels/${hotelData._id || hotelData.id}`);
    }
  };

  return (
    <div
      className={cx("product-card")}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* Image Slider */}
      <div className={cx("image-slider")}>
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={hotelData.name}
            className={cx("image")}
            loading="lazy"
            width="370"
            height="280"
          />
        ) : (
          <div className={cx("no-image")}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="#ddd">
              <rect width="100" height="100" />
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#999">
                No Image
              </text>
            </svg>
          </div>
        )}

        {/* Image Controls */}
        <div className={cx("image-controls")}>
          <button
            className={cx("favorite-btn", { active: isFavorite })}
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label="Add to favorites"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>

          {totalImages > 1 && (
            <div className={cx("carousel-dots")}>
              {images.map((_, index) => (
                <span
                  key={index}
                  className={cx("dot", { active: index === currentImageIndex })}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Badge */}
        {hotelData.discount && (
          <div className={cx("badge", "getaway-deal")}>Getaway Deal</div>
        )}

        {/* Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              className={cx("nav-btn", "prev")}
              onClick={prevImage}
              aria-label="Previous image"
            >
              &lsaquo;
            </button>
            <button
              className={cx("nav-btn", "next")}
              onClick={nextImage}
              aria-label="Next image"
            >
              &rsaquo;
            </button>
          </>
        )}
      </div>

      {/* Full Details */}
      <div className={cx("full-details")}>
        {/* Hotel Title + Rating */}
        <div className={cx("header")}>
          <div className={cx("hotel-info")}>
            <div className={cx("title-row")}>
              <h3 className={cx("title")}>{hotelData.name}</h3>
              <div className={cx("stars")}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill={
                      i < Math.floor(hotelData.rating || 0)
                        ? "#FAC91E"
                        : "#E0E0E0"
                    }
                  >
                    <path d="M9 2l2.163 4.38 4.837.702-3.5 3.412.826 4.816L9 13.26l-4.326 2.05.826-4.816-3.5-3.412 4.837-.702z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Location Info */}
            <div className={cx("location-info")}>
              <div className={cx("location-btn")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff5b26">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>
                  {hotelData.city}
                  {hotelData.country ? `, ${hotelData.country}` : ""}
                </span>
              </div>

              <span className={cx("separator")}>•</span>
              <span className={cx("distance")}>
                {hotelData.distanceFromCenter || "City center"}
              </span>

              {hotelData.hasMetro && (
                <>
                  <span className={cx("separator")}>•</span>
                  <div className={cx("metro-access")}>
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path fill="#656F81" d="M8 1L2 6v8h12V6L8 1z" />
                    </svg>
                    <span>Metro access</span>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            {hotelData.description && (
              <div className={cx("description")}>
                <p>
                  {hotelData.description.length > 150
                    ? `${hotelData.description.substring(0, 150)}...`
                    : hotelData.description}
                </p>
              </div>
            )}
          </div>

          {/* Guest Rating Badge */}
          <div className={cx("guest-rating")}>
            <div className={cx("review-text")}>
              <p className={cx("rating-label")}>
                {hotelData.rating >= 4.5
                  ? "Xuất sắc"
                  : hotelData.rating >= 4.0
                  ? "Rất tốt"
                  : hotelData.rating >= 3.5
                  ? "Tốt"
                  : "Khá"}
              </p>
              <p className={cx("review-count")}>
                {hotelData.reviewCount || hotelData.roomCount || 0}{" "}
                {hotelData.reviewCount ? "đánh giá" : "phòng"}
              </p>
            </div>
            <div className={cx("rating-badge")}>
              <span className={cx("rating-number")}>
                {(hotelData.rating || 5.0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className={cx("details")}>
          <div className={cx("property-description")}>
            {/* Property Info */}
            <div className={cx("property-info")}>
              <span className={cx("type", "bold")}>
                {roomDetails.roomType || hotelData.type || "Hotel Room"}
              </span>
              {roomDetails.title && (
                <>
                  <span className={cx("separator")}>|</span>
                  <span>{roomDetails.title}</span>
                </>
              )}
              {roomDetails.maxAdults && (
                <>
                  <span className={cx("separator")}>•</span>
                  <span>{roomDetails.maxAdults} người lớn</span>
                </>
              )}
              {roomDetails.maxChildren > 0 && (
                <>
                  <span className={cx("separator")}>•</span>
                  <span>{roomDetails.maxChildren} trẻ em</span>
                </>
              )}
            </div>

            {/* Amenities Chips */}
            <div className={cx("chips")}>
              {amenitiesList.slice(0, 6).map((amenity, index) => (
                <div key={index} className={cx("chip")}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="3" fill="#383E48" />
                  </svg>
                  <span>{amenity.label}</span>
                </div>
              ))}
              {amenitiesList.length > 6 && (
                <div className={cx("chip", "more")}>
                  <span>+{amenitiesList.length - 6} more</span>
                </div>
              )}
            </div>

            {/* Room Information */}
            {hotelRooms && hotelRooms.length > 0 && (
              <div className={cx("room-info")}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#656F81">
                  <path d="M14 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4H1v2h1v2h2v-2h8v2h2v-2h1v-2h-1zm-2-4v4H4V6h8z" />
                </svg>
                <span className={cx("room-count")}>
                  {hotelRooms.length}{" "}
                  {hotelRooms.length === 1 ? "phòng" : "phòng"} còn trống
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className={cx("price-section")}>
            {hotelData.discount && (
              <div className={cx("discount-badge")}>
                {hotelData.discount}% off
              </div>
            )}

            <div className={cx("price")}>
              {hotelData.originalPrice && (
                <span className={cx("original-price")}>
                  {formatPrice(hotelData.originalPrice)}
                </span>
              )}
              <span className={cx("current-price")}>
                {formatPrice(
                  hotelData.minRoomPrice ||
                    roomDetails.pricePerNight ||
                    hotelData.price ||
                    100000
                )}
              </span>
            </div>

            <p className={cx("price-info")}>mỗi đêm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
