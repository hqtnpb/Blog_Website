import classNames from "classnames/bind";
import styles from "./ManagePublishedBlogCard.module.scss";
import { Link } from "react-router-dom";
import { getDay } from "~/common/date";
import Button from "../Button";
import { de } from "date-fns/locale";
import { useContext } from "react";
import { UserContext } from "~/App";
import axios from "axios";
const cx = classNames.bind(styles);

const BlogStats = ({ stats }) => {
  return (
    <div className={cx("blog-stats")}>
      {Object.keys(stats).map((key, index) => {
        return !key.includes("parent") ? (
          <div key={index} className={cx("stat")}>
            <p className={cx("stat-value")}>{stats[key]}</p>
            <p className={cx("stat-name")}>{key.split("_")[1]}</p>
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

const deleteBlog = (blog, accessToken, target) => {
  let { index, blog_id, setStateFunc } = blog;

  target.setAttribute("disabled", true);

  axios
    .post(
      process.env.REACT_APP_SERVER_DOMAIN + "/render/delete-blog",
      { blog_id },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    .then(({ data }) => {
      target.removeAttribute("disabled");

      setStateFunc((prev) => {
        let { deletedDocCount, totalDocs, results } = prev;

        results.splice(index, 1);

        if (!results.length && totalDocs - 1 > 0) {
          return null;
        }

        return {
          ...prev,

          totalDocs: totalDocs - 1,
          deletedDocCount: deletedDocCount + 1,
        };
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

function ManagePublishedBlogCard({ blog }) {
  let { banner, blog_id, title, publishedAt, activity } = blog;
  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  return (
    <div className={cx("blog-card")}>
      <Link to={`/blog/${blog_id}`}>
        <img
          src={banner}
          className={cx("banner")}
          alt={title || "Blog banner"}
          loading="lazy"
          width="300"
          height="200"
        />
      </Link>
      <div className={cx("blog-card-content")}>
        <Link to={`/blog/${blog_id}`}>
          <h2 className={cx("title")}>{title}</h2>
          <p className={cx("time")}>Published on {getDay(publishedAt)}</p>
        </Link>
        <div className={cx("action")}>
          <Link to={`/editor/${blog_id}`}>
            <Button active className={cx("btn")}>
              Edit
            </Button>
          </Link>

          <Button
            active
            className={cx("btn")}
            onClick={(e) => deleteBlog(blog, accessToken, e.target)}
          >
            Delete
          </Button>
        </div>
      </div>
      <BlogStats stats={activity}></BlogStats>
    </div>
  );
}

export default ManagePublishedBlogCard;
