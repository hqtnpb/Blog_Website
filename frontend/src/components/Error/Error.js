import React from "react";
import { Link } from "react-router-dom";
import style from "./Error.module.scss";
import classNames from "classnames/bind";
import image from "~/assets/image";
import Button from "../Button";

const cx = classNames.bind(style);
function Error() {
  return (
    <div className={cx("error")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <img className={cx("image")} src={image.error_image}></img>
          <h1 className={cx("title")}>Page Not Found</h1>
          <p className={cx("descript")}>
            Sorry, the page you’re looking for doesn’t exist. If you think
            something is broken, report a porblem
          </p>
          <Link to="/hotels">
            <Button active className={cx("btn")}>
              Go To Home
            </Button>
          </Link>
        </div>
      </div>
      ;
    </div>
  );
}

export default Error;
