import { useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faSpinner,
  faCloudUploadAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { uploadImage } from "~/common/aws";
import styles from "./AvatarUploadWidget.module.scss";

const cx = classNames.bind(styles);

function AvatarUploadWidget({
  currentAvatar,
  onUploadSuccess,
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (disabled) return;

    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Ảnh phải nhỏ hơn 5MB");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to S3
      const imageUrl = await uploadImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call success callback
      if (onUploadSuccess) {
        await onUploadSuccess(imageUrl);
      }

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại!");
      console.error("Upload error:", error);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className={cx("avatar-upload-widget")}>
      <div
        className={cx("avatar-container", {
          dragging: dragActive,
          uploading: uploading,
          disabled: disabled,
        })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Avatar Image */}
        <div className={cx("avatar-wrapper")}>
          <img
            src={currentAvatar || "https://i.pravatar.cc/200"}
            alt="Avatar"
            className={cx("avatar-image")}
          />

          {/* Upload Overlay */}
          <div className={cx("upload-overlay")}>
            {uploading ? (
              <div className={cx("upload-status")}>
                <FontAwesomeIcon
                  icon={uploadProgress === 100 ? faCheckCircle : faSpinner}
                  spin={uploadProgress !== 100}
                  className={cx("upload-icon", {
                    success: uploadProgress === 100,
                  })}
                />
                <span className={cx("upload-text")}>{uploadProgress}%</span>
              </div>
            ) : (
              <div className={cx("upload-prompt")}>
                <FontAwesomeIcon
                  icon={dragActive ? faCloudUploadAlt : faCamera}
                  className={cx("camera-icon")}
                />
                <span className={cx("upload-text")}>
                  {dragActive ? "Thả ảnh vào đây" : "Đổi ảnh"}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && uploadProgress < 100 && (
            <div className={cx("progress-bar-container")}>
              <div
                className={cx("progress-bar")}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className={cx("file-input")}
          disabled={disabled || uploading}
        />
      </div>

      {/* Helper Text */}
      <p className={cx("helper-text")}>
        {dragActive
          ? "Thả ảnh vào đây để tải lên"
          : "Click hoặc kéo thả ảnh để thay đổi (Max 5MB)"}
      </p>
    </div>
  );
}

export default AvatarUploadWidget;
