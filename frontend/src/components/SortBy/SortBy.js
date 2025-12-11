import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./SortBy.module.scss";

const cx = classNames.bind(styles);

const SORT_OPTIONS = [
  { value: "recommended", label: "Đề xuất" },
  { value: "price-low-high", label: "Giá: Thấp đến cao" },
  { value: "price-high-low", label: "Giá: Cao đến thấp" },
  { value: "rating-high-low", label: "Đánh giá: Cao đến thấp" },
  { value: "distance", label: "Khoảng cách từ trung tâm" },
];

function SortBy({ currentSort, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption =
    SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className={cx("sort-by")} ref={dropdownRef}>
      <button className={cx("sort-button")} onClick={() => setIsOpen(!isOpen)}>
        <span className={cx("sort-label")}>Sắp xếp theo:</span>
        <span className={cx("sort-value")}>{currentOption.label}</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={cx("chevron", { open: isOpen })}
        >
          <path fill="#383E48" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className={cx("dropdown-menu")}>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={cx("dropdown-item", {
                active: option.value === currentSort,
              })}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {option.value === currentSort && (
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path
                    fill="#ff5b26"
                    d="M7 10l3 3 7-7-1.5-1.5L9 11 8.5 10.5z"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortBy;
