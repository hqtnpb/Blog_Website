import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import styles from "./HotelDetails.module.scss";
import image from "~/assets/image";
import BookingCard from "~/components/BookingCard/BookingCard";
import ReviewModal from "~/components/ReviewModal";

const cx = classNames.bind(styles);

// Helper function to get amenity icons
const getAmenityIcon = (iconType) => {
  const iconMap = {
    wifi: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 18.5C11.175 18.5 10.5 17.825 10.5 17C10.5 16.175 11.175 15.5 12 15.5C12.825 15.5 13.5 16.175 13.5 17C13.5 17.825 12.825 18.5 12 18.5ZM12 2C7.65 2 3.78 3.75 1 6.5L3 8.5C5.28 6.35 8.48 5 12 5C15.52 5 18.72 6.35 21 8.5L23 6.5C20.22 3.75 16.35 2 12 2ZM12 9C9.65 9 7.45 9.85 5.75 11.25L7.75 13.25C8.95 12.35 10.4 11.75 12 11.75C13.6 11.75 15.05 12.35 16.25 13.25L18.25 11.25C16.55 9.85 14.35 9 12 9Z"
          fill="currentColor"
        />
      </svg>
    ),
    pool: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 21C21.35 21 20.75 20.82 20.22 20.5C19.16 19.83 17.84 19.83 16.78 20.5C15.72 21.17 14.4 21.17 13.34 20.5C12.28 19.83 10.96 19.83 9.9 20.5C8.84 21.17 7.52 21.17 6.46 20.5C5.4 19.83 4.08 19.83 3.02 20.5C2.49 20.82 1.89 21 1.24 21C1.09 21 0.95 20.96 0.81 20.88C0.34 20.64 0.15 20.09 0.39 19.62C0.54 19.32 0.83 19.12 1.14 19.06C1.45 19 1.78 19.08 2.03 19.28C2.53 19.64 3.14 19.83 3.74 19.83C4.34 19.83 4.95 19.64 5.45 19.28C6.51 18.61 7.83 18.61 8.89 19.28C9.95 19.95 11.27 19.95 12.33 19.28C13.39 18.61 14.71 18.61 15.77 19.28C16.83 19.95 18.15 19.95 19.21 19.28C19.71 18.92 20.32 18.73 20.92 18.73C21.52 18.73 22.13 18.92 22.63 19.28C22.88 19.48 23.21 19.56 23.52 19.5C23.83 19.44 24.12 19.24 24.27 18.94C24.51 18.47 24.32 17.92 23.85 17.68C23.71 17.6 23.57 17.56 23.42 17.56C22.77 17.56 22.17 17.74 21.64 18.06C20.58 18.73 19.26 18.73 18.2 18.06C17.14 17.39 15.82 17.39 14.76 18.06C13.7 18.73 12.38 18.73 11.32 18.06C10.26 17.39 8.94 17.39 7.88 18.06C6.82 18.73 5.5 18.73 4.44 18.06C3.91 17.74 3.31 17.56 2.66 17.56C2.51 17.56 2.37 17.6 2.23 17.68C1.76 17.92 1.57 18.47 1.81 18.94L1.82 18.96V21H22V21Z"
          fill="currentColor"
        />
        <path
          d="M18.5 7C19.88 7 21 5.88 21 4.5C21 3.12 19.88 2 18.5 2C17.12 2 16 3.12 16 4.5C16 5.88 17.12 7 18.5 7Z"
          fill="currentColor"
        />
        <path
          d="M18.5 8C16.57 8 15 9.57 15 11.5V14H22V11.5C22 9.57 20.43 8 18.5 8Z"
          fill="currentColor"
        />
      </svg>
    ),
    parking: <span style={{ fontSize: "18px" }}>🅿️</span>,
    gym: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"
          fill="currentColor"
        />
      </svg>
    ),
    restaurant: <span style={{ fontSize: "18px" }}>🍽️</span>,
    bar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 5V3H3V5L11 12V19H6V21H18V19H13V12L21 5ZM7.43 7L5.66 5H18.34L16.57 7H7.43Z"
          fill="currentColor"
        />
      </svg>
    ),
    ac: <span style={{ fontSize: "18px" }}>❄️</span>,
    "room-service": <span style={{ fontSize: "18px" }}>🛎️</span>,
    "24h": <span style={{ fontSize: "18px" }}>🕐</span>,
    shuttle: <span style={{ fontSize: "18px" }}>🚐</span>,
    beach: <span style={{ fontSize: "18px" }}>🏖️</span>,
    breakfast: <span style={{ fontSize: "18px" }}>🍳</span>,
    spa: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M8.55 12C9.66 10.83 11.15 10 12.83 10C13.04 10 13.24 10.01 13.45 10.03C13.2 9.23 13.06 8.39 13.05 7.5C13.03 5 14.46 2.5 17.5 2.5C19.87 2.5 21.5 4.5 21.5 7.5C21.5 10.04 20.04 12.5 17.5 12.5C16.27 12.5 15.13 12.04 14.23 11.28C13.76 11.59 13.31 11.96 12.9 12.4C11.14 14.16 10 16.57 10 19.2H8C8 16.07 9.38 13.2 11.55 11.13C10.41 10.41 9.04 10 7.5 10C4.42 10 2 12.42 2 15.5C2 18.58 4.42 21 7.5 21H20V19H7.5C5.57 19 4 17.43 4 15.5C4 13.57 5.57 12 7.5 12C7.85 12 8.19 12.05 8.52 12.13C8.53 12.08 8.54 12.04 8.55 12ZM17.5 10.5C19.16 10.5 19.5 8.83 19.5 7.5C19.5 5.84 18.66 4.5 17.5 4.5C16.26 4.5 15.04 5.66 15.05 7.5C15.06 8.78 15.58 9.89 16.41 10.73C16.75 10.64 17.11 10.5 17.5 10.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  };
  return iconMap[iconType] || <span>{iconType}</span>;
};

