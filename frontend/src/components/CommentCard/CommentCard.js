import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import styles from "./CommentCard.module.scss";
import { getDay } from "~/common/date";
import Button from "../Button";
import { useContext, useState } from "react";
import { UserContext } from "~/App";
import { Toaster, toast } from "react-hot-toast";
import CommentField from "../CommentField";
import { BlogContext } from "~/pages/BlogDetails/BlogDetails";
import axios from "axios";
const cx = classNames.bind(styles);

function CommentCard({ index, leftVal, commentData }) {
  let {
    commented_by: {
      personal_info: { username: commented_by_username, profile_img },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  let {
    blog,
    blog: {
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_parent_comments },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { accessToken, username },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);
  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint] &&
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);

        // if (commentsArr[startingPoint]) {
        //     break;
        // }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child !== _id);

        if (commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => preVal - 1);
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };
  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);

    axios
      .post(
        process.env.REACT_APP_SERVER_DOMAIN + "/comment/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;

    removeCommentsCards(index + 1);
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();

      axios
        .post(process.env.REACT_APP_SERVER_DOMAIN + "/comment/get-replies", {
          _id: commentsArr[currentIndex],
          skip,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies?.length; i++) {
            replies[i].childrenLevel =
              commentsArr[currentIndex].childrenLevel + 1;

            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }

          setBlog({
            ...blog,
            comments: { ...comments, results: commentsArr },
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const handleReply = () => {
    if (!accessToken) {
      return toast.error("You need to login to reply");
    }

    setIsReplying((preVal) => !preVal);
  };

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();

    if (commentsArr[index + 1]) {
      if (
        commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return (
            <Button
              text
              className={cx("load-more-btn")}
              onClick={() =>
                loadReplies({
                  skip: index - parentIndex,
                  currentIndex: parentIndex,
                })
              }
            >
              Load More Replies
            </Button>
          );
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return (
            <Button
              text
              className={cx("load-more-btn")}
              onClick={() =>
                loadReplies({
                  skip: index - parentIndex,
                  currentIndex: parentIndex,
                })
              }
            >
              Load More Replies
            </Button>
          );
        }
      }
    }
  };

  return (
    <>
      <div
        className={cx("comment-card")}
        style={{ paddingLeft: `${leftVal * 10}px` }}
      >
        <img
          src={profile_img}
          className={cx("user-avt")}
          alt={commented_by_username || "User"}
          loading="lazy"
          width="40"
          height="40"
        />
        <div className={cx("comment-content")}>
          <div className={cx("user-info")}>
            <h4 className={cx("user-name")}>{commented_by_username}</h4>
            <p className={cx("time")}>{getDay(commentedAt)}</p>
          </div>
          <p className={cx("comment")}>{comment}</p>
          <div className={cx("action")}>
            {commentData.isReplyLoaded ? (
              <Button text className={cx("reply-btn")} onClick={hideReplies}>
                Hide Reply
              </Button>
            ) : (
              children.length > 0 && (
                <Button text className={cx("reply-btn")} onClick={loadReplies}>
                  Show {children.length} Reply
                </Button>
              )
            )}
            <Button text className={cx("reply-btn")} onClick={handleReply}>
              Reply
            </Button>
          </div>
        </div>

        {username === commented_by_username || username === blog_author ? (
          // <FontAwesomeIcon icon={faEllipsis} />
          <Button className={cx("")} onClick={deleteComment}>
            Delete
          </Button>
        ) : (
          ""
        )}
      </div>

      {isReplying ? (
        <CommentField
          action="Reply"
          className={cx("reply-field")}
          index={index}
          replyingTo={_id}
          setIsReplying={setIsReplying}
        ></CommentField>
      ) : (
        ""
      )}
      <LoadMoreRepliesButton></LoadMoreRepliesButton>
    </>
  );
}

export default CommentCard;
