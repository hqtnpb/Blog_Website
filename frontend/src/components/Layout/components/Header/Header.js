import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBars } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { UserContext } from "~/App";
import styles from "./Header.module.scss";
import Button from "~/components/Button/Button";
import image from "~/assets/image";
import UserNavigation from "~/components/UserNavigation";
import axios from "axios";
const cx = classNames.bind(styles);

function Header() {
  const {
    userAuth,
    userAuth: { accessToken, profile_img, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (accessToken) {
      axios
        .get(
          process.env.REACT_APP_SERVER_DOMAIN +
            "/notifications/new-notification",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          // Handle error silently
        });
    }
  }, [accessToken]);

  return (
    <header className={cx("header")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <FontAwesomeIcon
            icon={faBars}
            className={cx("more-icon")}
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          />

          <div className={cx("logo")}>
            <Link to="/">
              <img
                src={image.logo}
                alt="Path Way"
                loading="eager"
                width="120"
                height="40"
              />
            </Link>
          </div>

          <nav className={cx("navbar")}>
            <ul
              className={cx("navbar__list", {
                show: isOpen,
                hide: !isOpen,
              })}
            >
              <button
                className={cx("close-button")}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <li className={cx("navbar__item")}>
                <Link to="/destination" className={cx("navbar__link")}>
                  Điểm đến
                </Link>
              </li>
              <li className={cx("navbar__item")}>
                <Link to="/about" className={cx("navbar__link")}>
                  Về chúng tôi
                </Link>
              </li>
              <li className={cx("navbar__item")}>
                <Link to="/blog" className={cx("navbar__link")}>
                  Blog du lịch
                </Link>
              </li>
              <li className={cx("navbar__item")}>
                <Link to="/contact" className={cx("navbar__link")} href="#!">
                  Liên hệ
                </Link>
              </li>
            </ul>
            <div
              className={cx("navbar__overlay", {
                show: isOpen,
                hide: !isOpen,
              })}
              onClick={() => {
                setIsOpen(false);
              }}
            ></div>
          </nav>

          {accessToken ? (
            <div className={cx("user")}>
              <Link to="/editor">
                <div className={cx("write")}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                  <p>Viết bài</p>
                </div>
              </Link>

              <Link to="/dashboard/notification">
                <button className={cx("btn")}>
                  <FontAwesomeIcon
                    icon={faBell}
                    size="lg"
                    style={{
                      color: new_notification_available ? "#FF5B26" : "black",
                    }}
                  />
                  {new_notification_available ? (
                    <span className={cx("dot")}></span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>

              <div className={cx("profile")}>
                <img
                  className={cx("user-avt")}
                  src={profile_img}
                  alt="User avatar"
                  onClick={() => setUserNavPanel(!userNavPanel)}
                />
                {userNavPanel ? <UserNavigation></UserNavigation> : ""}
              </div>
            </div>
          ) : (
            <div className={cx("action")}>
              <Button text className={cx("signin-btn")}>
                <Link to="/signin">Đăng nhập</Link>
              </Button>

              <Button active className={cx("signup-btn")}>
                <Link to="/signup">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