function HotelDetails() {
  const { hotel_id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingDates, setBookingDates] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0], // +1 day
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);
  const [userBookingId, setUserBookingId] = useState(null);

  const handleReserveRoom = (roomId) => {
    try {
      // Navigate to RoomDetails page (no authentication required to view room)
      const path = `/room/${hotel_id}/${roomId}`;
      navigate(path);
    } catch (error) {
      console.error("Error in handleReserveRoom:", error);
      toast.error("Không thể xem chi tiết phòng. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchHotelDetails();
    checkUserBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel_id]);

  const fetchHotelDetails = async () => {
    const apiUrl =
      process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/hotels/${hotel_id}`);
      setHotel(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin khách sạn"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkUserBooking = async () => {
    const apiUrl =
      process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

    try {
      // Get token from sessionStorage
      const userDataStr = sessionStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      if (!token) {
        setHasBooking(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Get user's bookings
      const response = await axios.get(`${apiUrl}/booking`, config);
      const bookings = response.data;

      // Find a completed booking for this hotel
      const hotelBooking = bookings.find(
        (booking) =>
          (booking.room?.hotel?._id === hotel_id ||
            booking.room?.hotel === hotel_id) &&
          new Date(booking.endDate) <= new Date() // Only past bookings
      );

      if (hotelBooking) {
        setHasBooking(true);
        setUserBookingId(hotelBooking._id);
      } else {
        setHasBooking(false);
        setUserBookingId(null);
      }
    } catch (error) {
      console.log("Could not check booking status:", error);
      setHasBooking(false);
      setUserBookingId(null);
    }
  };

  const handleReviewSuccess = () => {
    // Refresh hotel data to show new review
    fetchHotelDetails();
  };

  if (loading) {
    return (
      <div className={cx("hotel-details")}>
        <div className={cx("container")}>
          <div className={cx("loading")}>
            <div className={cx("spinner")} />
            <p>Đang tải thông tin khách sạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className={cx("hotel-details")}>
        <div className={cx("container")}>
          <div className={cx("error")}>
            <h2>Rất tiếc! Đã xảy ra lỗi</h2>
            <p>{error || "Không tìm thấy khách sạn"}</p>
            <button onClick={() => window.history.back()}>Quay lại</button>
          </div>
        </div>
      </div>
    );
  }

  // Extract amenities from hotel object with proper icons
  const amenitiesList = [];
  if (hotel.hasFreeWifi)
    amenitiesList.push({ icon: "wifi", name: "WiFi miễn phí" });
  if (hotel.hasPool) amenitiesList.push({ icon: "pool", name: "Hồ bơi" });
  if (hotel.hasParking)
    amenitiesList.push({ icon: "parking", name: "Bãi đỗ xe" });
  if (hotel.hasGym) amenitiesList.push({ icon: "gym", name: "Phòng gym" });
  if (hotel.hasRestaurant)
    amenitiesList.push({ icon: "restaurant", name: "Nhà hàng" });
  if (hotel.hasBar) amenitiesList.push({ icon: "bar", name: "Quầy bar" });
  if (hotel.hasAC) amenitiesList.push({ icon: "ac", name: "Điều hòa" });
  if (hotel.hasRoomService)
    amenitiesList.push({ icon: "room-service", name: "Dịch vụ phòng" });
  if (hotel.has24HourFrontDesk)
    amenitiesList.push({ icon: "24h", name: "Lễ tân 24/7" });
  if (hotel.hasAirportShuttle)
    amenitiesList.push({ icon: "shuttle", name: "Xe đưa đón sân bay" });
  if (hotel.hasBeachAccess)
    amenitiesList.push({ icon: "beach", name: "Gần bãi biển" });
  if (hotel.hasBreakfast)
    amenitiesList.push({ icon: "breakfast", name: "Bữa sáng" });
  if (hotel.hasSpa) amenitiesList.push({ icon: "spa", name: "Spa" });

  const displayedAmenities = showAllAmenities
    ? amenitiesList
    : amenitiesList.slice(0, 6);

  // Tất cả các loại phòng có thể có (từ Room model enum)
  const allPossibleRoomTypes = [
    "Standard",
    "Deluxe",
    "Suite",
    "Executive",
    "Family Room",
    "Twin Room",
    "Double Room",
  ];

  // Get unique room types from hotel rooms (chỉ hiển thị loại có phòng)
  const availableRoomTypes = hotel.rooms
    ? [
        "all",
        ...new Set(hotel.rooms.map((room) => room.roomType).filter(Boolean)),
      ]
    : ["all"];

  // Generate star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cx("star-icon")}
        >
          <path
            d="M9 0L11.0206 6.21885H17.5595L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885H6.97937L9 0Z"
            fill="#FAC91E"
          />
        </svg>
      );
    }
    return stars;
  };

  // Calculate price range from rooms
  const priceRange = hotel.rooms?.reduce(
    (acc, room) => {
      const price = room.pricePerNight || 0;
      return {
        min: Math.min(acc.min, price),
        max: Math.max(acc.max, price),
      };
    },
    { min: Infinity, max: 0 }
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  return (
    <div className={cx("hotel-details")}>
      <div className={cx("container")}>
        <div className={cx("hotel-details__inner")}>
          {/* Top Title Section */}
          <div className={cx("top-titles")}>
            <div className={cx("title-section")}>
              <div className={cx("title-wrapper")}>
                <h1 className={cx("hotel-name")}>{hotel.name}</h1>
                {hotel.rating && (
                  <div className={cx("star-rating")}>
                    {renderStars(hotel.rating)}
                  </div>
                )}
              </div>
              <p className={cx("location-text")}>
                {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className={cx("action-buttons")}>
              {hasBooking && (
                <button
                  className={cx("btn-review")}
                  onClick={() => setShowReviewModal(true)}
                >
                  <span>✍️</span>
                  <span>Viết đánh giá</span>
                </button>
              )}
              <button className={cx("btn-icon", "btn-favorite")}>
                <img
                  src={image.heart_icon}
                  alt="Favorite"
                  loading="lazy"
                  width="24"
                  height="24"
                />
              </button>
              <button className={cx("btn-icon", "btn-share")}>
                <img
                  src={image.share_icon}
                  alt="Share"
                  loading="lazy"
                  width="24"
                  height="24"
                />
              </button>
            </div>
          </div>

          {/* Sticky Navigation */}
          <div className={cx("sticky-nav")}>
            <ul className={cx("nav-list")}>
              <li
                className={cx("nav-item", {
                  "nav-item--active": activeTab === "overview",
                })}
                onClick={() => setActiveTab("overview")}
              >
                <span>Tổng quan</span>
              </li>
              <li
                className={cx("nav-item", {
                  "nav-item--active": activeTab === "rooms",
                })}
                onClick={() => setActiveTab("rooms")}
              >
                <span>Phòng</span>
              </li>
              <li
                className={cx("nav-item", {
                  "nav-item--active": activeTab === "amenities",
                })}
                onClick={() => setActiveTab("amenities")}
              >
                <span>Tiện nghi</span>
              </li>
              <li
                className={cx("nav-item", {
                  "nav-item--active": activeTab === "reviews",
                })}
                onClick={() => setActiveTab("reviews")}
              >
                <span>Đánh giá</span>
              </li>
              <li
                className={cx("nav-item", {
                  "nav-item--active": activeTab === "location",
                })}
                onClick={() => setActiveTab("location")}
              >
                <span>Vị trí</span>
              </li>
            </ul>
          </div>

          {/* Image Gallery */}
          <div className={cx("image-gallery")} id="overview">
            <div className={cx("gallery-grid")}>
              <div className={cx("gallery-main")}>
                {hotel.images && hotel.images[0] ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className={cx("gallery-img")}
                    loading="eager"
                    width="800"
                    height="600"
                  />
                ) : (
                  <div className={cx("gallery-placeholder")}>Không có ảnh</div>
                )}
              </div>
              <div className={cx("gallery-thumbnails")}>
                <div className={cx("thumbnails-row")}>
                  {[1, 2].map((index) => (
                    <div key={index} className={cx("thumbnail-item")}>
                      {hotel.images && hotel.images[index] ? (
                        <img
                          src={hotel.images[index]}
                          alt={`${hotel.name} ${index + 1}`}
                          className={cx("gallery-img")}
                          loading="lazy"
                          width="390"
                          height="290"
                        />
                      ) : (
                        <div className={cx("gallery-placeholder")}>
                          Không có ảnh
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className={cx("thumbnails-row")}>
                  {[3, 4].map((index) => (
                    <div
                      key={index}
                      className={cx("thumbnail-item", {
                        "has-overlay": index === 4,
                      })}
                    >
                      {hotel.images && hotel.images[index] ? (
                        <img
                          src={hotel.images[index]}
                          alt={`${hotel.name} ${index + 1}`}
                          className={cx("gallery-img")}
                          loading="lazy"
                          width="390"
                          height="290"
                        />
                      ) : (
                        <div className={cx("gallery-placeholder")}>
                          Không có ảnh
                        </div>
                      )}
                      {index === 4 &&
                        hotel.images &&
                        hotel.images.length > 5 && (
                          <button
                            className={cx("more-photos-btn")}
                            onClick={() => setShowAllPhotos(true)}
                          >
                            <span className={cx("icon")}>🖼️</span>
                            <span className={cx("text")}>
                              {hotel.images.length - 5}+
                            </span>
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={cx("main-content")}>
            <div className={cx("content-left")}>
              {/* Overview Tab - Shows all sections */}
              {activeTab === "overview" && (
                <>
                  {/* Description Section */}
                  <section className={cx("description-section")}>
                    <h2 className={cx("section-title")}>Mô tả</h2>
                    <div className={cx("description-content")}>
                      {hotel.description && hotel.description.length > 0 && (
                        <p className={cx("hotel-size")}>
                          Quy mô khách sạn: {hotel.rooms?.length || 0} phòng
                        </p>
                      )}
                      <p className={cx("description-text")}>
                        {showFullDescription ||
                        !hotel.description ||
                        hotel.description.length < 300
                          ? hotel.description || "Không có mô tả."
                          : `${hotel.description.substring(0, 300)}...`}
                      </p>
                      {hotel.description && hotel.description.length > 300 && (
                        <button
                          className={cx("btn-text")}
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                        >
                          {showFullDescription ? "Ẩn bớt" : "Xem thêm"}
                        </button>
                      )}
                    </div>
                  </section>

                  {/* Amenities Section */}
                  <section className={cx("amenities-section")}>
                    <h2 className={cx("section-title")}>Tiện nghi</h2>
                    {displayedAmenities.length > 0 ? (
                      <div className={cx("amenities-grid")}>
                        <div className={cx("amenities-column")}>
                          {displayedAmenities
                            .slice(0, Math.ceil(displayedAmenities.length / 2))
                            .map((amenity, index) => (
                              <div key={index} className={cx("amenity-chip")}>
                                <span
                                  className={cx(
                                    "amenity-icon",
                                    `icon-${amenity.icon}`
                                  )}
                                >
                                  {getAmenityIcon(amenity.icon)}
                                </span>
                                <span className={cx("amenity-name")}>
                                  {amenity.name}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className={cx("amenities-column")}>
                          {displayedAmenities
                            .slice(Math.ceil(displayedAmenities.length / 2))
                            .map((amenity, index) => (
                              <div key={index} className={cx("amenity-chip")}>
                                <span
                                  className={cx(
                                    "amenity-icon",
                                    `icon-${amenity.icon}`
                                  )}
                                >
                                  {getAmenityIcon(amenity.icon)}
                                </span>
                                <span className={cx("amenity-name")}>
                                  {amenity.name}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p>Không có thông tin tiện nghi.</p>
                    )}
                    {amenitiesList.length > 6 && (
                      <button
                        className={cx("btn-text")}
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                      >
                        {showAllAmenities
                          ? "Ẩn bớt"
                          : `Hiển thị tất cả ${amenitiesList.length} tiện nghi`}
                      </button>
                    )}
                  </section>

                  {/* Location Section */}
                  {hotel.address && (
                    <section className={cx("location-section")}>
                      <h2 className={cx("section-title")}>Vị trí</h2>
                      <div className={cx("location-content")}>
                        <p className={cx("address-text")}>{hotel.address}</p>
                        {hotel.distanceFromCenter && (
                          <p className={cx("distance-text")}>
                            📍 {hotel.distanceFromCenter} km từ trung tâm thành
                            phố
                          </p>
                        )}
                        <p className={cx("location-info")}>
                          {hotel.city}, {hotel.country}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Reviews Section */}
                  <section className={cx("reviews-section")}>
                    <h2 className={cx("section-title")}>Đánh giá</h2>
                    <div className={cx("reviews-placeholder")}>
                      <p>
                        ⭐ {hotel.rating?.toFixed(1) || "N/A"} (
                        {hotel.reviewCount || 0} đánh giá)
                      </p>
                      <span className={cx("reviews-coming-soon")}>
                        Chi tiết đánh giá sắp cập nhật
                      </span>
                    </div>
                  </section>

                  {/* Rooms Section */}
                  {hotel.rooms && hotel.rooms.length > 0 && (
                    <section className={cx("rooms-section")}>
                      <h2 className={cx("section-title")}>Phòng</h2>

                      {/* Room Type Filters */}
                      <div className={cx("room-filters")}>
                        {availableRoomTypes.map((roomType) => (
                          <button
                            key={roomType}
                            className={cx("filter-chip", {
                              "filter-chip--active":
                                selectedRoomType === roomType,
                            })}
                            onClick={() => setSelectedRoomType(roomType)}
                          >
                            {roomType === "all" ? "Tất cả phòng" : roomType}
                          </button>
                        ))}
                      </div>

                      {/* Room Cards */}
                      <div className={cx("rooms-list")}>
                        {hotel.rooms
                          .filter(
                            (room) =>
                              selectedRoomType === "all" ||
                              room.roomType === selectedRoomType
                          )
                          .map((room, index) => (
                            <div
                              key={room._id || index}
                              className={cx("room-card")}
                            >
                              <div className={cx("room-card__image")}>
                                {room.images && room.images[0] ? (
                                  <img
                                    src={room.images[0]}
                                    alt={room.title || "Room"}
                                  />
                                ) : (
                                  <div className={cx("room-placeholder")}>
                                    Không có ảnh
                                  </div>
                                )}
                              </div>
                              <div className={cx("room-card__content")}>
                                <h3 className={cx("room-card__title")}>
                                  {room.title ||
                                    room.type ||
                                    `Phòng ${index + 1}`}
                                </h3>
                                {room.description && (
                                  <p className={cx("room-card__desc")}>
                                    {room.description}
                                  </p>
                                )}
                                <div className={cx("room-card__details")}>
                                  <span className={cx("capacity")}>
                                    👥 {room.maxAdults} người lớn,{" "}
                                    {room.maxChildren} trẻ em
                                  </span>
                                </div>
                              </div>
                              <div className={cx("room-card__footer")}>
                                <div className={cx("price-section")}>
                                  <span className={cx("price-label")}>
                                    Giá mỗi đêm
                                  </span>
                                  <span className={cx("price-value")}>
                                    {formatPrice(room.pricePerNight || 0)}
                                  </span>
                                </div>
                                <button
                                  className={cx("btn-reserve")}
                                  onClick={() => handleReserveRoom(room._id)}
                                >
                                  Đặt phòng
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Amenities Tab */}
              {activeTab === "amenities" && (
                <section className={cx("amenities-section")}>
                  <h2 className={cx("section-title")}>Tiện nghi</h2>
                  {displayedAmenities.length > 0 ? (
                    <div className={cx("amenities-grid")}>
                      <div className={cx("amenities-column")}>
                        {displayedAmenities
                          .slice(0, Math.ceil(displayedAmenities.length / 2))
                          .map((amenity, index) => (
                            <div key={index} className={cx("amenity-chip")}>
                              <span
                                className={cx(
                                  "amenity-icon",
                                  `icon-${amenity.icon}`
                                )}
                              >
                                {getAmenityIcon(amenity.icon)}
                              </span>
                              <span className={cx("amenity-name")}>
                                {amenity.name}
                              </span>
                            </div>
                          ))}
                      </div>
                      <div className={cx("amenities-column")}>
                        {displayedAmenities
                          .slice(Math.ceil(displayedAmenities.length / 2))
                          .map((amenity, index) => (
                            <div key={index} className={cx("amenity-chip")}>
                              <span
                                className={cx(
                                  "amenity-icon",
                                  `icon-${amenity.icon}`
                                )}
                              >
                                {getAmenityIcon(amenity.icon)}
                              </span>
                              <span className={cx("amenity-name")}>
                                {amenity.name}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p>Không có thông tin tiện nghi.</p>
                  )}
                  {amenitiesList.length > 6 && (
                    <button
                      className={cx("btn-text")}
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                    >
                      {showAllAmenities
                        ? "Ẩn bớt"
                        : `Hiển thị tất cả ${amenitiesList.length} tiện nghi`}
                    </button>
                  )}
                </section>
              )}

              {/* Location Tab */}
              {activeTab === "location" && hotel.address && (
                <section className={cx("location-section")}>
                  <h2 className={cx("section-title")}>Vị trí</h2>
                  <div className={cx("location-content")}>
                    <p className={cx("address-text")}>{hotel.address}</p>
                    {hotel.distanceFromCenter && (
                      <p className={cx("distance-text")}>
                        📍 {hotel.distanceFromCenter} km từ trung tâm thành phố
                      </p>
                    )}
                    <p className={cx("location-info")}>
                      {hotel.city}, {hotel.country}
                    </p>
                  </div>
                </section>
              )}

              {/* Rooms Tab */}
              {activeTab === "rooms" &&
                hotel.rooms &&
                hotel.rooms.length > 0 && (
                  <section className={cx("rooms-section")}>
                    <h2 className={cx("section-title")}>Phòng</h2>

                    {/* Room Type Filters */}
                    <div className={cx("room-filters")}>
                      {availableRoomTypes.map((roomType) => (
                        <button
                          key={roomType}
                          className={cx("filter-chip", {
                            "filter-chip--active":
                              selectedRoomType === roomType,
                          })}
                          onClick={() => setSelectedRoomType(roomType)}
                        >
                          {roomType === "all" ? "Tất cả phòng" : roomType}
                        </button>
                      ))}
                    </div>

                    {/* Room Cards */}
                    <div className={cx("rooms-list")}>
                      {hotel.rooms
                        .filter(
                          (room) =>
                            selectedRoomType === "all" ||
                            room.roomType === selectedRoomType
                        )
                        .map((room, index) => (
                          <div
                            key={room._id || index}
                            className={cx("room-card")}
                          >
                            <div className={cx("room-card__image")}>
                              {room.images && room.images[0] ? (
                                <img
                                  src={room.images[0]}
                                  alt={room.title || "Room"}
                                  loading="lazy"
                                  width="300"
                                  height="200"
                                />
                              ) : (
                                <div className={cx("room-placeholder")}>
                                  Không có ảnh
                                </div>
                              )}
                            </div>
                            <div className={cx("room-card__content")}>
                              <h3 className={cx("room-card__title")}>
                                {room.title ||
                                  room.type ||
                                  `Phòng ${index + 1}`}
                              </h3>
                              {room.description && (
                                <p className={cx("room-card__desc")}>
                                  {room.description}
                                </p>
                              )}
                              <div className={cx("room-card__details")}>
                                <span className={cx("capacity")}>
                                  👥 {room.maxAdults} người lớn,{" "}
                                  {room.maxChildren} trẻ em
                                </span>
                              </div>
                            </div>
                            <div className={cx("room-card__footer")}>
                              <div className={cx("price-section")}>
                                <span className={cx("price-label")}>
                                  Giá mỗi đêm
                                </span>
                                <span className={cx("price-value")}>
                                  {formatPrice(room.pricePerNight || 0)}
                                </span>
                              </div>
                              <button
                                className={cx("btn-reserve")}
                                onClick={() => handleReserveRoom(room._id)}
                              >
                                Đặt phòng
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <section className={cx("reviews-section")}>
                  <h2 className={cx("section-title")}>Đánh giá</h2>
                  <div className={cx("reviews-placeholder")}>
                    <p>
                      ⭐ {hotel.rating?.toFixed(1) || "N/A"} (
                      {hotel.reviewCount || 0} đánh giá)
                    </p>
                    <span className={cx("reviews-coming-soon")}>
                      Chi tiết đánh giá sắp cập nhật
                    </span>
                  </div>
                </section>
              )}
            </div>

            {/* Sticky Booking Card */}
            <div className={cx("content-right")}>
              <div className={cx("sticky-booking")}>
                <BookingCard hotel={hotel} priceRange={priceRange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && userBookingId && (
        <ReviewModal
          bookingId={userBookingId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

export default HotelDetails;
