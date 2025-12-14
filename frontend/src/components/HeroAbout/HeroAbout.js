import React from "react";
import styles from "./HeroAbout.module.scss";
import classNames from "classnames/bind";
import image from "~/assets/image";

const cx = classNames.bind(styles);
function HeroAbout() {
  return (
    <div className={cx("hero")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("background")}>
            <div className={cx("content")}>
              <img
                className={cx("icon-bg")}
                src={image.about_icon_background}
                alt="Icon Background"
                loading="eager"
                width="120"
                height="120"
              />
              <h1 className={cx("title")}>Kết nối con người và địa điểm</h1>
              <p className={cx("desc")}>
                Mặc dù việc khám phá thường gắn liền với địa điểm, nhưng ở tận
                cùng sâu thẳm, đó là về con người. Gần 70 năm qua, trải nghiệm
                giữa con người với con người luôn là lõi cốt trong sứ mệnh của
                chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroAbout;
