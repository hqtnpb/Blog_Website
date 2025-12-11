import classNames from "classnames/bind";
import { data, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./BlogInteraction.module.scss";
import { useContext, useEffect } from "react";
import { BlogContext } from "~/pages/BlogDetails/BlogDetails";
import { Toaster, toast } from "react-hot-toast";
import {
  faFacebook,
  faGithub,
  faYoutube,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import Button from "../Button";
import { UserContext } from "~/App";
import axios from "axios";
const cx = classNames.bind(styles);
const socialIcons = {
  facebook: faFacebook,
  instagram: faInstagram,
  github: faGithub,
  youtube: faYoutube,
};

function BlogInteraction() {
  let {
    blog,
    blog: {
      _id,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
        social_links,
      },
    },
    setBlog,
    isLikeByUser,
    setIsLikeByUser,
    setCommentsWrapper,
  } = useContext(BlogContext);

  let {
    userAuth: { username, accessToken },
  } = useContext(UserContext);

  useEffect(() => {
    if (accessToken) {
      //make request to check if user has liked the blog

      axios
        .post(
          process.env.REACT_APP_SERVER_DOMAIN + "/render/liked-by-user",
          { _id },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setIsLikeByUser(Boolean(result));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [_id]);
  const handleLike = () => {
    if (accessToken) {
      //like blog
      setIsLikeByUser((perVal) => !perVal);

      isLikeByUser ? total_likes-- : total_likes++;
      setBlog({ ...blog, activity: { ...activity, total_likes } });

      axios
        .post(
          process.env.REACT_APP_SERVER_DOMAIN + "/render/like-blog",
          { _id, isLikeByUser },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then(({ data }) => {
          // console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      //not login
      toast.error("Please login to like the blog");
    }
  };

  return (
    <div className={cx("blog-interaction")}>
      <Toaster />
      <div className={cx("total")}>
        <span className={cx("total-likes")}>{total_likes}</span>
        <FontAwesomeIcon
          icon={faHeart}
          className={cx("icon", { liked: isLikeByUser })}
          onClick={handleLike}
        />
        <span className={cx("total-comments")}>{total_comments}</span>
        <FontAwesomeIcon
          icon={faComment}
          className={cx("icon")}
          onClick={() => setCommentsWrapper((perVal) => !perVal)}
        />
        {username === author_username ? (
          <Link to={`/editor/${blog_id}`}>
            <Button text>Chỉnh sửa bài viết</Button>
          </Link>
        ) : (
          ""
        )}
      </div>

      <div className={cx("social")}>
        <div className={cx("social-link")}>
          {Object.keys(social_links).map((social) => {
            let link = social_links[social];
            let icon = socialIcons[social.toLowerCase()];
            return link ? (
              <Link to={link} key={social} target="_blank">
                {icon ? (
                  <Button inactive className={cx("social-icon")}>
                    <FontAwesomeIcon icon={icon} className={cx("icon")} />
                  </Button>
                ) : (
                  social
                )}
              </Link>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

export default BlogInteraction;
