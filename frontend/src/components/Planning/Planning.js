import Button from "../Button";
import classNames from "classnames/bind";
import styles from "./Planning.module.scss";

const cx = classNames.bind(styles);
function Planning({
  title,
  desc,
  image,
  planning,
  children,
  className,
  ...props
}) {
  const classes = cx("planning-item", {
    planning,
    [className]: className,
  });
  return (
    <section className={classes} {...props}>
      <div className={cx("content")}>
        {title && <h2 className={cx("title")}>{title}</h2>}
        <div className={cx("text")}>
          {desc && <p className={cx("desc")}>{desc}</p>}
          <Button text className={cx("btn")}>
            Tìm hiểu thêm
          </Button>
        </div>
        <img
          src={image}
          className={cx("img")}
          alt={title || "Planning"}
          loading="lazy"
          width="600"
          height="400"
        />
        {children}
      </div>
    </section>
  );
}

export default Planning;
