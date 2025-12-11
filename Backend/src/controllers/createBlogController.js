const { nanoid } = require("nanoid");
const Blog = require("../models/Blog");
const User = require("../models/User");
const { auth } = require("firebase-admin");

const createBlog = {
  createBlog: (req, res) => {
    let authorId = req.user.id;

    let { title, desc, banner, tags, content, draft, id } = req.body;

    if (!title.length) {
      return res.status(403).json({
        error: "Bạn phải cung cấp tiêu đề",
      });
    }

    if (!draft) {
      if (!desc.length || desc.length > 200) {
        return res.status(403).json({
          error: "Mô tả phải từ 1 đến 200 ký tự",
        });
      }

      if (!banner.length) {
        return res.status(403).json({
          error: "Vui lòng tải lên banner cho blog của bạn",
        });
      }

      if (!content.blocks.length) {
        return res.status(403).json({
          error: "Vui lòng viết nội dung cho blog của bạn",
        });
      }

      if (!tags.length || tags.length > 3) {
        return res.status(403).json({
          error: "Vui lòng cung cấp 1 đến 3 thẻ cho blog của bạn",
        });
      }
    }

    tags = tags.map((tag) => tag.toLowerCase());

    let blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    if (id) {
      Blog.findOneAndUpdate(
        { blog_id },
        {
          title,
          desc,
          banner,
          tags,
          content,
          draft: draft ? draft : false,
        }
      )
        .then(() => {
          return res.status(200).json({ id: blog_id });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    } else {
      let blog = new Blog({
        title,
        desc,
        banner,
        tags,
        content,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
      });

      blog
        .save()
        .then((blog) => {
          let incrementValue = draft ? 0 : 1;

          User.findOneAndUpdate(
            { _id: authorId },
            {
              $inc: {
                "account_info.total_posts": incrementValue,
              },
              $push: { blogs: blog._id },
            }
          )
            .then((user) => {
              return res.status(200).json({ id: blog._id });
            })
            .catch((err) => {
              return res.status(500).json({
                error: "Không thể cập nhật tổng số bài viết cho người dùng",
              });
            });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  },
};

module.exports = createBlog;
