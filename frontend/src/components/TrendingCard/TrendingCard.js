import React from "react";
import classNames from "classnames/bind";
import styles from "./TrendingCard.module.scss";
const cx = classNames.bind(styles);

function TrendingCard({ card }) {
  return (
    <div className={cx("trending-card")}>
      <div className={cx("trending-card__inner")}>
        <img
          src={card.image}
          alt={card.title || "Trending destination"}
          className={cx("trending-card__img")}
          loading="lazy"
          width="370"
          height="280"
        />
        <div className={cx("trending-card__content")}>
          <h3 className={cx("trending-card__title")}>{card.title}</h3>
          <p className={cx("trending-card__price")}>
            Từ <span style={{ color: "#FC0" }}>{card.price}/đêm</span>
          </p>
          <p className={cx("trending-card__desc")}>{card.description}</p>
        </div>
      </div>
    </div>
  );
}

export default TrendingCard;
