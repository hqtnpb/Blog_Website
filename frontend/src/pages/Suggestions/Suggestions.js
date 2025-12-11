import React from "react";
import style from "./Suggestions.module.scss";
import classNames from "classnames/bind";
import Button from "~/components/Button";
import image from "~/assets/image";

const cx = classNames.bind(style);
function Suggestions() {
  return (
    <section className={cx("suggestions")}>
      <div className={cx("inner")}>
        <h1 className={cx("title")}>Gửi yêu cầu</h1>
        <form className={cx("form")}>
          <label className={cx("title_1")}> Tên của bạn</label>
          <input className={cx("input")} type="text" name="name" />
          <label className={cx("title_1")}> Địa chỉ email của bạn</label>
          <input className={cx("input")} type="email" name="name" />
          <label className={cx("title_1")}> Số điện thoại của bạn</label>
          <input className={cx("input")} type="number" name="temp" />
          <label className={cx("title_1")}>Tôi muốn...</label>

          <select className={cx("subjectt")} name="subject">
            <option className={cx("op")} value="collaborate">
              Góp ý kiến
            </option>
            <option className={cx("op")} value="collaborate">
              Đưa ra đề xuất
            </option>
            <option className={cx("op")} value="collaborate">
              Đưa ra ý kiến
            </option>
            <option className={cx("op")} value="collaborate">
              Đưa ra chỉnh sửa
            </option>
            <option className={cx("op")} value="collaborate">
              Cung cấp thông tin
            </option>
          </select>

          <label className={cx("title_1")}>
            Phản hồi của bạn về vấn đề gì?
          </label>

          <select className={cx("subjectt")} name="subject">
            <option className={cx("op")} value="collaborate">
              Phản hồi khác
            </option>
            <option className={cx("op")} value="collaborate">
              Về địa điểm
            </option>
            <option className={cx("op")} value="collaborate">
              Về vị trí
            </option>
            <option className={cx("op")} value="collaborate">
              Về chỉnh sửa
            </option>
            <option className={cx("op")} value="collaborate">
              Về thông tin
            </option>
          </select>

          <label className={cx("title_1")}>Gửi yêu cầu của bạn tại đây</label>
          <textarea className={cx("texta")} name="message"></textarea>

          <label className={cx("title_1")}> Ad files or drop files here</label>
          <div className={cx("upload")}>
            <Button className={cx("file-upload")} name="upfile"></Button>
            <img className={cx("upload-icon")} src={image.icon_upload} />
          </div>
          <label className={cx("title_2")}>Or your can</label>

          <div className={cx("upload_input")}>
            <Button className={cx("gg")}>Upload from Google Drive</Button>
            <img className={cx("upload")} src={image.upload_img_1} />
          </div>
          <div className={cx("upload_input")}>
            <Button className={cx("gg")}>Upload from Dropbox</Button>
            <img className={cx("upload")} src={image.upload_img_2} />
          </div>
          <div className={cx("upload_input")}>
            <Button className={cx("gg")}>Upload from Microsoft Onedrive</Button>
            <img className={cx("upload")} src={image.upload_img_3} />
          </div>

          <Button active className={cx("btn")}>
            Submit Your Request
          </Button>
        </form>
      </div>
    </section>
  );
}

export default Suggestions;
