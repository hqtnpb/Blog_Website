import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Blog.module.scss";
import Button from "~/components/Button";
import image from "~/assets/image";
import axios from "axios";
import LatestBlogPostCard from "~/components/BlogPost";
import TrendingBlogPost from "~/components/TrendingBlogPost";
import NoDataMessage from "~/components/NoData";
import BlogCard from "~/components/BlogCard/BlogCard";
import Pagination from "~/components/Pagination/Pagination";
import { filterPaginationData } from "~/common/filter-pagination-data";
import LoadMoreButton from "~/components/LoadMoreButton";
const cx = classNames.bind(styles);

function Blog() {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [remainingTrendingBlogs, setRemainingTrendingBlogs] = useState([]);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [pageState, setPageState] = useState("all articles");
  const categories = [
    "All Articles",
    "Food & Drink",
    "Inspiration",
    "Local Guides",
    "Travel Tips",
  ];

  let navigate = useNavigate();
  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/latest-blog", {
        page,
      })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/render/all-latest-blogs-count",
        });

        setBlogs(formattedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(process.env.REACT_APP_SERVER_DOMAIN + "/render/trending-blog")
      .then(({ data }) => {
        if (data.blogs.length > 0) {
          const sortedBlogs = [...data.blogs].sort(
            (a, b) => b.activity.total_likes - a.activity.total_likes
          );
          const mostLikedBlog = sortedBlogs[0];
          const otherTopBlogs = sortedBlogs.slice(1, 5); // Lấy các bài tiếp theo

          setTrendingBlogs([mostLikedBlog]);
          setRemainingTrendingBlogs(otherTopBlogs); // Lưu các bài nhiều like tiếp theo
        } else {
          setTrendingBlogs([]);
          setRemainingTrendingBlogs([]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState === category) {
      setPageState("all articles");
      return;
    }
    setPageState(category);
  };

  const fetchBlogByCategory = ({ page = 1 }) => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/render/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        setBlogs(formattedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (pageState === "all articles") {
      fetchLatestBlogs({ page: 1 });
      fetchTrendingBlogs();
    } else {
      fetchBlogByCategory({ page: 1 });
      setTrendingBlogs(null);
    }
  }, [pageState]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(2);
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts =
    blogs && blogs.results.slice(firstPostIndex, lastPostIndex);

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode === 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <div className={cx("blog-page")}>
      <section className={cx("blog-hero")}>
        <div className={cx("container")}>
          <div className={cx("inner")}>
            <img
              src={image.hero_decor_image}
              alt="Blog hero image"
              className={cx("background-img")}
            />
            <div className={cx("content")}>
              <h1 className={cx("title")}>Inside get your guide</h1>
              <p className={cx("desc")}>
                We have more than 1000+ articles you can read
              </p>
              <div className={cx("search")}>
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className={cx("location-icon")}
                />
                <input
                  className={cx("search-input")}
                  placeholder="Tìm kiếm bài viết..."
                  type="search"
                  onKeyDown={handleSearch}
                ></input>
                <div className={cx("icon-wrapper")}>
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className={cx("search-icon")}
                  />
                </div>
              </div>

              <div className={cx("btn-type")}>
                {categories.map((type, index) => (
                  <Button
                    key={index}
                    active={buttonIndex === index}
                    inactive={buttonIndex !== index}
                    className={cx("btn")}
                    onClick={(e) => {
                      setButtonIndex(index);
                      loadBlogByCategory(e);
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className={cx("blog-content")}>
        <section className={cx("trending-blog")}>
          {trendingBlogs &&
            trendingBlogs.map((blog, index) => {
              return (
                <TrendingBlogPost
                  key={index}
                  content={blog}
                  index={index}
                  remainingTrendingBlogs={remainingTrendingBlogs}
                ></TrendingBlogPost>
              );
            })}
        </section>

        <section className={cx("blog-list")}>
          {blogs && blogs.results && blogs.results.length > 0 ? (
            blogs.results.map((blog, index) => {
              return (
                <LatestBlogPostCard
                  key={index}
                  content={blog}
                  author={blog.author.personal_info}
                ></LatestBlogPostCard>
              );
            })
          ) : (
            <NoDataMessage
              message={"Sorry!! No blog published hẹ hẹ hẹ "}
            ></NoDataMessage>
          )}
          <LoadMoreButton
            state={blogs}
            fetchDataFunc={
              pageState === "all articles"
                ? fetchLatestBlogs
                : fetchBlogByCategory
            }
          ></LoadMoreButton>
        </section>

        {pageState === "all articles" && currentPosts && (
          <section className={cx("blog-card")}>
            <div className={cx("inner")}>
              <div className={cx("container")}>
                <div className={cx("blog-card-list")}>
                  {currentPosts.map((blog, index) => {
                    return <BlogCard key={index} blog={blog}></BlogCard>;
                  })}
                </div>
                {/* <Pagination
                                    totalPosts={blogs.results.length}
                                    postsPerPage={postsPerPage}
                                    setCurrentPage={setCurrentPage}
                                    currentPage={currentPage}
                                ></Pagination> */}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Blog;
