import React, { useState } from "react";
import { Input, DatePicker, Button, Dropdown, Space } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./HotelSearchForm.module.scss";

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;

function HotelSearchForm() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const handleSearch = () => {
    if (!destination) {
      alert("Please enter a destination");
      return;
    }

    const params = new URLSearchParams({
      q: destination,
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
    });

    if (dates && dates[0] && dates[1]) {
      params.append("checkIn", dates[0].format("YYYY-MM-DD"));
      params.append("checkOut", dates[1].format("YYYY-MM-DD"));
    }

    navigate(`/search-results?${params.toString()}`);
  };

  const guestsMenu = (
    <div className={cx("guests-dropdown")}>
      {/* Adults */}
      <div className={cx("guest-row")}>
        <div className={cx("guest-info")}>
          <div className={cx("guest-label")}>Adults</div>
          <div className={cx("guest-desc")}>Ages 13+</div>
        </div>
        <div className={cx("counter")}>
          <button
            className={cx("counter-btn")}
            onClick={() => setAdults(Math.max(1, adults - 1))}
            disabled={adults <= 1}
          >
            <MinusOutlined />
          </button>
          <span className={cx("counter-value")}>{adults}</span>
          <button
            className={cx("counter-btn")}
            onClick={() => setAdults(Math.min(10, adults + 1))}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>

      {/* Children */}
      <div className={cx("guest-row")}>
        <div className={cx("guest-info")}>
          <div className={cx("guest-label")}>Children</div>
          <div className={cx("guest-desc")}>Ages 0-12</div>
        </div>
        <div className={cx("counter")}>
          <button
            className={cx("counter-btn")}
            onClick={() => setChildren(Math.max(0, children - 1))}
            disabled={children <= 0}
          >
            <MinusOutlined />
          </button>
          <span className={cx("counter-value")}>{children}</span>
          <button
            className={cx("counter-btn")}
            onClick={() => setChildren(Math.min(10, children + 1))}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>

      {/* Rooms */}
      <div className={cx("guest-row")}>
        <div className={cx("guest-info")}>
          <div className={cx("guest-label")}>Rooms</div>
          <div className={cx("guest-desc")}>Multiple rooms</div>
        </div>
        <div className={cx("counter")}>
          <button
            className={cx("counter-btn")}
            onClick={() => setRooms(Math.max(1, rooms - 1))}
            disabled={rooms <= 1}
          >
            <MinusOutlined />
          </button>
          <span className={cx("counter-value")}>{rooms}</span>
          <button
            className={cx("counter-btn")}
            onClick={() => setRooms(Math.min(5, rooms + 1))}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>

      <div className={cx("guests-done")}>
        <Button
          type="primary"
          size="small"
          onClick={() => setGuestsOpen(false)}
        >
          Done
        </Button>
      </div>
    </div>
  );

  const totalGuests = adults + children;
  const guestText = `${totalGuests} guest${
    totalGuests > 1 ? "s" : ""
  }, ${rooms} room${rooms > 1 ? "s" : ""}`;

  return (
    <div className={cx("hotel-search-form")}>
      <Input
        className={cx("search-input")}
        placeholder="Where are you going?"
        prefix={<SearchOutlined />}
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        onPressEnter={handleSearch}
      />
      <RangePicker
        className={cx("date-picker")}
        onChange={setDates}
        format="DD/MM/YYYY"
      />
      <Dropdown
        overlay={guestsMenu}
        trigger={["click"]}
        open={guestsOpen}
        onOpenChange={setGuestsOpen}
      >
        <div className={cx("guest-select")}>
          <UserOutlined className={cx("guest-icon")} />
          <span>{guestText}</span>
        </div>
      </Dropdown>
      <Button
        type="primary"
        className={cx("search-button")}
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
}

export default HotelSearchForm;
