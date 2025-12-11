import React, { useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styles from "./ManageBlogs.module.scss";
import { useContext, useEffect } from "react";
import { UserContext } from "~/App";
import axios from "axios";
import { filterPaginationData } from "~/common/filter-pagination-data";
import Button from "~/components/Button";
import NoDataMessage from "~/components/NoData";
import ManagePublishedBlogCard from "~/components/ManagePublishedBlogCard";

const cx = classNames.bind(styles);
function ManageBlogs() {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  const [activeTab, setActiveTab] = useState("published");

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .post(
        process.env.REACT_APP_SERVER_DOMAIN + "/render/user-written-blogs",
        { page, draft, query, deletedDocCount },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: accessToken,
          countRoute: "/render/user-written-blogs-count",
          data_to_send: { draft, query },
        });
        console.log(formattedData);

        if (draft) {
          setDrafts(formattedData);
        } else {
          setBlogs(formattedData);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (accessToken) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [accessToken, blogs, drafts, query]);
  const handleSearch = (e) => {
    let searchQuery = e.target.value;

    setQuery(searchQuery);

    if (e.keyCode === 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };
  const handleChange = (e) => {
    if (!e.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  };
  console.log(blogs, drafts);

  return (
    <div className={cx("manage-blog")}>
      <div className={cx("search")}>
        <input
          type="search"
          placeholder="Tìm kiếm bài viết..."
          className={cx("search-input")}
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={cx("search-icon")}
        />
      </div>
      <div className={cx("list-btn")}>
        <Button
          active={activeTab === "published"}
          inactive={activeTab !== "published"}
          onClick={() => setActiveTab("published")}
          className={cx("button")}
        >
          Published Blogs
        </Button>

        <Button
          active={activeTab === "draft"}
          inactive={activeTab !== "draft"}
          onClick={() => setActiveTab("draft")}
          className={cx("button")}
        >
          Drafts
        </Button>
      </div>
      {activeTab === "published" ? (
        blogs === null ? (
          <p>Đang tải...</p>
        ) : (
          <div className={cx("blog-list")}>
            {blogs.results.length ? (
              blogs.results.map((blog, index) => {
                return (
                  <ManagePublishedBlogCard
                    key={index}
                    blog={{
                      ...blog,
                      setStateFunc: setBlogs,
                    }}
                  ></ManagePublishedBlogCard>
                );
              })
            ) : (
              <NoDataMessage message={"No Published Blogs"}></NoDataMessage>
            )}
          </div>
        )
      ) : drafts === null ? (
        <p>Đang tải...</p>
      ) : (
        <div className={cx("blog-list")}>
          {drafts.results.length ? (
            drafts.results.map((draft, index) => {
              return (
                <ManagePublishedBlogCard
                  key={index}
                  blog={{ ...draft, setStateFunc: setDrafts }}
                />
              );
            })
          ) : (
            <NoDataMessage message={"No Draft Blogs"}></NoDataMessage>
          )}
        </div>
      )}
    </div>
  );
}

export default ManageBlogs;
