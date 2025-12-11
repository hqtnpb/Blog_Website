import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import styles from "./RoomDetails.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faBed,
  faRulerCombined,
  faWifi,
  faSnowflake,
  faTv,
  faCoffee,
  faShower,
  faDoorOpen,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function RoomDetails() {
  const { hotel_id, room_id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingDates, setBookingDates] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });

  const apiUrl =
    process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

  useEffect(() => {
    fetchRoomDetails();
    // eslint-disable-next-line
  }, [hotel_id, room_id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);

      // Fetch hotel data
      const hotelRes = await axios.get(`${apiUrl}/hotels/${hotel_id}`);
      const hotelData = hotelRes.data;
      setHotel(hotelData);

      // Find room in hotel's rooms
      const roomData = hotelData.rooms?.find(
        (r) => String(r._id) === String(room_id)
      );

      if (!roomData) {
        toast.error("Không tìm thấy phòng");
        navigate(`/hotels/${hotel_id}`);
        return;
      }

      setRoom(roomData);
    } catch (error) {
      console.error("Error fetching room details:", error);
      toast.error("Không thể tải thông tin phòng");
      navigate(`/hotels/${hotel_id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveRoom = () => {
    const userDataStr = sessionStorage.getItem("user");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const token = userData?.accessToken;

    if (!token) {
      toast.error("Vui lòng đăng nhập để đặt phòng");
      navigate("/signin", { state: { from: `/room/${hotel_id}/${room_id}` } });
      return;
    }

    navigate(`/booking/${hotel_id}/${room_id}`, {
      state: {
        checkIn: bookingDates.checkIn,
        checkOut: bookingDates.checkOut,
        adults: 2,
        children: 0,
      },
    });
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi")) return faWifi;
    if (
      amenityLower.includes("air conditioning") ||
      amenityLower.includes("ac")
    )
      return faSnowflake;
    if (amenityLower.includes("tv")) return faTv;
    if (amenityLower.includes("coffee") || amenityLower.includes("mini bar"))
      return faCoffee;
    if (amenityLower.includes("shower") || amenityLower.includes("bathroom"))
      return faShower;
    return faCheckCircle;
  };

  if (loading) {
    return (
      <div className={cx("loading")}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (!room || !hotel) {
    return (
      <div className={cx("error")}>
        <FontAwesomeIcon icon={faTimesCircle} size="3x" />
        <p>Không tìm thấy phòng</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(bookingDates.checkOut) - new Date(bookingDates.checkIn)) /
      (1000 * 60 * 60 * 24)
  );

  const totalPrice = room.pricePerNight * nights;

  return (
    <div className={cx("room-details")}>
      <div className={cx("container")}>
        {/* Back Button */}
        <button className={cx("back-btn")} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại khách sạn</span>
        </button>

        {/* Hotel Info Bar */}
        <div className={cx("hotel-info-bar")}>
          <h3>{hotel.name}</h3>
          <p>
            {hotel.city}, {hotel.country}
          </p>
        </div>

        {/* Main Content */}
        <div className={cx("content")}>
          {/* Left Column - Images and Details */}
          <div className={cx("left-column")}>
            {/* Image Gallery */}
            <div className={cx("image-gallery")}>
              <div className={cx("main-image")}>
                <img
                  src={
                    room.images?.[selectedImage] ||
                    "https://via.placeholder.com/800x600?text=No+Image"
                  }
                  alt={room.title}
                />
              </div>
              {room.images && room.images.length > 1 && (
                <div className={cx("thumbnail-list")}>
                  {room.images.map((img, index) => (
                    <div
                      key={index}
                      className={cx("thumbnail", {
                        active: selectedImage === index,
                      })}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`Room ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className={cx("room-info")}>
              <h1 className={cx("room-title")}>{room.title}</h1>
              <div className={cx("room-type")}>{room.roomType}</div>

              {/* Room Stats */}
              <div className={cx("room-stats")}>
                <div className={cx("stat-item")}>
                  <FontAwesomeIcon icon={faUsers} />
                  <span>
                    {room.maxAdults} Người lớn, {room.maxChildren} Trẻ em
                  </span>
                </div>
                <div className={cx("stat-item")}>
                  <FontAwesomeIcon icon={faBed} />
                  <span>{room.type}</span>
                </div>
                <div className={cx("stat-item")}>
                  <FontAwesomeIcon icon={faDoorOpen} />
                  <span>Phòng #{room.roomNumber}</span>
                </div>
              </div>

              {/* Description */}
              {room.desc && (
                <div className={cx("description")}>
                  <h3>Mô tả</h3>
                  <p>{room.desc}</p>
                </div>
              )}

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div className={cx("amenities")}>
                  <h3>Tiện nghi phòng</h3>
                  <div className={cx("amenities-grid")}>
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className={cx("amenity-item")}>
                        <FontAwesomeIcon icon={getAmenityIcon(amenity)} />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className={cx("right-column")}>
            <div className={cx("booking-card")}>
              <div className={cx("price-section")}>
                <div className={cx("price")}>
                  <span className={cx("amount")}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "code",
                    }).format(room.pricePerNight)}
                  </span>
                  <span className={cx("per-night")}>/ đêm</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className={cx("date-selection")}>
                <h4>Chọn ngày</h4>
                <div className={cx("date-inputs")}>
                  <div className={cx("date-input-group")}>
                    <label>Nhận phòng</label>
                    <input
                      type="date"
                      value={bookingDates.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setBookingDates((prev) => ({
                          ...prev,
                          checkIn: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={cx("date-input-group")}>
                    <label>Trả phòng</label>
                    <input
                      type="date"
                      value={bookingDates.checkOut}
                      min={bookingDates.checkIn}
                      onChange={(e) =>
                        setBookingDates((prev) => ({
                          ...prev,
                          checkOut: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className={cx("price-breakdown")}>
                <div className={cx("breakdown-row")}>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "code",
                    }).format(room.pricePerNight)}{" "}
                    x {nights}
                    {" đêm"}
                  </span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "code",
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className={cx("breakdown-total")}>
                  <span>Tổng cộng</span>
                  <span className={cx("total-amount")}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "code",
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Reserve Button */}
              <button className={cx("reserve-btn")} onClick={handleReserveRoom}>
                Đặt phòng này
              </button>

              <p className={cx("note")}>Bạn sẽ chưa bị tính phí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetails;
