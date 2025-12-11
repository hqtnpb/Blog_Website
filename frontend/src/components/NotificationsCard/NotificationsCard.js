import classNames from "classnames/bind";
import styles from "./NotificationsCard.module.scss";
import { Link } from "react-router-dom";
import { getDay } from "~/common/date";
const cx = classNames.bind(styles);
function NotificationsCard({ data, index, notificationState }) {
  let {
    seen,
    type,
    replied_on_comment,
    comment,
    createdAt,
    user: {
      personal_info: { username, profile_img },
    },
    blog: { blog_id, title },
  } = data;
  console.log(data);

  return (
    <div className={cx("notification-card")}>
      <Link to={`/user/${username}`} className={cx("user-info")}>
        <img
          src={profile_img}
          className={cx("user-avt")}
          alt={username || "User"}
          loading="lazy"
          width="40"
          height="40"
        />
        <p className={cx("title")}>{`@${username}`}</p>
      </Link>
      <Link to={`/blog/${blog_id}`}>
        <div className={cx("content")}>
          <span className={cx("text")}>
            {" "}
            {type === "like"
              ? "like your blog"
              : type === "comment"
              ? "commented on "
              : "replied on"}
          </span>
          {type === "reply" ? (
            <div>
              <p className={cx("text")}>{`${replied_on_comment.comment} :`}</p>
            </div>
          ) : (
            <p className={cx("text")}>{title}</p>
          )}
          {type !== "like" ? <p>{`"${comment.comment}"`}</p> : ""}
          <p className={cx("time")}>{`- ${getDay(createdAt)}`}</p>
        </div>
      </Link>
    </div>
  );
}

export default NotificationsCard;
