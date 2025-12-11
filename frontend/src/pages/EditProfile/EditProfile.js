import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSave,
  faUser,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import axios from "axios";
import AvatarUploadWidget from "~/components/AvatarUploadWidget";
import styles from "./EditProfile.module.scss";

const cx = classNames.bind(styles);

function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.accessToken) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_DOMAIN}/user/get-profile`,
        { username: user.username },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (!response.data) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }

      setUserData(response.data);
      setFormData({
        username: response.data.personal_info?.username || "",
        bio: response.data.personal_info?.bio || "",
        youtube: response.data.social_links?.youtube || "",
        instagram: response.data.social_links?.instagram || "",
        facebook: response.data.social_links?.facebook || "",
        twitter: response.data.social_links?.twitter || "",
        github: response.data.social_links?.github || "",
        website: response.data.social_links?.website || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.error || "Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const user = JSON.parse(sessionStorage.getItem("user"));

      const updateData = {
        username: formData.username,
        bio: formData.bio,
        social_links: {
          youtube: formData.youtube,
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
          github: formData.github,
          website: formData.website,
        },
      };

      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_DOMAIN}/user/update-profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      // Update sessionStorage with new username if changed
      if (formData.username !== user.username) {
        const updatedUser = { ...user, username: formData.username };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast.success("Cập nhật thông tin thành công!");
      await fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.error || "Không thể cập nhật thông tin"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUploadSuccess = async (imageUrl) => {
    try {
      setUploadingAvatar(true);
      const user = JSON.parse(sessionStorage.getItem("user"));

      await axios.put(
        `${process.env.REACT_APP_SERVER_DOMAIN}/user/update-avatar`,
        { profile_img: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      await fetchProfileData();

      // Update sessionStorage with new avatar
      const updatedUser = { ...user, profile_img: imageUrl };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error(
        error.response?.data?.error || "Không thể cập nhật ảnh đại diện"
      );
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className={cx("loading-container")}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={cx("edit-profile")}>
      <div className={cx("header")}>
        <h1>Chỉnh sửa thông tin cá nhân</h1>
        <p>Cập nhật ảnh đại diện và thông tin của bạn</p>
      </div>

      <div className={cx("content")}>
        {/* Profile Photo */}
        <div className={cx("profile-photo-container")}>
          <AvatarUploadWidget
            currentAvatar={userData?.personal_info?.profile_img}
            onUploadSuccess={handleAvatarUploadSuccess}
            disabled={uploadingAvatar}
          />
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSaveProfile} className={cx("form-container")}>
          <div className={cx("form-row")}>
            <div className={cx("form-group")}>
              <label className={cx("form-label")}>
                <FontAwesomeIcon icon={faUser} /> Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={cx("form-input")}
                placeholder="Nhập username"
                required
              />
            </div>

            <div className={cx("form-group")}>
              <label className={cx("form-label")}>
                <FontAwesomeIcon icon={faEnvelope} /> Email (không thể đổi)
              </label>
              <input
                type="email"
                value={userData?.personal_info?.email || ""}
                className={cx("form-input")}
                disabled
              />
            </div>
          </div>

          <div className={cx("form-group", "full-width")}>
            <label className={cx("form-label")}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className={cx("form-textarea")}
              placeholder="Giới thiệu về bạn..."
              rows={4}
            />
          </div>

          <div className={cx("social-links-section")}>
            <h3>Liên kết mạng xã hội</h3>
            <div className={cx("form-row")}>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>YouTube</label>
                <input
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  className={cx("form-input")}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className={cx("form-input")}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className={cx("form-row")}>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  className={cx("form-input")}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className={cx("form-input")}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            <div className={cx("form-row")}>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className={cx("form-input")}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={cx("form-input")}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className={cx("form-actions")}>
            <button
              type="submit"
              className={cx("save-btn")}
              disabled={saving || uploadingAvatar}
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
