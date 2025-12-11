import { useState, useRef } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faImage,
  faTimes,
  faSpinner,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { uploadImage } from "~/common/aws";
import styles from "./ImageUploadWidget.module.scss";

const cx = classNames.bind(styles);

function ImageUploadWidget({
  images = [],
  onChange,
  maxImages = 5,
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      toast.error(
        `Chỉ có thể upload tối đa ${maxImages} ảnh. Còn ${remainingSlots} slot trống.`
      );
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} không phải là file ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileId = `${Date.now()}-${i}`;

      try {
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + 10, 90),
          }));
        }, 200);

        const imageUrl = await uploadImage(file);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

        if (imageUrl) {
          newImages.push(imageUrl);
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        }
      } catch (error) {
        toast.error(`Không thể upload ${file.name}`);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }

    onChange(newImages);
    setUploading(false);
  };

  const handleRemoveImage = (index) => {
    if (disabled) return;
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success("Đã xóa ảnh");
  };

  const handleClickUpload = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cx("upload-widget")}>
      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          className={cx("upload-zone", { active: dragActive, disabled })}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            style={{ display: "none" }}
            disabled={disabled}
          />

          <FontAwesomeIcon
            icon={uploading ? faSpinner : faCloudUploadAlt}
            className={cx("upload-icon", { spinning: uploading })}
            spin={uploading}
          />

          <p className={cx("upload-text")}>
            {uploading
              ? "Đang upload..."
              : "Kéo thả ảnh vào đây hoặc click để chọn"}
          </p>

          <p className={cx("upload-hint")}>
            Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi ảnh)
          </p>

          <p className={cx("upload-count")}>
            {images.length} / {maxImages} ảnh
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className={cx("progress-container")}>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className={cx("progress-item")}>
              <div className={cx("progress-bar")}>
                <div
                  className={cx("progress-fill")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={cx("progress-text")}>{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className={cx("preview-grid")}>
          {images.map((imageUrl, index) => (
            <div key={index} className={cx("preview-item")}>
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className={cx("preview-image")}
              />

              {!disabled && (
                <button
                  type="button"
                  className={cx("remove-btn")}
                  onClick={() => handleRemoveImage(index)}
                  title="Xóa ảnh"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}

              <div className={cx("preview-overlay")}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className={cx("check-icon")}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className={cx("empty-state")}>
          <FontAwesomeIcon icon={faImage} className={cx("empty-icon")} />
          <p>Chưa có ảnh nào</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploadWidget;
