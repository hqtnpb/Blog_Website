import classNames from "classnames/bind";
import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import styles from "./ProfilePage.module.scss";
import axios from "axios";
import Button from "~/components/Button";
import { UserContext } from "~/App";
import AboutUser from "~/components/AboutUser";
import { filterPaginationData } from "~/common/filter-pagination-data";
import LatestBlogPostCard from "~/components/BlogPost";
import NoDataMessage from "~/components/NoData";
import LoadMoreButton from "~/components/LoadMoreButton";
import Error from "~/components/Error";

const cx = classNames.bind(styles);

export const profileDataStructure = {
  personal_info: {
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

function ProfilePage() {
  let { id: profileId } = useParams();

  let [profile, setProfile] = useState(profileDataStructure);

  let {
    personal_info: { username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links: social_links,
    createdAt: joinedAt,
  } = profile;

  let {
    userAuth: { username },
  } = useContext(UserContext);

  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");
  const fetchUserProfile = async () => {
    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/user/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user !== null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const resetStates = () => {
    setProfile(profileDataStructure);
    setProfileLoaded("");
  };
  const getBlogs = async ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;

    axios
      .post(process.env.REACT_APP_SERVER_DOMAIN + "/render/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/render/search-blogs-count",
          data_to_send: { author: user_id },
        });
        formattedData.user_id = user_id;
        setBlogs(formattedData);
        // console.log(formattedData);
      });
  };
  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetStates();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  return profile_username ? (
    <section className={cx("user-profile")}>
      <img src={profile_img} className={cx("user-avt")} />
      <h2 className={cx("user-name")}>@{profile_username}</h2>

      <p className={cx("user-activity")}>
        {total_posts.toLocaleString()} Bài viết -{total_reads.toLocaleString()}{" "}
        Lượt đọc
      </p>
      {profileId === username ? (
        <Link to="/settings/edit-profile">
          <Button active className={cx("btn")}>
            Chỉnh sửa hồ sơ
          </Button>
        </Link>
      ) : (
        " "
      )}

      <AboutUser
        bio={bio}
        social_links={social_links}
        joinedAt={joinedAt}
      ></AboutUser>

      <section className={cx("blog-list")}>
        {blogs && blogs.results.length ? (
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
            message={"Người dùng này chưa có bài viết nào!!!"}
          ></NoDataMessage>
        )}
        <LoadMoreButton state={blogs} fetchDataFunc={getBlogs}></LoadMoreButton>
      </section>
    </section>
  ) : (
    <Error></Error>
  );
}

export default ProfilePage;
