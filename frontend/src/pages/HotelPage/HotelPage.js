import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./HotelPage.module.scss";
import Button from "~/components/Button";
import { DatePicker } from "antd";
import TrendingCard from "~/components/TrendingCard";
import HotelCard from "~/components/Hotels/HotelCard";
import image from "~/assets/image";
import HotelCardList from "~/components/Hotels/HotelCardList";

const { RangePicker } = DatePicker;
const cx = classNames.bind(styles);

const trendingDestination = [
  {
    image: image.popular_sydney_01,
    title: "Sydney, Úc",
    price: "2.900.000 VND",
    description:
      "Trải nghiệm cuộc sống thành phố sôi động và cảnh quan cảng tuyệt đẹp.",
  },
  {
    image: image.popular_sydney_02,
    title: "Melbourne, Úc",
    price: "3.600.000 VND",
    description:
      "Khám phá trung tâm văn hóa với nghệ thuật, cà phê và những con hẻm ẩn giấu.",
  },
  {
    image: image.popular_sydney_03,
    title: "Brisbane, Úc",
    price: "2.400.000 VND",
    description:
      "Tận hưởng thời tiết nắng đẹp và các điểm tham quan ven sông tuyệt vời.",
  },
];

function HotelPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("Mùa hè");
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [cities, setCities] = useState([]);
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  // Fetch featured hotels on mount
  useEffect(() => {
    fetchFeaturedHotels();
    fetchCities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showGuestsDropdown &&
        !event.target.closest(`.${cx("search-form__guests-wrapper")}`)
      ) {
        setShowGuestsDropdown(false);
      }
      if (
        showCitiesDropdown &&
        !event.target.closest(`.${cx("search-form__location-wrapper")}`)
      ) {
        setShowCitiesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGuestsDropdown, showCitiesDropdown]);

  const fetchFeaturedHotels = async () => {
    const apiUrl =
      process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

    try {
      const response = await axios.get(`${apiUrl}/search-hotels`, {
        params: {
          query: "",
          page: 1,
          limit: 4,
          sort: "rating-high",
        },
      });

      if (response.data.success) {
        setFeaturedHotels(response.data.data || []);
      }
    } catch (error) {
      // Error fetching featured hotels
    }
  };

  const fetchCities = async () => {
    const apiUrl =
      process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

    try {
      const response = await axios.get(`${apiUrl}/cities`);

      if (response.data.success) {
        setCities(response.data.data || []);
        setFilteredCities(response.data.data || []);
      }
    } catch (error) {
      // Error fetching cities
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    // Filter cities based on input
    if (value.trim()) {
      const normalizeText = (text) => {
        return text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d");
      };

      const normalizedInput = normalizeText(value);
      const filtered = cities.filter((city) => {
        const normalizedCity = normalizeText(city);
        return normalizedCity.includes(normalizedInput);
      });
      setFilteredCities(filtered);
      setShowCitiesDropdown(filtered.length > 0);
    } else {
      setFilteredCities(cities);
      setShowCitiesDropdown(false);
    }
  };

  const handleCitySelect = (city) => {
    setLocation(city);
    setShowCitiesDropdown(false);
  };

  const handleSearch = () => {
    if (location.trim()) {
      // Build query params
      const params = new URLSearchParams();
      params.append("q", location);

      // Add dates if selected
      if (dateRange && dateRange.length === 2) {
        params.append("checkIn", dateRange[0].format("YYYY-MM-DD"));
        params.append("checkOut", dateRange[1].format("YYYY-MM-DD"));
      }

      // Add rooms, adults and children
      params.append("rooms", rooms);
      params.append("adults", adults);
      params.append("children", children);

      // Navigate to search results
      navigate(`/search-results?${params.toString()}`);
    } else {
      alert("Please enter a location");
    }
  };

  const handleSeasonClick = (season) => {
    setSelectedSeason(season);
    // You can add logic here to fetch different destinations based on season
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const incrementRooms = () => {
    setRooms((prev) => Math.min(prev + 1, 10));
  };

  const decrementRooms = () => {
    setRooms((prev) => Math.max(prev - 1, 1));
  };

  const incrementAdults = () => {
    setAdults((prev) => Math.min(prev + 1, 10));
  };

  const decrementAdults = () => {
    setAdults((prev) => Math.max(prev - 1, 1));
  };

  const incrementChildren = () => {
    setChildren((prev) => Math.min(prev + 1, 10));
  };

  const decrementChildren = () => {
    setChildren((prev) => Math.max(prev - 1, 0));
  };
  return (
    <div className={cx("hotel-page")}>
      {/* Hero */}
      <div className={cx("hero")}>
        <div className={cx("container")}>
          <div className={cx("hero__inner")}>
            <h1 className={cx("hero__title")}>
              Hành trình của bạn bắt đầu từ đây
            </h1>
            <p className={cx("hero__desc")}>
              Tìm kiếm chỗ nghỉ độc đáo từ khách sạn, biệt thự và nhiều hơn nữa.
            </p>
            <div className={cx("search-form")}>
              <div className={cx("search-form__item")}>
                <label className={cx("search-form__label")}>Điểm đến</label>
                <div className={cx("search-form__location-wrapper")}>
                  <input
                    type="text"
                    className={cx("search-form__input")}
                    placeholder="Bạn muốn đi đâu?"
                    value={location}
                    onChange={handleLocationChange}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() =>
                      location.trim() &&
                      setShowCitiesDropdown(filteredCities.length > 0)
                    }
                  />
                  {showCitiesDropdown && filteredCities.length > 0 && (
                    <div className={cx("cities-dropdown")}>
                      {filteredCities.map((city, index) => (
                        <div
                          key={index}
                          className={cx("cities-dropdown__item")}
                          onClick={() => handleCitySelect(city)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            style={{ marginRight: "8px" }}
                          >
                            <path
                              d="M8 2C5.79086 2 4 3.79086 4 6C4 8.20914 5.79086 10 8 10C10.2091 10 12 8.20914 12 6C12 3.79086 10.2091 2 8 2ZM8 14C5.33333 14 2 12.3333 2 10.6667C2 9.33333 3.33333 8.66667 5.33333 8.66667C6.26667 8.66667 7.13333 8.93333 8 9.33333C8.86667 8.93333 9.73333 8.66667 10.6667 8.66667C12.6667 8.66667 14 9.33333 14 10.6667C14 12.3333 10.6667 14 8 14Z"
                              fill="currentColor"
                            />
                          </svg>
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={cx("search-form__item")}>
                <label className={cx("search-form__label")}>
                  Nhận phòng - Trả phòng{" "}
                </label>
                <div className={cx("search-form__date")}>
                  <RangePicker
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    value={dateRange}
                    placeholder={["Nhận phòng", "Trả phòng"]}
                  />
                </div>
              </div>
              <div className={cx("search-form__item")}>
                <label className={cx("search-form__label")}>
                  Phòng và khách
                </label>
                <div className={cx("search-form__guests-wrapper")}>
                  <input
                    type="text"
                    className={cx("search-form__text")}
                    value={`${adults + children} khách, ${rooms} phòng`}
                    readOnly
                    onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                    style={{ cursor: "pointer" }}
                  />
                  {showGuestsDropdown && (
                    <div className={cx("guests-dropdown")}>
                      <div className={cx("guests-dropdown__item")}>
                        <span className={cx("guests-dropdown__label")}>
                          Phòng
                        </span>
                        <div className={cx("guests-dropdown__controls")}>
                          <button
                            type="button"
                            className={cx("guests-dropdown__btn")}
                            onClick={decrementRooms}
                            disabled={rooms <= 1}
                          >
                            -
                          </button>
                          <span className={cx("guests-dropdown__value")}>
                            {rooms}
                          </span>
                          <button
                            type="button"
                            className={cx("guests-dropdown__btn")}
                            onClick={incrementRooms}
                            disabled={rooms >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className={cx("guests-dropdown__item")}>
                        <span className={cx("guests-dropdown__label")}>
                          Người lớn
                        </span>
                        <span className={cx("guests-dropdown__desc")}>
                          Từ 13 tuổi trở lên
                        </span>
                        <div className={cx("guests-dropdown__controls")}>
                          <button
                            type="button"
                            className={cx("guests-dropdown__btn")}
                            onClick={decrementAdults}
                            disabled={adults <= 1}
                          >
                            -
                          </button>
                          <span className={cx("guests-dropdown__value")}>
                            {adults}
                          </span>
                          <button
                            type="button"
                            className={cx("guests-dropdown__btn")}
                            onClick={incrementAdults}
                            disabled={adults >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className={cx("guests-dropdown__item")}>
                        <span className={cx("guests-dropdown__label")}>
                          Trẻ em
                        </span>
                        <span className={cx("guests-dropdown__desc")}>
                          Từ 0-12 tuổi
                        </span>
                        <div className={cx("guests-dropdown__controls")}>
                          <button
                            type="button"
                            className={cx("guests-dropdown__btn")}
                            onClick={decrementChildren}
                            disabled={children <= 0}
                          >
                            -
                          </button>
                          <span className={cx("guests-dropdown__value")}>
                            {children}
                          </span>
                          <button
                            type="button"
                            className={cx("guests-dropdown__btn")}
                            onClick={incrementChildren}
                            disabled={children >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={cx("guests-dropdown__done")}
                        onClick={() => setShowGuestsDropdown(false)}
                      >
                        Xong
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Button
                active
                className={cx("search-form__btn")}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Trending */}
      <div className={cx("trending")}>
        <div className={cx("container")}>
          <div className={cx("trending__inner")}>
            <h2 className={cx("trending__title")}>Điểm đến phổ biến</h2>
            <div className={cx("trending__button-wrapper")}>
              <Button
                inactive={selectedSeason !== "Mùa xuân"}
                active={selectedSeason === "Mùa xuân"}
                className={cx("trending__button")}
                onClick={() => handleSeasonClick("Mùa xuân")}
              >
                Mùa xuân
              </Button>
              <Button
                inactive={selectedSeason !== "Mùa hè"}
                active={selectedSeason === "Mùa hè"}
                className={cx("trending__button")}
                onClick={() => handleSeasonClick("Mùa hè")}
              >
                Mùa hè
              </Button>
              <Button
                inactive={selectedSeason !== "Mùa thu"}
                active={selectedSeason === "Mùa thu"}
                className={cx("trending__button")}
                onClick={() => handleSeasonClick("Mùa thu")}
              >
                Mùa thu
              </Button>
              <Button
                inactive={selectedSeason !== "Mùa đông"}
                active={selectedSeason === "Mùa đông"}
                className={cx("trending__button")}
                onClick={() => handleSeasonClick("Mùa đông")}
              >
                Mùa đông
              </Button>
            </div>
            <div className={cx("trending__list")}>
              {trendingDestination.map((item, index) => {
                return <TrendingCard card={item} key={index}></TrendingCard>;
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Hotel Cards */}
      <div className={cx("hotel-cards")}>
        <div className={cx("container")}>
          <div className={cx("hotel-cards__inner")}>
            <h2 className={cx("hotel-cards__title")}>Khách sạn nổi bật</h2>
            <div className={cx("hotel-cards__list")}>
              {loading ? (
                <p>Đang tải khách sạn...</p>
              ) : featuredHotels.length > 0 ? (
                featuredHotels.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))
              ) : (
                <>
                  <HotelCard />
                  <HotelCard />
                  <HotelCard />
                  <HotelCard />
                </>
              )}
            </div>
            <HotelCardList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelPage;
