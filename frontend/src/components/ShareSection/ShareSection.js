import classNames from "classnames/bind";
import styles from "./ShareSection.module.scss";
import Button from "../Button/Button";
import image from "~/assets/image";

const cx = classNames.bind(styles);
function ShareSection() {
  return (
    <section className={cx("share")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("media")}>
            <img
              src={image.share_image_01}
              alt="Travel sharing experience"
              className={cx("image")}
              loading="lazy"
              width="470"
              height="470"
            />
            <div className={cx("speech-bubble")}>
              <img
                src={image.share_image_02}
                alt="Traveler testimonial"
                className={cx("avt")}
                loading="lazy"
                width="50"
                height="50"
              />
              <div className={cx("desc")}>
                <p className={cx("quote")}>
                  “They are very amazing. I enjoyed my trip guide here!”
                </p>
                <p className={cx("name")}>PVB Zeros</p>
              </div>
            </div>
          </div>
          <div className={cx("content")}>
            <h2 className={cx("title")}>
              We sharing insider travel knowledge for 20 years
            </h2>
            <p className={cx("desc")}>
              Our travel agency group tours are aimed at travelers looking to
              discover the magic of this remarkable world. Our adventure leaders
              will help you.
            </p>
            <Button active className={cx("btn")}>
              Learn More
            </Button>
            <div className={cx("stats")}>
              <div className={cx("item")}>
                <span className={cx("number")}>1M+</span>
                <p className={cx("label")}>Satisfied Travelers</p>
              </div>
              <div className={cx("item")}>
                <span className={cx("number")}>50+</span>
                <p className={cx("label")}>Awards Win</p>
              </div>
              <div className={cx("item")}>
                <span className={cx("number")}>12+</span>
                <p className={cx("label")}>Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShareSection;
