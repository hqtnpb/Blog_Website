import { useState, useEffect, useCallback } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./SearchModal.module.scss";
import axios from "axios";

const cx = classNames.bind(styles);

function SearchModal({ isOpen, onClose, searchQuery }) {
  const [results, setResults] = useState({
    hotels: [],
    rooms: [],
    bookings: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Trigger search when modal opens or query changes
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({ hotels: [], rooms: [], bookings: [] });
      return;
    }

    // Perform search
    const performSearch = async () => {
      try {
        setLoading(true);

        const query = searchQuery.trim();
        const apiBase = process.env.REACT_APP_SERVER_DOMAIN;

        // No authentication required for public search
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const [hotelsRes, roomsRes, bookingsRes] = await Promise.all([
          axios.get(
            `${apiBase}/search-hotels?q=${encodeURIComponent(query)}`,
            config
          ),
          axios.get(
            `${apiBase}/search-rooms?q=${encodeURIComponent(query)}`,
            config
          ),
          axios.get(
            `${apiBase}/search-bookings?q=${encodeURIComponent(query)}`,
            config
          ),
        ]);

        setResults({
          hotels: hotelsRes.data.hotels || [],
          rooms: roomsRes.data.rooms || [],
          bookings: bookingsRes.data.bookings || [],
        });
      } catch (error) {
        console.error("Search error:", error.message);
        setResults({ hotels: [], rooms: [], bookings: [] });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [isOpen, searchQuery]);

  const totalResults =
    results.hotels.length + results.rooms.length + results.bookings.length;

  const getFilteredResults = () => {
    switch (activeTab) {
      case "hotels":
        return { hotels: results.hotels, rooms: [], bookings: [] };
      case "rooms":
        return { hotels: [], rooms: results.rooms, bookings: [] };
      case "bookings":
        return { hotels: [], rooms: [], bookings: results.bookings };
      default:
        return results;
    }
  };

  const filtered = getFilteredResults();

  if (!isOpen) return null;

  return (
    <div className={cx("modal-overlay")} onClick={onClose}>
      <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
        <div className={cx("modal-header")}>
          <h3 className={cx("title")}>
            Kết quả tìm kiếm {searchQuery && `cho "${searchQuery}"`}
          </h3>
          <button className={cx("close-btn")} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={cx("tabs")}>
          <button
            className={cx("tab", { active: activeTab === "all" })}
            onClick={() => setActiveTab("all")}
          >
            Tất cả ({totalResults})
          </button>
          <button
            className={cx("tab", { active: activeTab === "hotels" })}
            onClick={() => setActiveTab("hotels")}
          >
            Khách sạn ({results.hotels.length})
          </button>
          <button
            className={cx("tab", { active: activeTab === "rooms" })}
            onClick={() => setActiveTab("rooms")}
          >
            Phòng ({results.rooms.length})
          </button>
          <button
            className={cx("tab", { active: activeTab === "bookings" })}
            onClick={() => setActiveTab("bookings")}
          >
            Đặt phòng ({results.bookings.length})
          </button>
        </div>

        <div className={cx("results")}>
          {loading ? (
            <div className={cx("loading")}>
              <div className={cx("spinner")}></div>
              <p>Đang tìm kiếm...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className={cx("empty")}>
              <span className={cx("empty-icon")}>🔍</span>
              <p>Không tìm thấy kết quả nào</p>
            </div>
          ) : (
            <>
              {filtered.hotels.length > 0 && (
                <div className={cx("result-section")}>
                  <h4 className={cx("section-title")}>
                    🏨 Khách sạn ({filtered.hotels.length})
                  </h4>
                  <div className={cx("result-items")}>
                    {filtered.hotels.map((hotel) => (
                      <Link
                        key={hotel._id}
                        to={`/admin/hotels?edit=${hotel._id}`}
                        className={cx("result-item")}
                        onClick={onClose}
                      >
                        <div className={cx("item-icon")}>🏨</div>
                        <div className={cx("item-content")}>
                          <h5 className={cx("item-title")}>{hotel.name}</h5>
                          <p className={cx("item-subtitle")}>
                            {hotel.city}, {hotel.country}
                          </p>
                        </div>
                        <div className={cx("item-badge")}>
                          {hotel.rooms?.length || 0} phòng
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filtered.rooms.length > 0 && (
                <div className={cx("result-section")}>
                  <h4 className={cx("section-title")}>
                    🛏️ Phòng ({filtered.rooms.length})
                  </h4>
                  <div className={cx("result-items")}>
                    {filtered.rooms.map((room) => (
                      <Link
                        key={room._id}
                        to={`/admin/rooms?edit=${room._id}`}
                        className={cx("result-item")}
                        onClick={onClose}
                      >
                        <div className={cx("item-icon")}>🛏️</div>
                        <div className={cx("item-content")}>
                          <h5 className={cx("item-title")}>
                            {room.roomNumber
                              ? `Phòng ${room.roomNumber}`
                              : room.title || room.type}
                          </h5>
                          <p className={cx("item-subtitle")}>
                            {room.hotel?.name || "N/A"} •{" "}
                            {room.type || room.roomType}
                          </p>
                        </div>
                        <div className={cx("item-badge")}>
                          ${room.pricePerNight || room.price}/đêm
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filtered.bookings.length > 0 && (
                <div className={cx("result-section")}>
                  <h4 className={cx("section-title")}>
                    📅 Đặt phòng ({filtered.bookings.length})
                  </h4>
                  <div className={cx("result-items")}>
                    {filtered.bookings.map((booking) => (
                      <Link
                        key={booking._id}
                        to={`/admin/bookings?view=${booking._id}`}
                        className={cx("result-item")}
                        onClick={onClose}
                      >
                        <div className={cx("item-icon")}>📅</div>
                        <div className={cx("item-content")}>
                          <h5 className={cx("item-title")}>
                            {booking.room?.title || "N/A"}
                          </h5>
                          <p className={cx("item-subtitle")}>
                            {booking.user?.personal_info?.fullname || "N/A"}
                          </p>
                        </div>
                        <div
                          className={cx(
                            "item-badge",
                            booking.status?.toLowerCase()
                          )}
                        >
                          {booking.status}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
