import classNames from "classnames/bind";
import styles from "./SideNav.module.scss";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { UserContext } from "~/App";
import { useContext, useState } from "react";
const cx = classNames.bind(styles);

function SideNav() {
  let {
    userAuth: { accessToken, new_notification_available },
  } = useContext(UserContext);

  let [page, setPage] = useState();

  return accessToken === null ? (
    <Navigate to="/signin" />
  ) : (
    <>
      <section className={cx("sidenav")}>
        <div className={cx("sidenav-list")}>
          <div className={cx("sidenav-list-item")}>
            <h3 className={cx("title")}>Dash Board</h3>
            <NavLink
              to="/dashboard/blogs"
              onClick={(e) => setPage(e.target.innerText)}
              className={cx("item")}
            >
              Blogs
            </NavLink>

            <NavLink
              to="/dashboard/bookings"
              onClick={(e) => setPage(e.target.innerText)}
              className={cx("item")}
            >
              Đặt phòng của tôi
            </NavLink>

            <NavLink
              to="/dashboard/notification"
              onClick={(e) => setPage(e.target.innerText)}
              className={cx("item")}
            >
              {new_notification_available ? (
                <span className={cx("dot")}></span>
              ) : (
                ""
              )}
              Thông báo
            </NavLink>

            <NavLink
              to="/editor"
              onClick={(e) => setPage(e.target.innerText)}
              className={cx("item")}
            >
              Write
            </NavLink>
          </div>

          <div className={cx("sidenav-list-item")}>
            <h3 className={cx("title")}>Cài đặt</h3>
            <NavLink
              to="/settings/edit-profile"
              onClick={(e) => setPage(e.target.innerText)}
              className={cx("item")}
            >
              Chỉnh sửa hồ sơ
            </NavLink>

            <NavLink
              to="/settings/change-password"
              onClick={(e) => setPage(e.target.innerText)}
              className={cx("item")}
            >
              Change Password
            </NavLink>
          </div>
        </div>
        <Outlet />
      </section>
    </>
  );
}

export default SideNav;
