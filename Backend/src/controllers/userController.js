const User = require("../models/User");
const bcrypt = require("bcrypt");

const userController = {
  getProfile: (req, res) => {
    let { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Tên người dùng là bắt buộc" });
    }

    User.findOne({ "personal_info.username": username })
      .select("-personal_info.password -google_auth -updatedAt -blogs")
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
        return res.status(200).json(user);
      })
      .catch((error) => {
        return res.status(500).json({ error: error.message });
      });
  },

  becomePartner: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "ID người dùng là bắt buộc" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { "personal_info.role": "partner" },
        { new: true, runValidators: true }
      ).select("-personal_info.password -google_auth -updatedAt -blogs");

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      return res
        .status(200)
        .json({
          message: "Đã cập nhật vai trò người dùng thành đối tác thành công",
          user,
        });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { username, bio, social_links } = req.body;

      const updateData = {};

      if (username !== undefined) {
        // Check if username is already taken
        const existingUser = await User.findOne({
          "personal_info.username": username,
          _id: { $ne: userId },
        });

        if (existingUser) {
          return res.status(400).json({ error: "Username đã được sử dụng" });
        }

        updateData["personal_info.username"] = username;
      }

      if (bio !== undefined) {
        updateData["personal_info.bio"] = bio;
      }

      if (social_links) {
        if (social_links.youtube !== undefined) {
          updateData["social_links.youtube"] = social_links.youtube;
        }
        if (social_links.instagram !== undefined) {
          updateData["social_links.instagram"] = social_links.instagram;
        }
        if (social_links.facebook !== undefined) {
          updateData["social_links.facebook"] = social_links.facebook;
        }
        if (social_links.twitter !== undefined) {
          updateData["social_links.twitter"] = social_links.twitter;
        }
        if (social_links.github !== undefined) {
          updateData["social_links.github"] = social_links.github;
        }
        if (social_links.website !== undefined) {
          updateData["social_links.website"] = social_links.website;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select("-personal_info.password -google_auth -blogs");

      if (!updatedUser) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Đã cập nhật hồ sơ thành công",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAvatar: async (req, res) => {
    try {
      const userId = req.user.id;
      const { profile_img } = req.body;

      if (!profile_img) {
        return res.status(400).json({ error: "URL ảnh đại diện là bắt buộc" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { "personal_info.profile_img": profile_img } },
        { new: true }
      ).select("-personal_info.password -google_auth -blogs");

      if (!updatedUser) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Đã cập nhật ảnh đại diện thành công",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      if (user.google_auth) {
        return res.status(403).json({
          error:
            "Không thể thay đổi mật khẩu cho tài khoản đăng nhập bằng Google",
        });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.personal_info.password
      );

      if (!validPassword) {
        return res.status(400).json({ error: "Mật khẩu hiện tại không đúng" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.personal_info.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Đã thay đổi mật khẩu thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
