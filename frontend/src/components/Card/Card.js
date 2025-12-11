import classNames from "classnames/bind";

import styles from "./Card.module.scss";
import image from "~/assets/image";
const cx = classNames.bind(styles);

function Card({
  imgSrc,
  category,
  location,
  title,
  desc,
  rating,
  discover = false,
  explore = false,
  destination = false,
  popular = false,
  searchresult = false,
  highlight = false,
  className,
  ...passProps
}) {
  const classes = cx("card-item", {
    discover,
    explore,
    destination,
    popular,
    searchresult,
    highlight,
    [className]: className,
  });
  return (
    <article className={classes} {...passProps}>
      <div className={cx("card-img")}>
        <img
          src={imgSrc}
          alt={title || "Destination"}
          className={cx("image")}
          loading="lazy"
          width="370"
          height="430"
        />
        {location && (
          <div className={cx("location")}>
            <img
              src={image.explore_location_icon}
              alt="Location"
              className={cx("icon")}
              loading="lazy"
              width="16"
              height="16"
            />
            <span className={cx("location-name")}>{location}</span>
          </div>
        )}
      </div>
      <div className={cx("content")}>
        {category && <p className={cx("category")}>{category}</p>}
        <h3 className={cx("title")}>{title}</h3>
        {desc && <p className={cx("desc")}>{desc}</p>}
        <div className={cx("rate")}>
          <img
            src={image.star}
            alt="Star rating"
            className={cx("star")}
            loading="lazy"
            width="14"
            height="14"
          />
          <span className={cx("rating")}>{rating} Ratings</span>
        </div>
      </div>
    </article>
  );
}

export default Card;
