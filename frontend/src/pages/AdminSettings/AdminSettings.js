import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSave,
  faKey,
  faUser,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
} from "~/common/partnerApi";
import AvatarUploadWidget from "~/components/AvatarUploadWidget";
import styles from "./AdminSettings.module.scss";

const cx = classNames.bind(styles);

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("edit-profile");
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
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUserData(data);
      setFormData({
        username: data.personal_info?.username || "",
        bio: data.personal_info?.bio || "",
        youtube: data.social_links?.youtube || "",
        instagram: data.social_links?.instagram || "",
        facebook: data.social_links?.facebook || "",
        twitter: data.social_links?.twitter || "",
        github: data.social_links?.github || "",
        website: data.social_links?.website || "",
      });
    } catch (error) {
      toast.error(error.message || "Không thể tải thông tin profile");
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUploadSuccess = async (imageUrl) => {
    try {
      setUploadingAvatar(true);
      await updateAvatar(imageUrl);
      await fetchProfileData();
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật ảnh đại diện");
      console.error(error);
      throw error; // Re-throw to let widget handle error state
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
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

      await updateProfile(updateData);
      toast.success("Cập nhật thông tin thành công!");
      await fetchProfileData();
    } catch (error) {
      toast.error(error.error || error.message || "Không thể cập nhật profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setSaving(true);
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.error || error.message || "Không thể đổi mật khẩu");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={cx("loadingContainer")}>
        <FontAwesomeIcon icon={faSpinner} spin className={cx("loadingIcon")} />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={cx("settings-content")}>
      <div className={cx("settings-card")}>
        {/* Tabs */}
        <div className={cx("tabs")}>
          <button
            className={cx("tab", {
              active: activeTab === "edit-profile",
            })}
            onClick={() => setActiveTab("edit-profile")}
          >
            Edit Profile
          </button>
          <button
            className={cx("tab", {
              active: activeTab === "preferences",
            })}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
          <button
            className={cx("tab", { active: activeTab === "security" })}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "edit-profile" && (
          <div className={cx("tab-content")}>
            <div className={cx("profile-section")}>
              {/* Profile Photo */}
              <div className={cx("profile-photo-container")}>
                <AvatarUploadWidget
                  currentAvatar={userData?.personal_info?.profile_img}
                  onUploadSuccess={handleAvatarUploadSuccess}
                  disabled={uploadingAvatar}
                />
              </div>

              {/* Form Fields */}
              <div className={cx("form-container")}>
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
                    />
                  </div>

                  <div className={cx("form-group")}>
                    <label className={cx("form-label")}>
                      <FontAwesomeIcon icon={faEnvelope} /> Email (không thể
                      đổi)
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

                <h3 className={cx("section-title")}>Social Links</h3>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label className={cx("form-label")}>YouTube</label>
                    <input
                      type="url"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      className={cx("form-input")}
                      placeholder="https://youtube.com/@username"
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
                      placeholder="https://instagram.com/username"
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
                      placeholder="https://facebook.com/username"
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
                      placeholder="https://twitter.com/username"
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
                      placeholder="https://github.com/username"
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
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className={cx("form-actions")}>
                  <button
                    className={cx("save-btn")}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        <span>Lưu Thay Đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className={cx("tab-content")}>
            <p className={cx("placeholder-text")}>
              Preferences settings coming soon...
            </p>
          </div>
        )}

        {activeTab === "security" && (
          <div className={cx("tab-content")}>
            <div className={cx("security-section")}>
              <h3 className={cx("section-title")}>
                <FontAwesomeIcon icon={faKey} /> Đổi Mật Khẩu
              </h3>

              {userData?.google_auth ? (
                <div className={cx("info-message")}>
                  <p>Bạn đã đăng nhập bằng Google. Không thể đổi mật khẩu.</p>
                </div>
              ) : (
                <div className={cx("password-form")}>
                  <div className={cx("form-group", "full-width")}>
                    <label className={cx("form-label")}>
                      <FontAwesomeIcon icon={faLock} /> Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={cx("form-input")}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>

                  <div className={cx("form-group", "full-width")}>
                    <label className={cx("form-label")}>
                      <FontAwesomeIcon icon={faLock} /> Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={cx("form-input")}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    />
                  </div>

                  <div className={cx("form-group", "full-width")}>
                    <label className={cx("form-label")}>
                      <FontAwesomeIcon icon={faLock} /> Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={cx("form-input")}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <div className={cx("form-actions")}>
                    <button
                      className={cx("save-btn")}
                      onClick={handleChangePassword}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faKey} />
                          <span>Đổi Mật Khẩu</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;
