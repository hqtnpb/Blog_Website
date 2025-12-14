import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./BookingCard.module.scss";
import classNames from "classnames/bind";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function Calendar({ className }) {
  return (
    <div className={className} data-name="calendar" data-node-id="307:4441">
      <div className={cx("calendar-vector")}>
        <FontAwesomeIcon
          icon={faCalendarDays}
          className={cx("calendar-icon")}
          style={{ width: "20px", height: "20px" }}
        />
      </div>
    </div>
  );
}

function GuestPicker({ guests, setGuests, rooms, setRooms }) {
  return (
    <div className={cx("guest-picker")}>
      <div className={cx("guest-picker-row")}>
        <span>Người lớn</span>
        <div className={cx("guest-picker-controls")}>
          <button onClick={() => setGuests(Math.max(1, guests - 1))}>-</button>
          <span>{guests}</span>
          <button onClick={() => setGuests(guests + 1)}>+</button>
        </div>
      </div>
      <div className={cx("guest-picker-row")}>
        <span>Phòng</span>
        <div className={cx("guest-picker-controls")}>
          <button onClick={() => setRooms(Math.max(1, rooms - 1))}>-</button>
          <span>{rooms}</span>
          <button onClick={() => setRooms(rooms + 1)}>+</button>
        </div>
      </div>
    </div>
  );
}

