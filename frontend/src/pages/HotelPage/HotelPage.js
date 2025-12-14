import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./HotelPage.module.scss";
import Button from "~/components/Button";
import { DatePicker } from "antd";
import ProductCard from "~/components/ProductCard";

const { RangePicker } = DatePicker;
const cx = classNames.bind(styles);

function HotelPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [cities, setCities] = useState([]);
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  // Filter states
  const [selectedCity, setSelectedCity] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [rating, setRating] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const hotelsPerPage = 12;

  // Fetch hotels on mount and when filters change
  useEffect(() => {
    fetchHotels();
    fetchCities();
  }, [selectedCity, priceRange, rating, sortBy, currentPage]);

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

  const fetchHotels = async () => {
    const apiUrl =
      process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: hotelsPerPage,
        sort:
          sortBy === "price-low"
            ? "price-low"
            : sortBy === "price-high"
            ? "price-high"
            : sortBy === "rating"
            ? "rating-high"
            : "",
      };

      if (selectedCity !== "all") {
        params.query = selectedCity;
      }

      const response = await axios.get(`${apiUrl}/search-hotels`, { params });

      if (response.data.success) {
        let hotelsData = response.data.data || [];

        // Apply price filter
        if (priceRange !== "all") {
          hotelsData = hotelsData.filter((hotel) => {
            const price = hotel.minRoomPrice || 0;
            switch (priceRange) {
              case "0-1000000":
                return price < 1000000;
              case "1000000-3000000":
                return price >= 1000000 && price < 3000000;
              case "3000000-5000000":
                return price >= 3000000 && price < 5000000;
              case "5000000+":
                return price >= 5000000;
              default:
                return true;
            }
          });
        }

        // Apply rating filter
        if (rating !== "all") {
          const minRating = parseFloat(rating);
          hotelsData = hotelsData.filter(
            (hotel) => (hotel.rating || 0) >= minRating
          );
        }

        setHotels(hotelsData);
        setTotalPages(Math.ceil(hotelsData.length / hotelsPerPage));
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotels([]);
    } finally {
      setLoading(false);
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

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Reset to first page
    switch (filterType) {
      case "city":
        setSelectedCity(value);
        break;
      case "price":
        setPriceRange(value);
        break;
      case "rating":
        setRating(value);
        break;
      case "sort":
        setSortBy(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSelectedCity("all");
    setPriceRange("all");
    setRating("all");
    setSortBy("recommended");
    setCurrentPage(1);
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
                  Nhận phòng - Trả phòng
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
                        Đóng
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
                Tìm khách sạn
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cx("main-content")}>
        <div className={cx("container")}>
          <div className={cx("content-wrapper")}>
            {/* Sidebar Filters */}
            <aside className={cx("sidebar")}>
              <div className={cx("filter-header")}>
                <h3 className={cx("filter-title")}>Bộ lọc</h3>
                {(selectedCity !== "all" ||
                  priceRange !== "all" ||
                  rating !== "all") && (
                  <button
                    className={cx("clear-filters")}
                    onClick={clearFilters}
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* City Filter */}
              <div className={cx("filter-section")}>
                <h4 className={cx("filter-section-title")}>Thành phố</h4>
                <div className={cx("filter-options")}>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="city"
                      value="all"
                      checked={selectedCity === "all"}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                    />
                    <span>Tất cả</span>
                  </label>
                  {cities.slice(0, 8).map((city, index) => (
                    <label key={index} className={cx("filter-option")}>
                      <input
                        type="radio"
                        name="city"
                        value={city}
                        checked={selectedCity === city}
                        onChange={(e) =>
                          handleFilterChange("city", e.target.value)
                        }
                      />
                      <span>{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className={cx("filter-section")}>
                <h4 className={cx("filter-section-title")}>Giá mỗi đêm</h4>
                <div className={cx("filter-options")}>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="price"
                      value="all"
                      checked={priceRange === "all"}
                      onChange={(e) =>
                        handleFilterChange("price", e.target.value)
                      }
                    />
                    <span>Tất cả</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="price"
                      value="0-1000000"
                      checked={priceRange === "0-1000000"}
                      onChange={(e) =>
                        handleFilterChange("price", e.target.value)
                      }
                    />
                    <span>Dưới 1.000.000₫</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="price"
                      value="1000000-3000000"
                      checked={priceRange === "1000000-3000000"}
                      onChange={(e) =>
                        handleFilterChange("price", e.target.value)
                      }
                    />
                    <span>1.000.000₫ - 3.000.000₫</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="price"
                      value="3000000-5000000"
                      checked={priceRange === "3000000-5000000"}
                      onChange={(e) =>
                        handleFilterChange("price", e.target.value)
                      }
                    />
                    <span>3.000.000₫ - 5.000.000₫</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="price"
                      value="5000000+"
                      checked={priceRange === "5000000+"}
                      onChange={(e) =>
                        handleFilterChange("price", e.target.value)
                      }
                    />
                    <span>Trên 5.000.000₫</span>
                  </label>
                </div>
              </div>

              {/* Rating Filter */}
              <div className={cx("filter-section")}>
                <h4 className={cx("filter-section-title")}>Đánh giá</h4>
                <div className={cx("filter-options")}>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="rating"
                      value="all"
                      checked={rating === "all"}
                      onChange={(e) =>
                        handleFilterChange("rating", e.target.value)
                      }
                    />
                    <span>Tất cả</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="rating"
                      value="4.5"
                      checked={rating === "4.5"}
                      onChange={(e) =>
                        handleFilterChange("rating", e.target.value)
                      }
                    />
                    <span>⭐ 4.5+</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="rating"
                      value="4.0"
                      checked={rating === "4.0"}
                      onChange={(e) =>
                        handleFilterChange("rating", e.target.value)
                      }
                    />
                    <span>⭐ 4.0+</span>
                  </label>
                  <label className={cx("filter-option")}>
                    <input
                      type="radio"
                      name="rating"
                      value="3.5"
                      checked={rating === "3.5"}
                      onChange={(e) =>
                        handleFilterChange("rating", e.target.value)
                      }
                    />
                    <span>⭐ 3.5+</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Hotels Grid */}
            <main className={cx("hotels-main")}>
              {/* Sort & Results Info */}
              <div className={cx("results-header")}>
                <div className={cx("results-info")}>
                  <h2 className={cx("results-title")}>
                    {hotels.length} khách sạn được tìm thấy
                  </h2>
                  {selectedCity !== "all" && (
                    <p className={cx("results-subtitle")}>tại {selectedCity}</p>
                  )}
                </div>
                <div className={cx("sort-wrapper")}>
                  <label className={cx("sort-label")}>Sắp xếp theo:</label>
                  <select
                    className={cx("sort-select")}
                    value={sortBy}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                  >
                    <option value="recommended">Đề xuất</option>
                    <option value="price-low">Giá thấp đến cao</option>
                    <option value="price-high">Giá cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>
              </div>

              {/* Hotels Grid */}
              {loading ? (
                <div className={cx("loading-container")}>
                  <div className={cx("loading-grid")}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={cx("skeleton-card")}>
                        <div className={cx("skeleton-image")}></div>
                        <div className={cx("skeleton-content")}>
                          <div className={cx("skeleton-line")}></div>
                          <div className={cx("skeleton-line", "short")}></div>
                          <div className={cx("skeleton-line", "medium")}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : hotels.length > 0 ? (
                <>
                  <div className={cx("hotels-grid")}>
                    {hotels.map((hotel) => (
                      <ProductCard
                        key={hotel._id}
                        hotel={hotel}
                        layout="grid"
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={cx("pagination")}>
                      <button
                        className={cx("pagination-btn", {
                          disabled: currentPage === 1,
                        })}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        ← Trước
                      </button>
                      <div className={cx("pagination-numbers")}>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            className={cx("pagination-number", {
                              active: currentPage === i + 1,
                            })}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        className={cx("pagination-btn", {
                          disabled: currentPage === totalPages,
                        })}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className={cx("no-results")}>
                  <div className={cx("no-results-icon")}>🏨</div>
                  <h3 className={cx("no-results-title")}>
                    Không tìm thấy khách sạn
                  </h3>
                  <p className={cx("no-results-text")}>
                    Thử điều chỉnh bộ lọc hoặc tìm kiếm địa điểm khác
                  </p>
                  <Button active onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className={cx("why-choose-us")}>
        <div className={cx("container")}>
          <div className={cx("section-header")}>
            <h2 className={cx("section-title")}>Tại sao chọn chúng tôi?</h2>
            <p className={cx("section-subtitle")}>
              Trải nghiệm đặt phòng tuyệt vời với nhiều ưu đãi hấp dẫn
            </p>
          </div>

          <div className={cx("features-grid")}>
            <div className={cx("feature-card")}>
              <div className={cx("feature-icon", "orange")}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className={cx("feature-title")}>Giá tốt nhất</h3>
              <p className={cx("feature-desc")}>
                Đảm bảo giá tốt nhất thị trường với nhiều ưu đãi độc quyền
              </p>
            </div>

            <div className={cx("feature-card")}>
              <div className={cx("feature-icon", "blue")}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className={cx("feature-title")}>Đặt phòng linh hoạt</h3>
              <p className={cx("feature-desc")}>
                Dễ dàng thay đổi hoặc hủy đặt phòng với chính sách linh hoạt
              </p>
            </div>

            <div className={cx("feature-card")}>
              <div className={cx("feature-icon", "green")}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className={cx("feature-title")}>Thanh toán an toàn</h3>
              <p className={cx("feature-desc")}>
                Bảo mật thông tin 100% với công nghệ mã hóa tiên tiến
              </p>
            </div>

            <div className={cx("feature-card")}>
              <div className={cx("feature-icon", "purple")}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className={cx("feature-title")}>Hỗ trợ 24/7</h3>
              <p className={cx("feature-desc")}>
                Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ mọi lúc mọi nơi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className={cx("popular-destinations")}>
        <div className={cx("container")}>
          <div className={cx("section-header")}>
            <h2 className={cx("section-title")}>Điểm đến phổ biến</h2>
            <p className={cx("section-subtitle")}>
              Khám phá những địa điểm du lịch được yêu thích nhất
            </p>
          </div>

          <div className={cx("destinations-grid")}>
            <div className={cx("destination-card", "large")}>
              <div className={cx("destination-image")}>
                <img
                  src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800"
                  alt="Hà Nội"
                  loading="lazy"
                  width="400"
                  height="300"
                />
              </div>
              <div className={cx("destination-content")}>
                <h3 className={cx("destination-name")}>Hà Nội</h3>
                <p className={cx("destination-count")}>1,234+ khách sạn</p>
              </div>
            </div>

            <div className={cx("destination-card")}>
              <div className={cx("destination-image")}>
                <img
                  src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"
                  alt="Đà Nẵng"
                  loading="lazy"
                  width="400"
                  height="300"
                />
              </div>
              <div className={cx("destination-content")}>
                <h3 className={cx("destination-name")}>Đà Nẵng</h3>
                <p className={cx("destination-count")}>856+ khách sạn</p>
              </div>
            </div>

            <div className={cx("destination-card")}>
              <div className={cx("destination-image")}>
                <img
                  src="https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800"
                  alt="Hội An"
                  loading="lazy"
                  width="400"
                  height="300"
                />
              </div>
              <div className={cx("destination-content")}>
                <h3 className={cx("destination-name")}>Hội An</h3>
                <p className={cx("destination-count")}>542+ khách sạn</p>
              </div>
            </div>

            <div className={cx("destination-card")}>
              <div className={cx("destination-image")}>
                <img
                  src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"
                  alt="Nha Trang"
                  loading="lazy"
                  width="400"
                  height="300"
                />
              </div>
              <div className={cx("destination-content")}>
                <h3 className={cx("destination-name")}>Nha Trang</h3>
                <p className={cx("destination-count")}>678+ khách sạn</p>
              </div>
            </div>

            <div className={cx("destination-card")}>
              <div className={cx("destination-image")}>
                <img
                  src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800"
                  alt="Phú Quốc"
                  loading="lazy"
                  width="400"
                  height="300"
                />
              </div>
              <div className={cx("destination-content")}>
                <h3 className={cx("destination-name")}>Phú Quốc</h3>
                <p className={cx("destination-count")}>423+ khách sạn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelPage;
