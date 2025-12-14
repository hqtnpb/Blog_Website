import classNames from "classnames/bind";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./SearchPage.module.scss";
import NoDataMessage from "~/components/NoData";
import BlogCard from "~/components/BlogCard/BlogCard";
import LoadMoreButton from "~/components/LoadMoreButton/LoadMoreButton";
import { filterPaginationData } from "~/common/filter-pagination-data";
import UserCard from "~/components/UserCard/UserCard";

import axios from "axios";

const cx = classNames.bind(styles);

function SearchPage() {
  let { query } = useParams();
  let [blogs, setBlogs] = useState(null);
  let [users, setUsers] = useState(null);
  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/render/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });

        setBlogs(formattedData);
      })
      .catch((error) => {});
  };

  const fetchUsers = () => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/search-users", {
        query,
      })
      .then(({ data: { users } }) => {
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);
  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  return (
    <div className={cx("search-page")}>
      <div className={cx("blog-content")}>
        <section className={cx("blog-list")}>
          {blogs && blogs.results.length ? (
            blogs.results.map((blog, index) => {
              return <BlogCard key={index} blog={blog}></BlogCard>;
            })
          ) : (
            <NoDataMessage
              message={"Sorry!! No blog related to search"}
            ></NoDataMessage>
          )}
        </section>
        <LoadMoreButton
          state={blogs}
          fetchDataFunc={searchBlogs}
        ></LoadMoreButton>
      </div>
      <div>
        <h2>User related to search</h2>
        <section className={cx("user-list")}>
          {users && users.length ? (
            users.map((user, index) => {
              return <UserCard key={index} user={user}></UserCard>;
            })
          ) : (
            <NoDataMessage message={"No user found"}></NoDataMessage>
          )}
        </section>
      </div>
    </div>
  );
}

export default SearchPage;
