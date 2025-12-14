import React from "react";
import style from "./Contact.module.scss";
import image from "~/assets/image";
import classNames from "classnames/bind";
import Button from "~/components/Button";

const cx = classNames.bind(style);
function Contact() {
  return (
    <div className={cx("container")}>
      <div className={cx("inner")}>
        <div className={cx("left")}>
          <h1 className={cx("start")}>
            Xin chào. 👋 Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className={cx("des")}>
            Hãy trò chuyện với chúng tôi về mọi chủ đề liên quan đến du lịch và
            nhiều hơn thế nữa.
          </p>
          <img
            className={cx("img")}
            src={image.contact_img}
            alt="Person with phone"
            loading="lazy"
            width="500"
            height="600"
          />
        </div>

        <div className={cx("right")}>
          <form className={cx("form")}>
            <label className={cx("name")}>Họ và tên</label>
            <input
              className={cx("input")}
              type="text"
              name="name"
              placeholder="Nhập họ tên của bạn"
            />

            <label className={cx("email")}>Địa chỉ email</label>
            <input
              className={cx("input")}
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
            />

            <label className={cx("sub")}>Chủ đề</label>

            <select className={cx("subjectt")} name="subject">
              <option className={cx("op")} value="collaborate">
                Tôi muốn hợp tác
              </option>
              <option className={cx("op")} value="question">
                Tôi có câu hỏi
              </option>
            </select>

            <label className={cx("message")}>Gửi câu hỏi của bạn tại đây</label>
            <textarea
              className={cx("texta")}
              name="message"
              placeholder="Nhập nội dung tin nhắn..."
            ></textarea>

            <Button active className={cx("btn")} type="submit">
              Gửi tin nhắn
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
