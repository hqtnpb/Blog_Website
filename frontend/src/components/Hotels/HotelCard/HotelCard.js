import React from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./HotelCard.module.scss";
import image from "~/assets/image";
const cx = classNames.bind(styles);

function HotelCard({ hotel }) {
  const navigate = useNavigate();

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
    name: "Luxury Hotel Sydney",
    images: [image.popular_sydney_01],
    city: "Sydney, Australia",
    rating: 4.5,
    reviewCount: 200,
    type: "Luxury Hotel",
    minRoomPrice: 250,
  };

  const hotelData = hotel || defaultHotel;
  const hotelImage = hotelData.images?.[0] || image.popular_sydney_01;
  const minPrice = hotelData.minRoomPrice || hotelData.price || 250;

  const handleCardClick = () => {
    if (hotelData._id || hotelData.id) {
      navigate(`/hotels/${hotelData._id || hotelData.id}`);
    }
  };

  return (
    <div
      className={cx("hotel-card")}
      onClick={handleCardClick}
      style={{ cursor: hotelData._id || hotelData.id ? "pointer" : "default" }}
    >
      <div className={cx("hotel-card__inner")}>
        <div className={cx("hotel-card__image-wrapper")}>
          <img
            src={hotelImage}
            alt={hotelData.name}
            className={cx("hotel-card__image")}
            loading="lazy"
            width="370"
            height="280"
          />
          <button type="button" className={cx("hotel-card__favorite")}>
            <img
              src={image.heart_icon}
              alt="Favorite"
              loading="lazy"
              width="24"
              height="24"
            />
          </button>
        </div>
        <div className={cx("hotel-card__content")}>
          <h3 className={cx("hotel-card__title")}>{hotelData.name}</h3>

          <div className={cx("hotel-card__location")}>
            <img
              src={image.location_icon}
              alt="Location"
              loading="lazy"
              width="16"
              height="16"
            />
            <p className={cx("hotel-card__location-text")}>{hotelData.city}</p>
          </div>
          <p className={cx("hotel-card__review")}>
            <span className={cx("hotel-card__review-rate")}>
              {hotelData.rating?.toFixed(1) || "5.0"}
            </span>
            <span className={cx("hotel-card__review-count")}>
              {hotelData.reviewCount || 0} reviews
            </span>
          </p>
          <div className={cx("hotel-card__types")}>
            <span className={cx("hotel-card__type")}>
              {hotelData.type || "Hotel"}
            </span>
            {hotelData.amenities && (
              <>
                {" | "}
                <span className={cx("hotel-card__type")}>
                  {hotelData.hasFreeWifi ? "Free Wi-Fi" : "Amenities"}
                </span>
              </>
            )}
          </div>
          <div className={cx("hotel-card__price")}>
            <span className={cx("hotel-card__price-amount")}>
              {formatPrice(minPrice)}
            </span>{" "}
            / night
          </div>
          <div className={cx("hotel-card__info")}>
            <span className={cx("hotel-card__info-text")}>Starting price</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;
