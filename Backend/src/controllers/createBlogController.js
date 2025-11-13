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
                error: "You must provide a title ",
            });
        }

        if (!draft) {
            if (!desc.length || desc.length > 200) {
                return res.status(403).json({
                    error: "Description must be between 1 and 200 characters",
                });
            }

            if (!banner.length) {
                return res.status(403).json({
                    error: "Please upload a banner for your blog",
                });
            }

            if (!content.blocks.length) {
                return res.status(403).json({
                    error: "Please write something for your blog",
                });
            }

            if (!tags.length || tags.length > 3) {
                return res.status(403).json({
                    error: "Please provide 1 to 3 tags for your blog",
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

            blog.save()
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
                                error: "Failed to update total posts for the user",
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
