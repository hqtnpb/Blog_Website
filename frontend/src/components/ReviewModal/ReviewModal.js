import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import classNames from "classnames/bind";
import styles from "./ReviewModal.module.scss";

const cx = classNames.bind(styles);

function ReviewModal({ bookingId, onClose, onSuccess, initialData, isEdit }) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl =
    process.env.REACT_APP_SERVER_DOMAIN || "http://localhost:8000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmitting(true);

      // Get token from sessionStorage
      const userDataStr = sessionStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const token = userData?.accessToken;

      if (!token) {
        toast.error("Please login to submit review");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (isEdit && initialData?._id) {
        // Update existing review
        response = await axios.put(
          `${apiUrl}/reviews/${initialData._id}`,
          {
            rating,
            comment: comment.trim(),
          },
          config
        );
        toast.success("Đánh giá đã được cập nhật thành công!");
      } else {
        // Create new review
        const payload = {
          bookingId: bookingId,
          rating,
          comment: comment.trim(),
        };
        console.log("📝 Submitting review:", payload);
        response = await axios.post(`${apiUrl}/reviews`, payload, config);
        toast.success("Đánh giá đã được gửi thành công!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      console.error("   Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cx("modal-overlay")} onClick={onClose}>
      <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
        <div className={cx("modal-header")}>
          <h2>{isEdit ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}</h2>
          <button className={cx("close-btn")} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cx("review-form")}>
          {/* Rating */}
          <div className={cx("form-group")}>
            <label>Rating *</label>
            <div className={cx("star-rating")}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={cx("star-btn", {
                    filled: star <= (hoverRating || rating),
                  })}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              ))}
              <span className={cx("rating-text")}>
                {rating > 0 ? `${rating} out of 5` : "Select rating"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className={cx("form-group")}>
            <label>Your Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this hotel..."
              rows={6}
              maxLength={500}
              required
            />
            <small className={cx("char-count")}>
              {comment.length}/500 characters
            </small>
          </div>

          {/* Actions */}
          <div className={cx("modal-actions")}>
            <button
              type="button"
              className={cx("btn", "btn-cancel")}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cx("btn", "btn-submit")}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>{isEdit ? "Đang cập nhật..." : "Đang gửi..."}</span>
                </>
              ) : isEdit ? (
                "Cập nhật đánh giá"
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
