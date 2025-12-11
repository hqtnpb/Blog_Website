import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./FilterPanel.module.scss";

const cx = classNames.bind(styles);

function FilterPanel({ filters, onFiltersChange, onClearFilters }) {
  const [expandedSections, setExpandedSections] = useState({
    priceRange: true,
    guestReview: true,
    propertyClass: true,
    amenities: true,
  });

  const [priceRange, setPriceRange] = useState([100000, 5000000]); // VND
  const [selectedAmenities, setSelectedAmenities] = useState(new Set());
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [selectedStars, setSelectedStars] = useState(new Set());

  // Use ref to track if user has interacted with filters
  const hasInteracted = useRef(false);

  // Sync changes with parent component only after user interaction
  useEffect(() => {
    // Only send filters if user has interacted
    if (!hasInteracted.current) {
      return;
    }

    if (onFiltersChange) {
      onFiltersChange({
        priceRange: [...priceRange],
        selectedAmenities: Array.from(selectedAmenities),
        selectedReviews: Array.from(selectedReviews),
        selectedStars: Array.from(selectedStars),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    priceRange[0],
    priceRange[1],
    selectedAmenities.size,
    selectedReviews.size,
    selectedStars.size,
  ]);

  const handleClearFilters = () => {
    hasInteracted.current = true;
    setPriceRange([100000, 5000000]);
    setSelectedAmenities(new Set());
    setSelectedReviews(new Set());
    setSelectedStars(new Set());

    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Mark as interacted when user changes any filter
  const handlePriceChange = (value) => {
    hasInteracted.current = true;
    setPriceRange(value);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAmenity = (amenity) => {
    hasInteracted.current = true;
    const newSet = new Set(selectedAmenities);
    if (newSet.has(amenity)) {
      newSet.delete(amenity);
    } else {
      newSet.add(amenity);
    }
    setSelectedAmenities(newSet);
  };

  const toggleReview = (review) => {
    hasInteracted.current = true;
    const newSet = new Set(selectedReviews);
    if (newSet.has(review)) {
      newSet.delete(review);
    } else {
      newSet.add(review);
    }
    setSelectedReviews(newSet);
  };

  const toggleStar = (star) => {
    hasInteracted.current = true;
    const newSet = new Set(selectedStars);
    if (newSet.has(star)) {
      newSet.delete(star);
    } else {
      newSet.add(star);
    }
    setSelectedStars(newSet);
  };

  const ChevronIcon = ({ expanded }) => (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <path
        fill="#383E48"
        d={expanded ? "M16 20l-6-6h12z" : "M16 20l6-6H10z"}
      />
    </svg>
  );

  // Hàm format giá VND
  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className={cx("filter-panel")}>
      {/* Show on Map */}
      <div className={cx("show-on-map")}>
        <div className={cx("map-placeholder")}>
          <div className={cx("map-overlay")}>
            <button className={cx("map-btn")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="#ff5b26"
                />
              </svg>
              <span>Hiển thị trên bản đồ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Container */}
      <div className={cx("filter-container")}>
        {/* Header */}
        <div className={cx("filter-header")}>
          <h3 className={cx("filter-title")}>Lọc theo:</h3>
          <button className={cx("clear-btn")} onClick={handleClearFilters}>
            Xóa tất cả
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={cx("filter-content")}>
          {/* Price Range */}
          <div className={cx("filter-section")}>
            <button
              className={cx("section-header")}
              onClick={() => toggleSection("priceRange")}
            >
              <span className={cx("section-title")}>Khoảng giá</span>
              <ChevronIcon expanded={expandedSections.priceRange} />
            </button>

            {expandedSections.priceRange && (
              <div className={cx("section-content")}>
                <div className={cx("price-range-section")}>
                  <p className={cx("subsection-desc")}>
                    Giá theo đêm tính bằng VND (bao gồm phí và thuế)
                  </p>

                  <div className={cx("price-slider")}>
                    <Slider
                      range
                      min={0}
                      max={10000000}
                      step={100000}
                      value={priceRange}
                      onChange={handlePriceChange}
                      trackStyle={[{ backgroundColor: "#ff5b26", height: 2 }]}
                      handleStyle={[
                        {
                          backgroundColor: "#FFFFFF",
                          border: "2px solid #ff5b26",
                          boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.2)",
                          width: 20,
                          height: 20,
                          marginTop: -9,
                        },
                        {
                          backgroundColor: "#FFFFFF",
                          border: "2px solid #ff5b26",
                          boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.2)",
                          width: 20,
                          height: 20,
                          marginTop: -9,
                        },
                      ]}
                      railStyle={{ backgroundColor: "#DDDFE3", height: 2 }}
                    />
                  </div>

                  <div className={cx("price-inputs")}>
                    <div className={cx("price-input-wrapper")}>
                      <label className={cx("price-label")}>Tối thiểu</label>
                      <div className={cx("price-input")}>
                        <span>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(priceRange[0])}
                        </span>
                      </div>
                    </div>
                    <div className={cx("price-input-wrapper")}>
                      <label className={cx("price-label")}>Tối đa</label>
                      <div className={cx("price-input")}>
                        <span>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(priceRange[1])}
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={cx("divider")} />

          {/* Guest Review Score */}
          <div className={cx("filter-section")}>
            <button
              className={cx("section-header")}
              onClick={() => toggleSection("guestReview")}
            >
              <span className={cx("section-title")}>Điểm đánh giá</span>
              <ChevronIcon expanded={expandedSections.guestReview} />
            </button>

            {expandedSections.guestReview && (
              <div className={cx("section-content")}>
                {[
                  { value: "5.0", label: "5.0 Xuất sắc" },
                  { value: "4.0+", label: "4.0+ Rất tốt" },
                  { value: "3.0+", label: "3.0+ Tốt" },
                  { value: "2.0+", label: "2.0+ Khá" },
                  { value: "<2.0", label: "< 2.0 Kém" },
                ].map((review) => (
                  <label
                    key={review.value}
                    className={cx("checkbox-item")}
                    onClick={() => toggleReview(review.value)}
                  >
                    <div
                      className={cx("checkbox", {
                        checked: selectedReviews.has(review.value),
                      })}
                    >
                      {selectedReviews.has(review.value) && (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <path
                            d="M10 3L4.5 8.5 2 6"
                            stroke="#FFF"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={cx("checkbox-label")}>{review.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={cx("divider")} />

          {/* Property Classification */}
          <div className={cx("filter-section")}>
            <button
              className={cx("section-header")}
              onClick={() => toggleSection("propertyClass")}
            >
              <span className={cx("section-title")}>Phân loại khách sạn</span>
              <ChevronIcon expanded={expandedSections.propertyClass} />
            </button>

            {expandedSections.propertyClass && (
              <div className={cx("section-content")}>
                {[
                  { stars: 5, label: "5 sao" },
                  { stars: 4, label: "4 sao" },
                  { stars: 3, label: "3 sao" },
                  { stars: 2, label: "2 sao" },
                  { stars: 1, label: "1 sao" },
                  { stars: 0, label: "Không xếp hạng" },
                ].map((item) => (
                  <label
                    key={item.label}
                    className={cx("checkbox-item", "star-item")}
                    onClick={() => toggleStar(item.label)}
                  >
                    <div
                      className={cx("checkbox", {
                        checked: selectedStars.has(item.label),
                      })}
                    >
                      {selectedStars.has(item.label) && (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <path
                            d="M10 3L4.5 8.5 2 6"
                            stroke="#FFF"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={cx("stars-row")}>
                      {item.stars > 0 ? (
                        <>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                            >
                              <path
                                fill={i < item.stars ? "#FAC91E" : "none"}
                                stroke="#FAC91E"
                                strokeWidth="1"
                                d="M9 2l2.163 4.38 4.837.702-3.5 3.412.826 4.816L9 13.26l-4.326 2.05.826-4.816-3.5-3.412 4.837-.702z"
                              />
                            </svg>
                          ))}
                        </>
                      ) : (
                        <div className={cx("stars-placeholder")}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                            >
                              <path
                                fill="none"
                                stroke="#FAC91E"
                                strokeWidth="1"
                                d="M9 2l2.163 4.38 4.837.702-3.5 3.412.826 4.816L9 13.26l-4.326 2.05.826-4.816-3.5-3.412 4.837-.702z"
                              />
                            </svg>
                          ))}
                        </div>
                      )}
                      <span className={cx("star-label")}>{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={cx("divider")} />

          {/* Amenities */}
          <div className={cx("filter-section")}>
            <button
              className={cx("section-header")}
              onClick={() => toggleSection("amenities")}
            >
              <span className={cx("section-title")}>Tiện nghi</span>
              <ChevronIcon expanded={expandedSections.amenities} />
            </button>

            {expandedSections.amenities && (
              <div className={cx("section-content")}>
                <div className={cx("chip-list")}>
                  {[
                    "Điều hòa",
                    "Wi-Fi",
                    "Hồ bơi",
                    "Bữa sáng miễn phí",
                    "Bãi đỗ xe miễn phí",
                    "Nhà hàng",
                    "Quầy bar",
                    "Phòng gym",
                    "Dịch vụ phòng",
                    "Lễ tân 24 giờ",
                    "Xe đưa đón sân bay",
                    "Bãi biển riêng",
                  ].map((amenity) => (
                    <button
                      key={amenity}
                      className={cx("chip", {
                        active: selectedAmenities.has(amenity),
                      })}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
