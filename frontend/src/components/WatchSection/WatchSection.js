import React, { useState, useRef } from "react";
import classNames from "classnames/bind";

import styles from "./WatchSection.module.scss";
import Button from "../Button";
import image from "~/assets/image";
import video from "~/assets/video";

const cx = classNames.bind(styles);

const data = [
  {
    videoId: 1,
    title: "Watch our entire trip documentation",
    videoSrc: video.video_pho,
    videoTitle: "New South Wales, Australia: from Sydney to the Blue Mountains",
    videoDesc:
      "Watch the best of Sydney. In this video we presented all the beautiful things of Sydney and Australia",
  },
  {
    videoId: 2,
    title: "Watch our journey to the North",
    videoSrc: video.video_co_bac,
    videoTitle: "Exploring the Northern beauty",
    videoDesc: "A trip full of adventures",
  },
  {
    videoId: 3,
    title: "Watch our journey in the city",
    videoSrc: video.video_sena,
    videoTitle: "City lights and urban wonders",
    videoDesc: "The best city experience",
  },
  {
    videoId: 4,
    title: "Watch our journey in the city",
    videoSrc: video.video_pho,
    videoTitle: "City lights and urban wonders",
    videoDesc: "The best city experience",
  },
];

function WatchSection() {
  const [playingVideo, setPlayingVideo] = useState(null); // Lưu video đang phát
  const videoRefs = useRef({}); // Lưu danh sách video theo ID
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [videosPerPage, setVideosPerPage] = useState(1); // Số video trên mỗi trang

  const handlePlay = (videoId) => {
    // Dừng tất cả video khác trước khi phát video mới
    Object.values(videoRefs.current).forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });

    // Phát video mới
    if (videoRefs.current[videoId]) {
      videoRefs.current[videoId].play();
      setPlayingVideo(videoId);
    }
  };

  const handleDotClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = data.slice(indexOfFirstVideo, indexOfLastVideo);

  return (
    <section className={cx("watch")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("video-list")}>
            {currentVideos.map((item) => (
              <div key={item.videoId} className={cx("video-item")}>
                <h2 className={cx("title")}>{item.title}</h2>
                <div className={cx("video-container")}>
                  {/* Chỉ hiện nút Play nếu video chưa phát */}
                  {playingVideo !== item.videoId && (
                    <Button
                      className={cx("play-button")}
                      onClick={() => handlePlay(item.videoId)}
                    >
                      <img
                        src={image.play_icon}
                        alt="Play video"
                        className={cx("play-icon")}
                        loading="lazy"
                        width="74"
                        height="74"
                      />
                    </Button>
                  )}
                  <video
                    ref={(el) => (videoRefs.current[item.videoId] = el)}
                    className={cx("video")}
                    controls={playingVideo === item.videoId}
                    preload="metadata"
                    playsInline
                  >
                    <source src={item.videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className={cx("video-content")}>
                  <h3 className={cx("video-title")}>{item.videoTitle}</h3>
                  <p className={cx("video-desc")}>{item.videoDesc}</p>
                </div>
                <div className={cx("dots")}>
                  {Array.from({
                    length: Math.ceil(data.length / videosPerPage),
                  }).map((_, index) => (
                    <span
                      key={index}
                      className={cx("dot", {
                        active: currentPage === index + 1,
                      })}
                      onClick={() => handleDotClick(index + 1)}
                    ></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WatchSection;