export default function BookingCard({
  hotel,
  priceRange,
  onPriceFilterChange,
}) {
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);
  const [openGuests, setOpenGuests] = useState(false);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000000 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Get valid price range - memoized to avoid recalculation
  const validPriceRange = useMemo(() => {
    if (
      priceRange &&
      priceRange.min !== Infinity &&
      priceRange.max !== 0 &&
      priceRange.max > priceRange.min
    ) {
      return priceRange;
    }
    // Fallback: calculate from hotel rooms
    if (hotel?.rooms && hotel.rooms.length > 0) {
      const prices = hotel.rooms
        .map((r) => r.pricePerNight || 0)
        .filter((p) => p > 0);
      if (prices.length > 0) {
        return {
          min: Math.min(...prices),
          max: Math.max(...prices),
        };
      }
    }
    // Default fallback
    return { min: 0, max: 10000000 };
  }, [priceRange, hotel]);

  // Get price from hotel data or priceRange prop
  const minPrice = validPriceRange.min;
  const maxPrice = validPriceRange.max;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  const datePickerRef = useRef(null);
  const guestPickerRef = useRef(null);

  // Initialize price filter when hotel/priceRange loads - only once
  useEffect(() => {
    if (!isInitialized && validPriceRange.min < validPriceRange.max) {
      const initialFilter = {
        min: validPriceRange.min,
        max: validPriceRange.max,
      };
      setPriceFilter(initialFilter);
      setIsInitialized(true);
      if (onPriceFilterChange) {
        onPriceFilterChange(initialFilter);
      }
    }
  }, [validPriceRange, isInitialized, onPriceFilterChange]);

  // Update parent when price filter changes
  const handlePriceFilterChange = (newFilter) => {
    setPriceFilter(newFilter);
    if (onPriceFilterChange) {
      onPriceFilterChange(newFilter);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setOpenDate(false);
      }
      if (
        guestPickerRef.current &&
        !guestPickerRef.current.contains(event.target)
      ) {
        setOpenGuests(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [datePickerRef, guestPickerRef]);

  return (
    <div
      className={cx("reserve-card")}
      data-name="Reserve Card"
      data-node-id="4908:89460"
    >
      <div className={cx("booking-form")} data-node-id="I4908:89460;665:24760">
        <div
          className={cx("date-picker-row")}
          data-node-id="I4908:89460;665:24761"
          onClick={() => setOpenDate(!openDate)}
        >
          <div
            className={cx("check-in-section")}
            data-node-id="I4908:89460;665:24762"
          >
            <div
              className={cx("check-in-content")}
              data-node-id="I4908:89460;665:24763"
            >
              <Calendar className={cx("calendar-icon-container")} />
              <p
                className={cx("check-in-label")}
                data-node-id="I4908:89460;665:24765"
              >
                Nhận phòng
              </p>
            </div>
            <p
              className={cx("check-in-date")}
              data-node-id="I4908:89460;665:24766"
            >
              {`${format(date[0].startDate, "dd/MM/yyyy")}`}
            </p>
          </div>
          <div className={cx("date-divider-container")}>
            <div className={cx("date-divider-inner")}>
              <div
                className={cx("date-divider-image-container")}
                data-node-id="I4908:89460;1780:25186"
              >
                <div className={cx("date-divider-image-inner")}>
                  <span
                    className={cx("date-divider-icon")}
                    style={{ fontSize: "20px" }}
                  >
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={cx("check-out-section")}
            data-node-id="I4908:89460;665:24767"
          >
            <div
              className={cx("check-out-content")}
              data-node-id="I4908:89460;665:24768"
            >
              <Calendar className={cx("calendar-icon-container")} />
              <p
                className={cx("check-out-label")}
                data-node-id="I4908:89460;665:24770"
              >
                Trả phòng
              </p>
            </div>
            <p
              className={cx("check-out-date")}
              data-node-id="I4908:89460;665:24771"
            >
              {`${format(date[0].endDate, "dd/MM/yyyy")}`}
            </p>
          </div>
        </div>
        <div ref={datePickerRef}>
          {openDate && (
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDate([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={date}
              className={cx("date-range-picker")}
            />
          )}
        </div>
        <div
          className={cx("guest-divider-container")}
          data-node-id="I4908:89460;1780:25058"
        >
          <div className={cx("guest-divider-inner")}>
            <div className={cx("guest-divider-line")} />
          </div>
        </div>
        <div
          className={cx("guest-dropdown-button")}
          data-name="Room and Guests Drop down"
          data-node-id="I4908:89460;1429:20378"
          onClick={() => setOpenGuests(!openGuests)}
        >
          <div
            className={cx("guest-dropdown-inner")}
            data-name="Rooms and Guests"
            data-node-id="I4908:89460;1429:20378;1327:20648"
          >
            <p
              className={cx("guest-label")}
              data-node-id="I4908:89460;1429:20378;1327:20648;701:5174"
            >
              Phòng và khách
            </p>
            <div
              className={cx("guest-selection-row")}
              data-node-id="I4908:89460;1429:20378;1327:20648;701:5175"
            >
              <div
                className={cx("guest-selection-content")}
                data-node-id="I4908:89460;1429:20378;1327:20648;701:5187"
              >
                <p data-node-id="I4908:89460;1429:20378;1327:20648;701:5176">
                  {rooms}
                </p>
                <p data-node-id="I4908:89460;1429:20378;1327:20648;701:5183">{` phòng, `}</p>
              </div>
              <div
                className={cx("guest-selection-content")}
                data-node-id="I4908:89460;1429:20378;1327:20648;701:5185"
              >
                <p data-node-id="I4908:89460;1429:20378;1327:20648;701:5184">
                  {guests}
                </p>
                <p data-node-id="I4908:89460;1429:20378;1327:20648;701:5213">
                  người lớn
                </p>
              </div>
            </div>
          </div>
        </div>
        <div ref={guestPickerRef}>
          {openGuests && (
            <GuestPicker
              guests={guests}
              setGuests={setGuests}
              rooms={rooms}
              setRooms={setRooms}
            />
          )}
        </div>
      </div>

      {/* Price Filter Section */}
      {validPriceRange.min < validPriceRange.max && (
        <div className={cx("price-filter-section")}>
          <div className={cx("price-filter-header")}>
            <h3 className={cx("price-filter-title")}>Lọc theo giá</h3>
            <span className={cx("price-filter-range")}>
              {formatPrice(priceFilter.min)} - {formatPrice(priceFilter.max)}
            </span>
          </div>
          <div className={cx("price-filter-sliders")}>
            <div className={cx("price-slider-group")}>
              <label>Giá tối thiểu:</label>
              <input
                type="range"
                min={validPriceRange.min}
                max={validPriceRange.max}
                step="100000"
                value={priceFilter.min}
                onChange={(e) =>
                  handlePriceFilterChange({
                    ...priceFilter,
                    min: Math.min(Number(e.target.value), priceFilter.max),
                  })
                }
                className={cx("price-slider")}
              />
              <span className={cx("price-value")}>
                {formatPrice(priceFilter.min)}
              </span>
            </div>
            <div className={cx("price-slider-group")}>
              <label>Giá tối đa:</label>
              <input
                type="range"
                min={validPriceRange.min}
                max={validPriceRange.max}
                step="100000"
                value={priceFilter.max}
                onChange={(e) =>
                  handlePriceFilterChange({
                    ...priceFilter,
                    max: Math.max(Number(e.target.value), priceFilter.min),
                  })
                }
                className={cx("price-slider")}
              />
              <span className={cx("price-value")}>
                {formatPrice(priceFilter.max)}
              </span>
            </div>
          </div>
          <button
            className={cx("reset-price-filter")}
            onClick={() =>
              handlePriceFilterChange({
                min: validPriceRange.min,
                max: validPriceRange.max,
              })
            }
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      <div
        className={cx("prices-section")}
        data-node-id="I4908:89460;665:24827"
      >
        <div
          className={cx("prices-title-row")}
          data-node-id="I4908:89460;665:24801"
        >
          <p
            className={cx("prices-title")}
            dir="auto"
            data-node-id="I4908:89460;665:24802"
          >
            Giá:
          </p>
        </div>
        <div
          className={cx("prices-range-row")}
          data-node-id="I4908:89460;665:24822"
        >
          <p className={cx("price-text")} data-node-id="I4908:89460;665:24823">
            {minPrice > 0 && maxPrice > 0
              ? `Từ ${formatPrice(minPrice)} đến ${formatPrice(maxPrice)}`
              : minPrice > 0
              ? `Từ ${formatPrice(minPrice)}/đêm`
              : "Giá chưa có"}
          </p>
        </div>
      </div>
      <button
        className={cx("show-rooms-button")}
        data-name="Buttons"
        data-node-id="I4908:89460;665:24812"
        onClick={() => {
          const roomsSection = document.getElementById("rooms");
          if (roomsSection) {
            roomsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      >
        <p
          className={cx("show-rooms-button-text")}
          data-node-id="I4908:89460;665:24812;653:2304"
        >
          Xem phòng
        </p>
      </button>
    </div>
  );
}
