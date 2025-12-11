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
              <h1 className={cx("title")}>Connecting People & Places</h1>
              <p className={cx("desc")}>
                Though exploration is often associated with places, at its very
                heart, it’s about the people. For nearly 70 years, the
                person-to-person experience has been at the very core of Liberty
                Travel’s mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroAbout;
