const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const Notification = require("../models/Notification");
const {
  sendNotificationToUser,
  NotificationTypes,
  createNotification,
} = require("../utils/notificationHelper");

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        )
          .then((data) => {
            console.log("deleted from parent comment");
          })
          .catch((error) => {
            console.log(error.message);
          });
      }

      Notification.findOneAndDelete({ comment: _id }).then((notification) => {
        console.log("notification deleted");
      });

      Notification.findOneAndDelete({ reply: _id }).then((notification) => {
        console.log("reply deleted");
      });

      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: { "activity.total_comments": -1 },
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            deleteComments(replies);
          });
        }
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

const commentController = {
  addComment: async (req, res) => {
    let user_id = req.user.id;

    let { _id, comment, blog_author, replying_to } = req.body;

    if (!comment.length) {
      return res.status(403).json({ message: "Bình luận không được để trống" });
    }

    let commentObj = {
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id,
    };
    if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
    }
    new Comment(commentObj).save().then(async (commentFile) => {
      let { comment, commentedAt, children } = commentFile;

      Blog.findOneAndUpdate(
        { _id },
        {
          $push: { comments: commentFile._id },
          $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1,
          },
        }
      ).then((blog) => {
        console.log("new comment added");
      });

      let notificationObj = {
        type: replying_to ? "reply" : "comment",
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
      };
      if (replying_to) {
        notificationObj.replied_on_comment = replying_to;

        await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: commentFile._id } }
        )
          .then((replyingToCommentDoc) => {
            notificationObj.notification_for =
              replyingToCommentDoc.commented_by;
          })
          .catch((error) => {
            console.log(error.message);
          });
      }

      new Notification(notificationObj).save().then((notification) => {
        console.log("notification added");
      });

      // Send real-time notification
      try {
        const notifData = createNotification(
          replying_to
            ? NotificationTypes.BLOG_COMMENT
            : NotificationTypes.BLOG_COMMENT,
          replying_to ? "Phản hồi mới" : "Bình luận mới",
          replying_to
            ? `Có người đã trả lời bình luận của bạn`
            : `Có người đã bình luận trên blog của bạn`,
          {
            blogId: _id,
            commentId: commentFile._id,
            comment: comment.substring(0, 100),
          }
        );
        sendNotificationToUser(notificationObj.notification_for, notifData);
      } catch (notifError) {
        console.error("❌ Failed to send real-time notification:", notifError);
      }

      return res.status(200).json({
        comment,
        commentedAt,
        _id: commentFile._id,
        user_id,
        children,
      });
    });
  },

  getBlogComments: (req, res) => {
    let { blog_id, skip } = req.body;
    let maxLimit = 5;
    Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 })
      .then((comment) => {
        return res.status(200).json(comment);
      })
      .catch((error) => {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
      });
  },

  getReplies: (req, res) => {
    let { _id, skip } = req.body;

    let maxLimit = 5;

    Comment.findOne({ _id })
      .populate({
        path: "children",
        options: {
          skip: skip,
          limit: maxLimit,
          sort: { commentedAt: -1 },
        },
        populate: {
          path: "commented_by",
          select: "personal_info.username personal_info.profile_img",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children")
      .then((doc) => {
        return res.status(200).json({ replies: doc.children });
      })
      .catch((error) => {
        return res.status(500).json({ error: error.message });
      });
  },

  deleteComment: (req, res) => {
    let user_id = req.user.id;

    let { _id } = req.body;

    Comment.findOne({ _id }).then((comment) => {
      if (user_id == comment.commented_by || user_id == comment.blog_author) {
        console.log(comment.commented_by);

        deleteComments(_id);
        return res.status(200).json({
          message: "Đã xóa bình luận thành công",
        });
      } else {
        return res.status(403).json({
          message: "Bạn không có quyền xóa bình luận này",
        });
      }
    });
  },
};
module.exports = commentController;
