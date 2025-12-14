import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ProductCard.module.scss";

const cx = classNames.bind(styles);

function ProductCard({ hotel, layout = "horizontal" }) {
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

  // Calculate correct original price if discount exists
  const getCurrentPrice = () => {
    return (
      hotelData.minRoomPrice ||
      roomDetails.pricePerNight ||
      hotelData.price ||
      100000
    );
  };

  const getOriginalPrice = () => {
    const currentPrice = getCurrentPrice();

    // If discount exists and is valid, calculate original price
    if (
      hotelData.discount &&
      hotelData.discount > 0 &&
      hotelData.discount < 100
    ) {
      // currentPrice = originalPrice * (1 - discount/100)
      // originalPrice = currentPrice / (1 - discount/100)
      const calculated = currentPrice / (1 - hotelData.discount / 100);
      // Round up to nearest thousand for cleaner display
      return Math.ceil(calculated / 1000) * 1000;
    }

    // If originalPrice exists and is reasonable (> 10000 VND), use it
    if (hotelData.originalPrice && hotelData.originalPrice > 10000) {
      return hotelData.originalPrice;
    }

    // Otherwise, no original price to show
    return null;
  };

  const calculatedOriginalPrice = getOriginalPrice();

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
      className={cx("product-card", {
        "grid-layout": layout === "grid",
      })}
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
        {layout === "grid" ? (
          // Compact Grid Layout
          <>
            <div className={cx("header")}>
              <div className={cx("hotel-info")}>
                <div className={cx("title-row")}>
                  <h3 className={cx("title")}>{hotelData.name}</h3>
                  <div className={cx("stars")}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        width="16"
                        height="16"
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

                <div className={cx("location-info")}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#ff5b26"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className={cx("location")}>
                    {hotelData.city}
                    {hotelData.country ? `, ${hotelData.country}` : ""}
                  </span>
                  <span className={cx("separator")}>•</span>
                  <span className={cx("distance")}>
                    {hotelData.distanceFromCenter || "15.5"}
                  </span>
                </div>
              </div>
            </div>

            {hotelData.description && (
              <p className={cx("description")}>
                {hotelData.description.length > 100
                  ? `${hotelData.description.substring(0, 100)}...`
                  : hotelData.description}
              </p>
            )}

            <div className={cx("details")}>
              <div className={cx("rating-section")}>
                <span className={cx("rating-label")}>
                  {hotelData.rating >= 4.5
                    ? "Xuất sắc"
                    : hotelData.rating >= 4.0
                    ? "Rất tốt"
                    : hotelData.rating >= 3.5
                    ? "Tốt"
                    : "Khá"}
                </span>
                <span className={cx("rating-value")}>
                  {(hotelData.rating || 5.0).toFixed(1)}
                </span>
                <span className={cx("review-count")}>
                  {hotelData.reviewCount || 0} đánh giá
                </span>
              </div>

              <div className={cx("room-type")}>
                <span className={cx("type-label")}>
                  {roomDetails.roomType || hotelData.type || "Suite"}
                </span>
                {roomDetails.title && (
                  <>
                    <span className={cx("separator")}>|</span>
                    <span className={cx("room-name")}>{roomDetails.title}</span>
                  </>
                )}
              </div>

              {roomDetails.maxAdults && (
                <div className={cx("capacity")}>
                  <span>• {roomDetails.maxAdults} người lớn</span>
                  {roomDetails.maxChildren > 0 && (
                    <span> • {roomDetails.maxChildren} trẻ em</span>
                  )}
                </div>
              )}

              <div className={cx("price-section")}>
                <div className={cx("price-row")}>
                  {calculatedOriginalPrice && (
                    <span className={cx("original-price")}>
                      {formatPrice(calculatedOriginalPrice).replace(
                        " VND",
                        " VNĐ"
                      )}
                    </span>
                  )}
                  <span className={cx("current-price")}>
                    {formatPrice(getCurrentPrice()).replace(" VND", " VNĐ")}
                  </span>
                  {hotelData.discount && (
                    <span className={cx("discount-badge")}>
                      {hotelData.discount}% off
                    </span>
                  )}
                </div>
                <p className={cx("per-night")}>mỗi đêm</p>
              </div>
            </div>
          </>
        ) : (
          // Full Horizontal Layout
          <>
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

                <div className={cx("location-info")}>
                  <div className={cx("location-btn")}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#ff5b26"
                    >
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

            <div className={cx("details")}>
              <div className={cx("property-description")}>
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

                {hotelRooms && hotelRooms.length > 0 && (
                  <div className={cx("room-info")}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="#656F81"
                    >
                      <path d="M14 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4H1v2h1v2h2v-2h8v2h2v-2h1v-2h-1zm-2-4v4H4V6h8z" />
                    </svg>
                    <span className={cx("room-count")}>
                      {hotelRooms.length}{" "}
                      {hotelRooms.length === 1 ? "phòng" : "phòng"} còn trống
                    </span>
                  </div>
                )}
              </div>

              <div className={cx("price-section")}>
                {hotelData.discount && (
                  <div className={cx("discount-badge")}>
                    {hotelData.discount}% off
                  </div>
                )}

                <div className={cx("price")}>
                  {calculatedOriginalPrice && (
                    <span className={cx("original-price")}>
                      {formatPrice(calculatedOriginalPrice)}
                    </span>
                  )}
                  <span className={cx("current-price")}>
                    {formatPrice(getCurrentPrice())}
                  </span>
                </div>

                <p className={cx("price-info")}>mỗi đêm</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
