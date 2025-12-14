import React from "react";
import styles from "./MissionAbout.module.scss";
import classNames from "classnames/bind";
import image from "~/assets/image";
import Trip from "../Trip";

const cardMission = [
  {
    icon: image.icon_guidance_about,
    title: "Hướng dẫn chuyến đi",
    desc: "Khám phá những trải nghiệm độc đáo và trọn vẹn nhất mà điểm đến tiếp theo của bạn có thể mang lại. Cung cấp những điều tốt nhất.",
    arrow: image.icon_arrow_about,
  },

  {
    icon: image.icon_value_about,
    title: "Giá trị chuyến đi",
    desc: "Mẹo và xu hướng du lịch giúp bạn chọn thời gian hoàn hảo để ghé thăm điểm đến này. Cung cấp những mẹo hay nhất cho bạn.",
    arrow: image.icon_arrow_about,
  },

  {
    icon: image.icon_peace_about,
    title: "Sự an tâm",
    desc: "Những nguyên tắc vàng cần nhớ khi du lịch đến điểm đến này. Cung cấp những mẹo và thủ thuật tốt nhất.",
    arrow: image.icon_arrow_about,
  },
];
const cx = classNames.bind(styles);
function MissionAbout() {
  return (
    <div className={cx("mission")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("content")}>
            <div className={cx("text")}>
              <h2 className={cx("title")}>
                Sứ mệnh của chúng tôi là mang đến điều tốt nhất
              </h2>
              <p className={cx("desc")}>
                Trong 70 năm qua, trải nghiệm giữa con người với con người đã và
                luôn là lõi cốt trong sứ mệnh của chúng tôi.
              </p>
            </div>
            <div className={cx("card-list")}>
              {cardMission.map((data, index) => (
                <Trip
                  key={index}
                  icon={data.icon}
                  title={data.title}
                  desc={data.desc}
                  arrow={data.arrow}
                  mission
                ></Trip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionAbout;
