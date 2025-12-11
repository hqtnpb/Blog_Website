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
          <h1 className={cx("start")}>Hi. 👋 how can we help you?</h1>
          <p className={cx("des")}>
            Let's talk with us for various kind of topic and more about travel.
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
            <label className={cx("name")}>Your name</label>
            <input className={cx("input")} type="text" name="name" />

            <label className={cx("email")}>Your email address</label>
            <input className={cx("input")} type="email" name="email" />

            <label className={cx("sub")}>Subject</label>

            <select className={cx("subjectt")} name="subject">
              <option className={cx("op")} value="collaborate">
                I want to collaborate
              </option>
              <option className={cx("op")} value="question">
                I have a question
              </option>
            </select>

            <label className={cx("message")}>Submit your inquiry here</label>
            <textarea className={cx("texta")} name="message"></textarea>

            <Button active className={cx("btn")} type="submit">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
