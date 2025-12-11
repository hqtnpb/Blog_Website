import classNames from "classnames/bind";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "~/App";

import styles from "./UserNavigation.module.scss";
import Button from "../Button";
import { removeFromSession } from "~/common/session";
const cx = classNames.bind(styles);

function UserNavigation() {
  let navigate = useNavigate();
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);
  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ accessToken: null }); // logOutUser();
    // console.log("User signed out");

    navigate("/");
  };
  return (
    <div className={cx("user-navigation")}>
      <ul className={cx("nav-list")}>
        <li className={cx("nav-item")}>
          <Link to={`/user/${username}`}>Hồ sơ</Link>
        </li>
        <li className={cx("nav-item")}>
          <Link to="/dashboard/blogs">Bảng điều khiển</Link>
        </li>

        <li className={cx("nav-item")}>
          <Link to="/settings">Cài đặt</Link>
        </li>
        <Button text className={cx("btn")} onClick={signOutUser}>
          Đăng xuất
          <p>@{username}</p>
        </Button>
      </ul>
    </div>
  );
}

export default UserNavigation;
