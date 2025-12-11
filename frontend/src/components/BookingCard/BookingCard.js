import React, { useState, useEffect, useRef } from "react";
import styles from "./BookingCard.module.scss";
import classNames from "classnames/bind";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format } from "date-fns";

const cx = classNames.bind(styles);

const imgVector =
  "https://www.figma.com/api/mcp/asset/fe4120c9-7505-42be-84ab-28ea8dba2843";
const img =
  "https://www.figma.com/api/mcp/asset/369484a3-a29b-473e-bc59-212c685b718d";
const img1 =
  "https://www.figma.com/api/mcp/asset/f2376971-51d9-4bea-8476-af5b4d39102e";

function Calendar({ className }) {
  return (
    <div className={className} data-name="calendar" data-node-id="307:4441">
      <div className={cx("calendar-vector")}>
        <img
          alt="Calendar"
          className={cx("calendar-icon")}
          src={imgVector}
          loading="lazy"
          width="20"
          height="20"
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

export default function BookingCard({ hotel, priceRange }) {
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

  // Get price from hotel data or priceRange prop
  const minPrice =
    priceRange && priceRange.min !== Infinity
      ? priceRange.min
      : hotel?.rooms && hotel.rooms.length > 0
      ? Math.min(...hotel.rooms.map((r) => r.pricePerNight || 0))
      : 0;

  const maxPrice =
    priceRange && priceRange.max !== 0
      ? priceRange.max
      : hotel?.rooms && hotel.rooms.length > 0
      ? Math.max(...hotel.rooms.map((r) => r.pricePerNight || 0))
      : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(price);
  };

  const datePickerRef = useRef(null);
  const guestPickerRef = useRef(null);

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
                  <img
                    alt="Divider"
                    className={cx("date-divider-image")}
                    src={img}
                    loading="lazy"
                    width="30"
                    height="30"
                  />
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
            <img
              alt="Divider"
              className={cx("guest-divider-image")}
              src={img1}
              loading="lazy"
              width="30"
              height="30"
            />
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
