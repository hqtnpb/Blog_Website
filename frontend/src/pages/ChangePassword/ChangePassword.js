import classNames from "classnames/bind";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSave,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import axios from "axios";
import styles from "./ChangePassword.module.scss";

const cx = classNames.bind(styles);

function ChangePassword() {
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return false;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return false;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return false;
    }

    return true;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      setSaving(true);
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (!user || !user.accessToken) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_SERVER_DOMAIN}/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.error || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cx("change-password")}>
      <div className={cx("header")}>
        <h1>Đổi mật khẩu</h1>
        <p>Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
      </div>

      <div className={cx("content")}>
        <form onSubmit={handleChangePassword} className={cx("form-container")}>
          <div className={cx("form-group")}>
            <label className={cx("form-label")}>
              <FontAwesomeIcon icon={faLock} /> Mật khẩu hiện tại
            </label>
            <div className={cx("password-input-wrapper")}>
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                className={cx("form-input")}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
              <button
                type="button"
                className={cx("toggle-password")}
                onClick={() => togglePasswordVisibility("current")}
              >
                <FontAwesomeIcon
                  icon={showPasswords.current ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          <div className={cx("form-group")}>
            <label className={cx("form-label")}>
              <FontAwesomeIcon icon={faLock} /> Mật khẩu mới
            </label>
            <div className={cx("password-input-wrapper")}>
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className={cx("form-input")}
                placeholder="Nhập mật khẩu mới"
                required
              />
              <button
                type="button"
                className={cx("toggle-password")}
                onClick={() => togglePasswordVisibility("new")}
              >
                <FontAwesomeIcon
                  icon={showPasswords.new ? faEyeSlash : faEye}
                />
              </button>
            </div>
            <small className={cx("help-text")}>
              Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc
              biệt
            </small>
          </div>

          <div className={cx("form-group")}>
            <label className={cx("form-label")}>
              <FontAwesomeIcon icon={faLock} /> Xác nhận mật khẩu mới
            </label>
            <div className={cx("password-input-wrapper")}>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                className={cx("form-input")}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                className={cx("toggle-password")}
                onClick={() => togglePasswordVisibility("confirm")}
              >
                <FontAwesomeIcon
                  icon={showPasswords.confirm ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          <div className={cx("form-actions")}>
            <button type="submit" className={cx("save-btn")} disabled={saving}>
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Đổi mật khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className={cx("security-tips")}>
          <h3>💡 Lưu ý bảo mật</h3>
          <ul>
            <li>Sử dụng mật khẩu mạnh và duy nhất cho tài khoản này</li>
            <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
            <li>Thay đổi mật khẩu định kỳ để bảo mật tài khoản</li>
            <li>
              Không sử dụng lại mật khẩu cũ hoặc mật khẩu đã dùng ở nơi khác
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
