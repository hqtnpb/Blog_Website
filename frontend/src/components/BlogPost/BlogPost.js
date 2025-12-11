import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import { getDay } from "~/common/date";
import styles from "./BlogPost.module.scss";
const cx = classNames.bind(styles);

function LatestBlogPostCard({ content, author }) {
  let {
    publishedAt,
    tags,
    title,
    desc,
    banner,
    activity: { total_likes },
    blog_id: id,
  } = content;
  let { username, profile_img } = author;
  // console.log(author);

  return (
    <Link to={`/blog/${id}`}>
      <section className={cx("latest-blog")}>
        <div className={cx("container")}>
          <div className={cx("inner")}>
            <div className={cx("heading")}>
              <h3 className={cx("title")}>{title}</h3>
              <div className={cx("content")}>
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
              <div className={cx("activity")}>
                <div className={cx("likes")}>
                  <FontAwesomeIcon icon={faHeart} />
                  <p className={cx("number")}>{total_likes}</p>
                </div>
              </div>
            </div>
            <div className={cx("desc")}>
              <p className={cx("text")}>{desc}</p>
              <p className={cx("more")}>Tìm hiểu thêm</p>
              <span className={cx("tags")}>#{tags[0]}</span>
            </div>
            <img
              src={banner}
              className={cx("banner")}
              alt={title || "Blog banner"}
              loading="lazy"
              width="600"
              height="400"
            />
          </div>
        </div>
      </section>
    </Link>
  );
}

export default LatestBlogPostCard;
