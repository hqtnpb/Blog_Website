import classNames from "classnames/bind";
import React from "react";
import style from "./Commingsoon.module.scss";
import image from "~/assets/image";
import Button from "~/components/Button";

const cx = classNames.bind(style);
function Commingsoon() {
  return (
    <div className={cx("commingsoon")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("content")}>
            <h1 className={cx("title")}>Comming Soon</h1>

            <p className={cx("script")}>
              Bạn đã sẵn sàng nhận những điều mới từ chúng tôi? Đăng ký nhận tin
              để cập nhật thông tin mới nhất!
            </p>
            <div className={cx("action")}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className={cx("input")}
              />

              <Button active className={cx("btn")}>
                Đăng ký
              </Button>
            </div>
            {/* <img
                            className={cx("image_1")}
                            src={image.commingsoon_image_1}
                        />
                        {
                            <img
                                className={cx("image_2")}
                                src={image.commingsoon_image_2}
                            />
                        }
                        <img
                            className={cx("image_3")}
                            src={image.commingsoon_image_3}
                        /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Commingsoon;
