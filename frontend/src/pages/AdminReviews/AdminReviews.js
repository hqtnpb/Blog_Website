import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faStarHalfAlt,
  faSpinner,
  faEye,
  faTimes,
  faFilter,
  faReply,
  faUser,
  faCalendar,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import {
  getPartnerHotels,
  getHotelReviews,
  replyToReview,
} from "~/common/partnerApi";
import styles from "./AdminReviews.module.scss";

const cx = classNames.bind(styles);

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (hotels.length > 0) {
      fetchReviews();
    }
  }, [hotels, selectedHotel]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getPartnerHotels();
      setHotels(data);
    } catch (error) {
      toast.error("Không thể tải danh sách khách sạn");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let allReviews = [];

      if (selectedHotel === "all") {
        // Fetch reviews for all hotels
        const reviewPromises = hotels.map((hotel) =>
          getHotelReviews(hotel._id).catch(() => [])
        );
        const reviewsArrays = await Promise.all(reviewPromises);
        allReviews = reviewsArrays.flat();
      } else {
        // Fetch reviews for selected hotel
        allReviews = await getHotelReviews(selectedHotel);
      }

      setReviews(allReviews);
    } catch (error) {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.partnerReply || "");
    setShowReplyModal(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      setReplying(true);
      await replyToReview(selectedReview._id, replyText);
      toast.success("Trả lời đánh giá thành công!");
      setShowReplyModal(false);
      setReplyText("");
      await fetchReviews();
    } catch (error) {
      toast.error(error.message || "Không thể trả lời đánh giá");
      console.error(error);
    } finally {
      setReplying(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter === "all") return true;
    return review.rating === parseInt(ratingFilter);
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className={cx("star-filled")}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon
          key="half"
          icon={faStarHalfAlt}
          className={cx("star-filled")}
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className={cx("star-empty")}
        />
      );
    }

    return stars;
  };

  const getAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  if (loading && hotels.length === 0) {
    return (
      <div className={cx("loadingContainer")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loadingIcon")} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const avgRating = getAverageRating();
  const ratingDist = getRatingDistribution();
  const totalReviews = filteredReviews.length;

  return (
    <div className={cx("container")}>
      {/* Header */}
      <div className={cx("header")}>
        <div>
          <h1 className={cx("title")}>Quản Lý Đánh Giá</h1>
          <p className={cx("subtitle")}>
            Tổng cộng: <strong>{totalReviews}</strong> đánh giá
            {avgRating > 0 && (
              <>
                {" · "}
                Trung bình: <strong>{avgRating} ⭐</strong>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={cx("filtersRow")}>
        {/* Hotel Filter */}
        <div className={cx("filterBox")}>
          <FontAwesomeIcon icon={faFilter} className={cx("filterIcon")} />
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className={cx("filterSelect")}
          >
            <option value="all">Tất cả khách sạn</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div className={cx("filterBox")}>
          <FontAwesomeIcon icon={faStar} className={cx("filterIcon")} />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className={cx("filterSelect")}
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
            <option value="4">4 sao ⭐⭐⭐⭐</option>
            <option value="3">3 sao ⭐⭐⭐</option>
            <option value="2">2 sao ⭐⭐</option>
            <option value="1">1 sao ⭐</option>
          </select>
        </div>
      </div>

      {/* Rating Statistics */}
      {totalReviews > 0 && (
        <div className={cx("statsCard")}>
          <div className={cx("statsLeft")}>
            <div className={cx("avgRating")}>
              <span className={cx("ratingNumber")}>{avgRating}</span>
              <div className={cx("stars")}>
                {renderStars(parseFloat(avgRating))}
              </div>
              <p className={cx("totalReviews")}>{totalReviews} đánh giá</p>
            </div>
          </div>
          <div className={cx("statsRight")}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDist[star];
              const percentage =
                totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className={cx("ratingBar")}>
                  <span className={cx("ratingLabel")}>{star} ⭐</span>
                  <div className={cx("barContainer")}>
                    <div
                      className={cx("barFill")}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={cx("ratingCount")}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className={cx("reviewsContainer")}>
        {loading ? (
          <div className={cx("loadingState")}>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className={cx("loadingIcon")}
            />
            <p>Đang tải đánh giá...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          <AnimatePresence>
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review._id}
                className={cx("reviewCard")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={cx("reviewHeader")}>
                  <div className={cx("userInfo")}>
                    <div className={cx("avatar")}>
                      {review.user?.personal_info?.profile_img ? (
                        <img
                          src={review.user.personal_info.profile_img}
                          alt={review.user.personal_info.username}
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} />
                      )}
                    </div>
                    <div className={cx("userDetails")}>
                      <h4 className={cx("userName")}>
                        {review.user?.personal_info?.username || "Khách hàng"}
                      </h4>
                      <div className={cx("reviewMeta")}>
                        <FontAwesomeIcon icon={faCalendar} />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cx("ratingDisplay")}>
                    <div className={cx("stars")}>
                      {renderStars(review.rating)}
                    </div>
                    <span className={cx("ratingValue")}>{review.rating}/5</span>
                  </div>
                </div>

                <div className={cx("reviewBody")}>
                  <p className={cx("reviewComment")}>{review.comment}</p>
                </div>

                {review.partnerReply && (
                  <div className={cx("partnerReply")}>
                    <div className={cx("replyHeader")}>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className={cx("replyIcon")}
                      />
                      <strong>Phản hồi từ chủ khách sạn:</strong>
                    </div>
                    <p className={cx("replyText")}>{review.partnerReply}</p>
                  </div>
                )}

                <div className={cx("reviewActions")}>
                  <button
                    className={cx("replyBtn")}
                    onClick={() => handleOpenReplyModal(review)}
                  >
                    <FontAwesomeIcon icon={faReply} />
                    <span>
                      {review.partnerReply ? "Chỉnh sửa phản hồi" : "Trả lời"}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className={cx("emptyState")}>
            <FontAwesomeIcon icon={faStar} className={cx("emptyIcon")} />
            <p>Chưa có đánh giá nào</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedReview && (
          <motion.div
            className={cx("modalOverlay")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReplyModal(false)}
          >
            <motion.div
              className={cx("modal")}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cx("modalHeader")}>
                <h2>Trả Lời Đánh Giá</h2>
                <button
                  className={cx("closeBtn")}
                  onClick={() => setShowReplyModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className={cx("modalBody")}>
                <div className={cx("originalReview")}>
                  <h4>
                    Đánh giá từ {selectedReview.user?.personal_info?.username}
                  </h4>
                  <div className={cx("stars")}>
                    {renderStars(selectedReview.rating)}
                  </div>
                  <p className={cx("reviewText")}>{selectedReview.comment}</p>
                </div>

                <div className={cx("replyForm")}>
                  <label className={cx("formLabel")}>Phản hồi của bạn:</label>
                  <textarea
                    className={cx("replyTextarea")}
                    placeholder="Nhập phản hồi của bạn..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              <div className={cx("modalFooter")}>
                <button
                  className={cx("cancelBtn")}
                  onClick={() => setShowReplyModal(false)}
                  disabled={replying}
                >
                  Hủy
                </button>
                <button
                  className={cx("submitBtn")}
                  onClick={handleReplySubmit}
                  disabled={replying || !replyText.trim()}
                >
                  {replying ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faReply} />
                      <span>Gửi phản hồi</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminReviews;
