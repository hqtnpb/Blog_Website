import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./LazyImage.module.scss";

const cx = classNames.bind(styles);

/**
 * LazyImage Component với Intersection Observer
 * Chỉ load image khi nó xuất hiện trong viewport
 */
function LazyImage({
  src,
  alt = "",
  className = "",
  placeholder = "/placeholder.jpg",
  onLoad,
  onError,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Skip if no src or already using actual src
    if (!src || imageSrc === src) return;

    let observer;
    const imgElement = imgRef.current;

    if (imgElement) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Load the actual image
              const img = new Image();

              img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
                if (onLoad) onLoad();
              };

              img.onerror = () => {
                setHasError(true);
                if (onError) onError();
              };

              img.src = src;

              // Stop observing once loaded
              observer.unobserve(imgElement);
            }
          });
        },
        {
          rootMargin: "50px", // Load 50px before entering viewport
          threshold: 0.01,
        }
      );

      observer.observe(imgElement);
    }

    return () => {
      if (observer && imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, [src, imageSrc, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cx("lazy-image", className, {
        loading: !isLoaded && !hasError,
        loaded: isLoaded,
        error: hasError,
      })}
      loading="lazy" // Native lazy loading as fallback
      {...props}
    />
  );
}

export default LazyImage;
