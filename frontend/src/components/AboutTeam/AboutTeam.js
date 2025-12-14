import React from "react";
import styles from "./AboutTeam.module.scss";
import classNames from "classnames/bind";
import image from "~/assets/image";

const cx = classNames.bind(styles);
function AboutTeam() {
  return (
    <div className={cx("team")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <h2 className={cx("title")}>Gặp gỡ đội ngũ của chúng tôi</h2>
          <div className={cx("member-list")}>
            <div className={cx("member")}>
              <img
                className={cx("avt")}
                src={image.member_01_about}
                alt="Member01"
              />
              <h3 className={cx("name")}>David Warner</h3>
            </div>
            <div className={cx("member")}>
              <img
                className={cx("avt", "orange")}
                src={image.member_02_about}
                alt="Member02"
              />
              <h3 className={cx("name")}>Aaron Finch</h3>
            </div>
            <div className={cx("member")}>
              <img
                className={cx("avt", "blue")}
                src={image.member_03_about}
                alt="Member03"
              />
              <h3 className={cx("name")}>Steven Smith</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutTeam;
