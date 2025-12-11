import React from "react";
import styles from "./DiversityAbout.module.scss";
import classNames from "classnames/bind";
import image from "~/assets/image";

const cx = classNames.bind(styles);
function DiversityAbout() {
  return (
    <div className={cx("diversity")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("media")}>
            <img
              className={cx("img")}
              src={image.media_diversity}
              alt="Media"
              loading="lazy"
              width="600"
              height="400"
            />
            <img
              className={cx("icon")}
              src={image.icon_diversity}
              alt="Icon"
              loading="lazy"
              width="80"
              height="80"
            />
          </div>
          <div className={cx("content")}>
            <h2 className={cx("title")}>Diversity Vision Statement</h2>
            <p className={cx("desc")}>
              Pathway is committed to improving diversity and inclusion within
              our workplace as we forge our path forward to create real, lasting
              change within our company.<br></br>
              <br></br>
              As a global leader in the travel industry, we also have the
              opportunity to help bring about change to the sector; we are
              committed to doing just that.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiversityAbout;
