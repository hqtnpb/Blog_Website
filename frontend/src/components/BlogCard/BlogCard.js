import classNames from "classnames/bind";
import styles from "./BlogCard.module.scss";
import { Link } from "react-router-dom";
const cx = classNames.bind(styles);

function BlogCard({ blog, index }) {
  if (!blog) return null;
  let { title, desc, banner, blog_id: id } = blog;
  return (
    <Link to={`/blog/${id}`}>
      <div className={cx("remaining-blog-card")}>
        <img
          src={banner}
          className={cx("banner")}
          alt={title || "Blog thumbnail"}
          loading="lazy"
          width="370"
          height="280"
        />
        <h3 className={cx("title")}>{title}</h3>
        <p className={cx("desc")}>{desc}</p>
        <p className={cx("more")}>Tìm hiểu thêm</p>
      </div>
    </Link>
  );
}

export default BlogCard;
