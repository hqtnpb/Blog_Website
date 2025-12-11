import classNames from "classnames/bind";
import styles from "./BlogDetails.module.scss";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, createContext } from "react";

import axios from "axios";
import { getDay } from "~/common/date";
import BlogInteraction from "~/components/BlogInteraction";
import BlogCard from "~/components/BlogCard/BlogCard";
import BlogContent from "~/components/BlogContent/BlogContent";
import CommentContainer from "~/components/CommentContainer";
import { fetchComments } from "~/components/CommentContainer/CommentContainer";
const cx = classNames.bind(styles);

export const blogStructure = {
  title: "",
  desc: "",
  content: [],
  banner: "",
  activity: { total_likes: 0, total_reads: 0 },
  author: { personal_info: {}, social_links: [] },
  publishedAt: "",
  comments: { results: [] },
};
export const BlogContext = createContext({});

function BlogDetails() {
  let { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);

  const [relatedBlogs, setRelatedBlogs] = useState(null);

  const [isLikeByUser, setIsLikeByUser] = useState(false);

  const [commentsWrapper, setCommentsWrapper] = useState(true);

  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  let {
    title,
    content,
    banner,
    author: {
      personal_info: { username: author_username, profile_img },
      social_links,
    },
    publishedAt,
  } = blog;
  const fetchBlogDetails = () => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/get-blog-details", {
        blog_id,
      })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentCountFunc: setTotalParentCommentsLoaded,
        });

        setBlog(blog);

        axios
          .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/search-blogs", {
            tag: blog.tags[0],
            limit: 4,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            setRelatedBlogs(data.blogs);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const resetStates = () => {
    setBlog(blogStructure);
    setRelatedBlogs(null);
    setIsLikeByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  useEffect(() => {
    resetStates();
    fetchBlogDetails();
  }, [blog_id]);

  return (
    <BlogContext.Provider
      value={{
        blog,
        setBlog,
        isLikeByUser,
        setIsLikeByUser,
        commentsWrapper,
        setCommentsWrapper,
        totalParentCommentsLoaded,
        setTotalParentCommentsLoaded,
      }}
    >
      <section className={cx("blog-details")}>
        <div className={cx("container")}>
          <div className={cx("inner")}>
            <img
              src={banner}
              className={cx("banner")}
              alt={title || "Blog banner"}
              loading="eager"
              width="1200"
              height="600"
            />
            <h1 className={cx("title")}>{title}</h1>
            <Link to={`/user/${author_username}`}>
              <div className={cx("author")}>
                <img
                  src={profile_img}
                  className={cx("user-avt")}
                  alt={author_username || "Author"}
                  loading="lazy"
                  width="50"
                  height="50"
                ></img>
                <div className={cx("info")}>
                  <p className={cx("name")}>@{author_username}</p>
                  <p className={cx("date")}>{getDay(publishedAt)} |</p>
                </div>
              </div>
            </Link>

            <BlogInteraction></BlogInteraction>

            <CommentContainer></CommentContainer>
            <div className={cx("content")}>
              {content && content[0] && content[0].blocks ? (
                content[0].blocks.map((block, index) => {
                  return <BlogContent key={index} block={block}></BlogContent>;
                })
              ) : (
                <p>Đang tải nội dung...</p>
              )}
            </div>

            {relatedBlogs !== null && relatedBlogs.length > 0 ? (
              <div className={cx("related-blogs")}>
                <div className={cx("header")}>
                  <h2 className={cx("title")}>Đọc bài viết tương tự</h2>
                </div>
                <div className={cx("blog-card-list")}>
                  {relatedBlogs.map((blog, index) => {
                    return <BlogCard key={index} blog={blog}></BlogCard>;
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </BlogContext.Provider>
  );
}

export default BlogDetails;
