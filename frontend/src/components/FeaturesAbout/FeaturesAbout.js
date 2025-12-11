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
              <h2 className={cx("title")}>Our journey begins with travel</h2>
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
                Our Story
              </Button>
              <p className={cx("desc")}>
                In 1951 we opened our doors in New York City, with a clear focus
                on customer service as we offered the very first complete
                vacation package. Soon after, we were helping Americans discover
                the world with international trips. Today, from being a part of
                one of the world’s largest travel companies, Flight Centre
                Travel Group to supporting small travel businesses with
                Independent by Liberty Travel, our commitment to creating
                connections, providing one-on-one service, and crafting the
                perfect vacation remains stronger than ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesAbout;
