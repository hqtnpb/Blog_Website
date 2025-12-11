import classNames from "classnames/bind";
import styles from "./HotelCardList.module.scss";
import image from "~/assets/image";
const cx = classNames.bind(styles);

function HotelCardList() {
  return (
    <div className={cx("hotel-card-list")}>
      <div className={cx("hotel-card-list__inner")}>
        <div className={cx("card-left")}>
          <div className={cx("image-list")}>
            <img src={image.popular_sydney_01} alt="" className={cx("image")} />
          </div>
          <img src={image.heart_icon} alt="" className={cx("heart-icon")} />
        </div>
        <div className={cx("card-right")}>
          <div className={cx("top")}>
            <div className={cx("top-left")}>
              <div className={cx("title-wrapper")}>
                <h2 className={cx("title")}>Hotel Arts Barcelona</h2>
                <img src={image.five_star} alt="" />
              </div>
              <div className={cx("location")}>
                <img src={image.location_icon} alt="" />
                <p className={cx("location-text")}>Barcelona, Spain</p>
              </div>
            </div>
            <div className={cx("top-right")}>
              <span className={cx("rate")}>5.0</span>
              <span className={cx("review")}>200 reviews</span>
            </div>
          </div>
          <div className={cx("bottom")}>
            <div className={cx("bottom__left")}>
              <div className={cx("info")}>
                <span className={cx("info-item")}>Luxury Hotel</span> |{" "}
                <span className={cx("info-item")}>Panoramic Room</span> |{" "}
                <span className={cx("info-item")}>Swimming Pool</span>
              </div>
              <div className={cx("amenities")}>
                <span className={cx("amenities__item")}>Free Wi-Fi</span>
                <span className={cx("amenities__item")}>Breakfast</span>
                <span className={cx("amenities__item")}>Air Conditioning</span>
              </div>
            </div>
            <div className={cx("bottom__right")}>
              <span className={cx("price")}>250000</span>
              <span className={cx("info")}>5 nights, 2 adults</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelCardList;
