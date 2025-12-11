import classNames from "classnames/bind";
import { Link } from "react-router-dom";

import { getDay } from "~/common/date";
import styles from "./TrendingBlogPost.module.scss";
import BlogCard from "../BlogCard/BlogCard";

const cx = classNames.bind(styles);

function TrendingBlogPost({ content, index, remainingTrendingBlogs }) {
  let {
    title,
    desc,
    banner,
    blog_id: id,
    author: {
      personal_info: { username, profile_img },
    },
    publishedAt,
  } = content;

  return (
    <section className={cx("trending-blog")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <Link to={`/blog/${id}`}>
            <div className={cx("top-blog")}>
              <div className={cx("content")}>
                <h2 className={cx("title")}>{title}</h2>
                <div className={cx("author")}>
                  <img
                    src={profile_img}
                    className={cx("author-avt")}
                    alt={username || "Author"}
                    loading="lazy"
                    width="50"
                    height="50"
                  />
                  <div className={cx("info")}>
                    <p className={cx("author")}>{username}</p>
                    <p className={cx("time")}>{getDay(publishedAt)}</p>
                  </div>
                </div>
                <div className={cx("desc")}>
                  <p className={cx("text")}>{desc}</p>
                  <p className={cx("more")}>Tìm hiểu thêm</p>
                </div>
              </div>
              <img src={banner} className={cx("banner")} />
            </div>
          </Link>
          <div className={cx("remaining-blog")}>
            {remainingTrendingBlogs.map((blog, index) => (
              <BlogCard key={index} blog={blog}></BlogCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrendingBlogPost;
