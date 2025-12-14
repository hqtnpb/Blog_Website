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
            <h2 className={cx("title")}>Tầm nhìn về sự đa dạng</h2>
            <p className={cx("desc")}>
              Chúng tôi cam kết cải thiện sự đa dạng và hòa nhập trong môi
              trường làm việc của mình khi chúng tôi tiếp tục tiến lên để tạo ra
              những thay đổi thực sự và lâu dài trong công ty.<br></br>
              <br></br>
              Với tư cách là nhà lãnh đạo toàn cầu trong ngành du lịch, chúng
              tôi cũng có cơ hội giúp mang lại sự thay đổi cho ngành; chúng tôi
              cam kết làm điều đó.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiversityAbout;
