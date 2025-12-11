import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import styles from "./SignUp.module.scss";
import image from "~/assets/image";
import classNames from "classnames/bind";
import Button from "~/components/Button/Button";
import axios from "axios";
import { storeInSession } from "~/common/session";

const cx = classNames.bind(styles);
function SignUp() {
  const authForm = useRef();
  const navigate = useNavigate();
  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        toast.success("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/signin"), 2000); // Điều hướng sau 2 giây
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = "/auth/signup";

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
  return (
    <div className={cx("signup")}>
      <div className={cx("inner")}>
        <img
          className={cx("img")}
          src={image.background_signup}
          alt="Background"
          loading="eager"
          width="600"
          height="800"
        />
        <Toaster />
        <div className={cx("signup-box")}>
          <h2 className={cx("title")}>Đăng ký</h2>
          <div className={cx("btn")}>
            <div className={cx("group")}>
              <img
                className={cx("icon")}
                src={image.iconfacebook}
                alt="Facebook"
                loading="lazy"
                width="24"
                height="24"
              />
              <Button inactive className={cx("auth-btn")}>
                Tiếp tục với Facebook{" "}
              </Button>
            </div>
            <div className={cx("group")}>
              <img
                className={cx("icon", "gg")}
                src={image.icongoogle}
                alt="Google"
                loading="lazy"
                width="24"
                height="24"
              />
              <Button inactive className={cx("auth-btn")}>
                Ti\u1ebfp t\u1ee5c v\u1edbi Google
              </Button>
            </div>
            <div className={cx("group")}>
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
            <Button active onClick={handleSubmit} className={cx("btn")}>
              Đăng ký
            </Button>
          </form>
          <div className={cx("action")}>
            <p className={cx("link")}>Đã có tài khoản? </p>
            <Link to="/signin" className={cx("signin")}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
