import React from "react";
import styles from "./FeaturesAbout.module.scss";
import classNames from "classnames/bind";
import image from "~/assets/image";
import Button from "../Button";

const cx = classNames.bind(styles);
function FeaturesAbout() {
  return (
    <div className={cx("feature")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("content")}>
            <div className={cx("left")}>
              <h2 className={cx("title")}>
                Hành trình của chúng tôi bắt đầu từ du lịch
              </h2>
              <img
                className={cx("icon-ft")}
                src={image.about_icon_feature}
                alt="Icon Feature"
                loading="lazy"
                width="100"
                height="100"
              />
            </div>
            <div className={cx("right")}>
              <Button text className={cx("btn-ft")}>
                Câu chuyện của chúng tôi
              </Button>
              <p className={cx("desc")}>
                Năm 1951, chúng tôi mở cửa tại Thành phố New York, với sự tập
                trung rõ ràng vào dịch vụ khách hàng khi chúng tôi cung cấp gói
                kỳ nghỉ hoàn chỉnh đầu tiên. Ngay sau đó, chúng tôi đã giúp mọi
                người khám phá thế giới với các chuyến đi quốc tế. Ngày nay, từ
                việc là một phần của một trong những công ty du lịch lớn nhất
                thế giới, cam kết của chúng tôi trong việc tạo ra kết nối, cung
                cấp dịch vụ một-đối-một và tạo ra kỳ nghỉ hoàn hảo vẫn mạnh mẽ
                hơn bao giờ hết.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesAbout;
