import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./UserCard.module.scss";
const cx = classNames.bind(styles);

function UserCard({ user }) {
  let {
    personal_info: { username, profile_img },
  } = user;
  return (
    <Link to={`/user/${username}`}>
      <div className={cx("user")}>
        <img
          src={profile_img}
          className={cx("profile-img")}
          alt={username || "User"}
          loading="lazy"
          width="50"
          height="50"
        />
        <p className={cx("name")}>@{username}</p>
      </div>
    </Link>
  );
}

export default UserCard;
