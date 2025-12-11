import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./SearchResult.module.scss";
import FilterPanel from "~/components/FilterPanel";
import ProductCard from "~/components/ProductCard";
import SortBy from "~/components/SortBy";
import Pagination from "~/components/Pagination";

const cx = classNames.bind(styles);

function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const checkIn = searchParams.get("checkIn") || null;
  const checkOut = searchParams.get("checkOut") || null;
  const rooms = searchParams.get("rooms") || "1";
  const adults = searchParams.get("adults") || "2";
  const children = searchParams.get("children") || "0";
  const totalGuests = parseInt(adults) + parseInt(children);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [filters, setFilters] = useState(null); // Don't apply filters on initial load

  // Use ref to track filter changes without causing re-renders
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);

    const apiUrl =
      process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

    try {
      const response = await axios.get(`${apiUrl}/search-hotels`, {
        params: {
          query,
          page: currentPage,
          limit: resultsPerPage,
          sort: sortBy,
          filters: filtersRef.current
            ? JSON.stringify(filtersRef.current)
            : undefined,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          rooms: rooms,
          adults: adults,
          children: children,
        },
      });

      if (response.data.success) {
        setHotels(response.data.data || []);
        setTotalResults(response.data.total || 0);
      } else {
        setError("Failed to fetch hotels");
      }
    } catch (err) {
      console.error("❌ Error fetching hotels:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError("An error occurred while fetching hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, sortBy, checkIn, checkOut, rooms, adults, children]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleClearFilters = useCallback(() => {
    setFilters(null);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters) => {
      // Map FilterPanel state to backend format
      setFilters({
        minPrice: newFilters.priceRange?.[0],
        maxPrice: newFilters.priceRange?.[1],
        distance: newFilters.distance,
        guestReview: newFilters.selectedReviews || [],
        propertyClass: newFilters.selectedStars || [],
        amenities: newFilters.selectedAmenities || [],
      });
      setCurrentPage(1);
      // Trigger fetch manually after filter change
      setTimeout(() => fetchHotels(), 0);
    },
    [fetchHotels]
  );

  return (
    <div className={cx("search-result-page")}>
      <div className={cx("container")}>
        {/* Filter Sidebar */}
        <aside className={cx("filter-sidebar")}>
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Results Section */}
        <main className={cx("results-section")}>
          {/* Header with Title and View Switch */}
          <div className={cx("results-header")}>
            <div className={cx("header-text")}>
              <h1 className={cx("page-title")}>
                {query
                  ? `Khám phá ${totalResults}+ điểm đến tại ${query}`
                  : "Khám phá 300+ điểm đến"}
              </h1>
              {(checkIn || checkOut || rooms !== "1" || totalGuests > 2) && (
                <p className={cx("search-criteria")}>
                  {checkIn && checkOut && (
                    <span>
                      {new Date(checkIn).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(checkOut).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                  {(checkIn || checkOut) &&
                    (rooms !== "1" || totalGuests > 2) && <span> • </span>}
                  {rooms !== "1" && <span>{rooms} phòng</span>}
                  {rooms !== "1" && totalGuests > 2 && <span>, </span>}
                  {totalGuests > 2 && (
                    <span>
                      {totalGuests} khách ({adults} người lớn
                      {parseInt(children) > 0 ? `, ${children} trẻ em` : ""})
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className={cx("view-switch")}>
              <button
                className={cx("view-btn", { active: viewMode === "list" })}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M3 4h2v2H3V4zm4 0h14v2H7V4zM3 11h2v2H3v-2zm4 0h14v2H7v-2zm-4 7h2v2H3v-2zm4 0h14v2H7v-2z"
                  />
                </svg>
              </button>
              <button
                className={cx("view-btn", { active: viewMode === "grid" })}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Sort By Row */}
          <div className={cx("sort-row")}>
            <SortBy currentSort={sortBy} onSortChange={handleSortChange} />
          </div>

          {/* Results List */}
          <div className={cx("results-list")}>
            {loading ? (
              <div className={cx("loading")}>
                <div className={cx("spinner")} />
                <p>Đang tìm kiếm khách sạn...</p>
              </div>
            ) : error ? (
              <div className={cx("error")}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#FF4444"
                    strokeWidth="3"
                  />
                  <path
                    d="M32 20v16M32 44h.01"
                    stroke="#FF4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <h3>Rất tiếc! Đã xảy ra lỗi</h3>
                <p>{error}</p>
                <button onClick={fetchHotels} className={cx("retry-btn")}>
                  Thử lại
                </button>
              </div>
            ) : hotels.length === 0 ? (
              <div className={cx("no-results")}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <path
                    fill="#DDDFE3"
                    d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm-8 12c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm16 0c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zM20 36c0 6.627 5.373 12 12 12s12-5.373 12-12H20z"
                  />
                </svg>
                <h3>Không tìm thấy khách sạn</h3>
                <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                {hotels.map((hotel) => (
                  <ProductCard key={hotel._id || hotel.id} hotel={hotel} />
                ))}

                {/* Pagination */}
                {totalResults > resultsPerPage && (
                  <div className={cx("pagination-wrapper")}>
                    <Pagination
                      totalPosts={totalResults}
                      postsPerPage={resultsPerPage}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SearchResult;
