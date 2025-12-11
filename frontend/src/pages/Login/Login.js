import { useState, useRef } from "react";
import styles from "./Login.module.scss";
import classNames from "classnames/bind";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useContext } from "react";

import image from "~/assets/image";
import Button from "~/components/Button/Button";
import { storeInSession } from "~/common/session";
import { UserContext } from "~/App";
import { authWithGoogle } from "~/common/firebase";

const cx = classNames.bind(styles);
function Login() {
  const authForm = useRef();
  let {
    userAuth: { accessToken },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = "/auth/signin";

    //regex
    let emailRegex =
      /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    //form data
    let form = new FormData(authForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { email, password } = formData;
    //form validation
    if (!email.length) {
      return toast.error("Vui lòng nhập email");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Email không hợp lệ");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
      );
    }
    userAuthThroughServer(serverRoute, formData);
  };
  // console.log(accessToken);

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        let serverRoute = "/auth/google-auth";

        let formData = {
          accessToken: user.accessToken,
        };

        userAuthThroughServer(serverRoute, formData);
      })
      .catch((error) => {
        toast.error(error.message);
        return console.log(error);
      });
  };
  return accessToken ? (
    <Navigate to="/" />
  ) : (
    <div className={cx("login")}>
      <div className={cx("main")}>
        <img
          className={cx("img")}
          src={image.background_login}
          alt="Sign In"
          loading="eager"
          width="600"
          height="800"
        />
        <Toaster />
        <div className={cx("box")}>
          <div className={cx("title")}>Đăng nhập</div>
          <div className={cx("btn")}>
            <div className={cx("gr-btn")}>
              <img
                className={cx("icon")}
                src={image.iconfacebook}
                alt="Facebook"
                loading="lazy"
                width="24"
                height="24"
              />
              <Button inactive className={cx("auth-btn")}>
                Tiếp tục với Facebook
              </Button>
            </div>
            <div className={cx("btn")}>
              <div className={cx("gr-btn")}>
                <img
                  className={cx("icon", "gg")}
                  src={image.icongoogle}
                  alt="Google"
                  loading="lazy"
                  width="24"
                  height="24"
                />
                <Button
                  inactive
                  className={cx("auth-btn")}
                  onClick={handleGoogleAuth}
                >
                  Tiếp tục với Google
                </Button>
              </div>
            </div>
            <div className={cx("btn")}>
              <div className={cx("gr-btn")}>
                <img
                  className={cx("icon", "ap")}
                  src={image.iconapple}
                  alt="Apple"
                  loading="lazy"
                  width="24"
                  height="24"
                />
                <Button inactive className={cx("auth-btn")}>
                  Tiếp tục với Apple
                </Button>
              </div>
            </div>
          </div>
          <div className={cx("separator")}>HOẶC</div>
          <form ref={authForm} className={cx("form")}>
            <input
              className={cx("input")}
              type="email"
              name="email"
              placeholder="Địa chỉ email"
            />
            <input
              className={cx("input")}
              type="password"
              name="password"
              placeholder="Mật khẩu"
            />
            <Button href="#!" text className={cx("forgot")}>
              Quên mật khẩu?
            </Button>
            <Button
              active
              type="submit"
              onClick={handleSubmit}
              className={cx("signin")}
            >
              Đăng nhập
            </Button>
          </form>
          <div className={cx("action")}>
            <p className={cx("creat")}>Chưa có tài khoản?</p>
            <Link to="/signup" className={cx("signup")} href="./SignUp">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
