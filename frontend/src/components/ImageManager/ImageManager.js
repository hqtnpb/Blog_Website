import { useState, useRef, useCallback } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faImage,
  faTimes,
  faSpinner,
  faStar,
  faGripVertical,
  faTrash,
  faCheckCircle,
  faCompressAlt,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { uploadImage } from "~/common/aws";
import styles from "./ImageManager.module.scss";

const cx = classNames.bind(styles);

function ImageManager({
  images = [],
  onChange,
  maxImages = 10,
  disabled = false,
  allowReorder = true,
  allowSetPrimary = true,
  compressionEnabled = true,
  compressionQuality = 0.8,
  maxSizeMB = 1,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Normalize images to ensure proper structure
  const normalizedImages = images
    .map((img, index) => {
      // If img is a string (URL), convert to object
      if (typeof img === "string") {
        return {
          url: img,
          isPrimary: index === 0,
          order: index,
        };
      }
      // If img is an object, ensure it has all required properties
      if (img && typeof img === "object") {
        return {
          url: img.url || "",
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
          order: img.order !== undefined ? img.order : index,
        };
      }
      // Fallback for invalid data
      return {
        url: "",
        isPrimary: false,
        order: index,
      };
    })
    .filter((img) => img.url); // Remove images without URLs

  // Compress image before upload
  const compressImage = useCallback(
    async (file) => {
      if (!compressionEnabled) return file;

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1080;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = (height * MAX_WIDTH) / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = (width * MAX_HEIGHT) / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });

                const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
                const compressedSizeMB = (
                  compressedFile.size /
                  1024 /
                  1024
                ).toFixed(2);

                if (compressedFile.size < file.size) {
                  toast.success(
                    `Đã nén: ${originalSizeMB}MB → ${compressedSizeMB}MB`
                  );
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              file.type,
              compressionQuality
            );
          };
        };
      });
    },
    [compressionEnabled, compressionQuality]
  );

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
    const remainingSlots = maxImages - normalizedImages.length;

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
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit before compression
        toast.error(`${file.name} quá lớn (tối đa 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileId = `${Date.now()}-${i}`;

        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { name: file.name, progress: 0 },
        }));

        try {
          // Compress image before upload
          const compressedFile = await compressImage(file);

          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { ...prev[fileId], progress: 30, status: "uploading" },
          }));

          // Upload to S3
          const url = await uploadImage(compressedFile);

          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { ...prev[fileId], progress: 100, status: "complete" },
          }));

          uploadedUrls.push({
            url,
            isPrimary:
              normalizedImages.length === 0 && uploadedUrls.length === 0, // First image is primary
            order: normalizedImages.length + uploadedUrls.length,
          });
        } catch (error) {
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { ...prev[fileId], status: "error" },
          }));
          toast.error(`Lỗi upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...normalizedImages, ...uploadedUrls]);
        toast.success(`Đã upload ${uploadedUrls.length} ảnh`);
      }
    } catch (error) {
      toast.error("Lỗi upload ảnh");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleRemoveImage = (index) => {
    if (disabled) return;

    const newImages = normalizedImages.filter((_, i) => i !== index);

    // If removed image was primary, set first image as primary
    if (normalizedImages[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    // Reorder
    newImages.forEach((img, i) => {
      img.order = i;
    });

    onChange(newImages);
    toast.success("Đã xóa ảnh");
  };

  const handleSetPrimary = (index) => {
    if (disabled || !allowSetPrimary) return;

    const newImages = normalizedImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));

    onChange(newImages);
    toast.success("Đã đặt làm ảnh chính");
  };

  // Drag and drop for reordering
  const handleImageDragStart = (e, index) => {
    if (!allowReorder || disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleImageDragOver = (e, index) => {
    if (!allowReorder || disabled) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleImageDrop = (e, dropIndex) => {
    if (!allowReorder || disabled) return;
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...normalizedImages];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Update order
    newImages.forEach((img, i) => {
      img.order = i;
    });

    onChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success("Đã sắp xếp lại thứ tự");
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cx("image-manager")}>
      {/* Upload Area */}
      <div
        className={cx("upload-area", {
          active: dragActive,
          disabled: disabled || normalizedImages.length >= maxImages,
        })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && normalizedImages.length < maxImages) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: "none" }}
          disabled={disabled || normalizedImages.length >= maxImages}
        />

        <div className={cx("upload-content")}>
          <FontAwesomeIcon
            icon={faCloudUploadAlt}
            className={cx("upload-icon")}
          />
          <h3>Kéo thả ảnh vào đây</h3>
          <p>hoặc click để chọn file</p>
          <div className={cx("upload-info")}>
            <span>
              <FontAwesomeIcon icon={faImage} /> Tối đa {maxImages} ảnh
            </span>
            {compressionEnabled && (
              <span>
                <FontAwesomeIcon icon={faCompressAlt} /> Tự động nén ảnh
              </span>
            )}
          </div>
          <div className={cx("upload-counter")}>
            {normalizedImages.length} / {maxImages} ảnh
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className={cx("upload-progress-container")}>
          {Object.entries(uploadProgress).map(([id, data]) => (
            <div key={id} className={cx("progress-item")}>
              <div className={cx("progress-info")}>
                <span className={cx("file-name")}>{data.name}</span>
                <span className={cx("progress-status")}>
                  {data.status === "complete" && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={cx("success")}
                    />
                  )}
                  {data.status === "uploading" && (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  )}
                  {data.status === "error" && (
                    <span className={cx("error")}>Lỗi</span>
                  )}
                </span>
              </div>
              <div className={cx("progress-bar")}>
                <div
                  className={cx("progress-fill")}
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {normalizedImages.length > 0 && (
        <div className={cx("image-grid")}>
          {normalizedImages.map((image, index) => (
            <div
              key={index}
              className={cx("image-item", {
                primary: image.isPrimary,
                dragging: draggedIndex === index,
                "drag-over": dragOverIndex === index,
              })}
              draggable={allowReorder && !disabled}
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragEnd={handleImageDragEnd}
            >
              {/* Drag Handle */}
              {allowReorder && !disabled && (
                <div className={cx("drag-handle")}>
                  <FontAwesomeIcon icon={faGripVertical} />
                </div>
              )}

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className={cx("primary-badge")}>
                  <FontAwesomeIcon icon={faStar} />
                  <span>Ảnh chính</span>
                </div>
              )}

              {/* Order Badge */}
              <div className={cx("order-badge")}>{index + 1}</div>

              {/* Image Preview */}
              <img src={image.url} alt={`Image ${index + 1}`} />

              {/* Action Buttons */}
              <div className={cx("image-actions")}>
                {allowSetPrimary && !image.isPrimary && (
                  <button
                    className={cx("action-btn", "primary-btn")}
                    onClick={() => handleSetPrimary(index)}
                    disabled={disabled}
                    title="Đặt làm ảnh chính"
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                )}
                <button
                  className={cx("action-btn", "delete-btn")}
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                  title="Xóa ảnh"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {normalizedImages.length === 0 && (
        <div className={cx("empty-state")}>
          <FontAwesomeIcon icon={faImage} className={cx("empty-icon")} />
          <p>Chưa có ảnh nào. Upload ảnh để bắt đầu.</p>
        </div>
      )}

      {normalizedImages.length > 0 && allowReorder && (
        <div className={cx("instructions")}>
          <p>
            💡 <strong>Mẹo:</strong> Kéo thả ảnh để sắp xếp lại thứ tự. Click{" "}
            <FontAwesomeIcon icon={faStar} /> để đặt ảnh chính.
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageManager;
