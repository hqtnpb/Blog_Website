import classNames from "classnames/bind";
import { Toaster, toast } from "react-hot-toast";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./PublishForm.module.scss";
import { EditorContext } from "~/pages/EditorPage/EditorPage";
import Tags from "~/components/Tags/Tags";
import Button from "../Button";
import { UserContext } from "~/App";

const cx = classNames.bind(styles);

const PublishForm = () => {
  let characterLimit = 200;
  let tagLimit = 3;

  let { blog_id } = useParams();
  let {
    blog,
    blog: { banner, title, tags, desc, content },
    setEditorState,
    setBlog,
  } = useContext(EditorContext);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleBlogDescChange = (e) => {
    let input = e.target;

    setBlog({ ...blog, desc: input.value });
  };
  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      // Enter key: 13
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();

      let tag = e.target.value;

      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can only add ${tagLimit} tags`);
      }

      e.target.value = "";
    }
  };

  const publishBlog = (e) => {
    if (e.target.className.includes("disable")) return;
    if (!title.length) {
      return toast.error("You must provide a title to publish the blog");
    }
    if (!desc.length || desc.length > characterLimit) {
      return toast.error(
        `Description must be between 1 and ${characterLimit} characters`
      );
    }
    if (!tags.length) {
      return toast.error(
        "Please provide at least one tag to help searching and ranking your blog"
      );
    }

    let loadingToast = toast.loading("Publishing your blog");

    e.target.classList.add("disable");

    let blogObj = {
      title,
      desc,
      banner,
      tags,
      content,
      draft: false,
    };

    axios
      .post(
        process.env.REACT_APP_SERVER_DOMAIN + "/create/create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((res) => {
        e.target.classList.remove("disable");

        toast.dismiss(loadingToast);
        toast.success("Blog published successfully");

        setTimeout(() => {
          navigate("/hotels");
        }, 1000);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");

        toast.dismiss(loadingToast);

        return toast.error(response.data.error);
      });
  };
  return (
    <section className={cx("publish-form")}>
      <Toaster />
      <div className={cx("content")}>
        <div className={cx("preview")}>
          <FontAwesomeIcon
            className={cx("close-btn")}
            icon={faXmark}
            onClick={handleCloseEvent}
          />
          <p className={cx("text")}>Preview Blog</p>
          <div className={cx("preview-img")}>
            <img src={banner} className={cx("image")} />
          </div>
          <h1 className={cx("title")}>{title}</h1>
          <p className={cx("desc")}>{desc}</p>

          <div id="textEditor" className={cx("")}></div>
        </div>

        <div className={cx("change")}>
          <p className={cx("label")}>Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            onChange={handleBlogTitleChange}
            className={cx("input")}
          ></input>

          <p className={cx("label")}>Short description about your blog</p>
          <textarea
            maxLength={characterLimit}
            defaultValue={desc}
            className={cx("textarea")}
            onChange={handleBlogDescChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>

          <p className={cx("character")}>
            {characterLimit - desc.length} character left
          </p>

          <p className={cx("label")}>
            Topics - (Help searching and ranking your blog)
          </p>

          <div className={cx("topics")}>
            <input
              type="text"
              placeholder="Topic"
              className={cx("topic-input")}
              onKeyDown={handleKeyDown}
            ></input>
            {tags.map((tag, index) => {
              return <Tags tag={tag} tagIndex={index} key={index} />;
            })}
          </div>
          <p className={cx("character")}>{tagLimit - tags.length} Tags left</p>
        </div>
      </div>
      <Button active onClick={publishBlog} className={cx("btn")}>
        Publish
      </Button>
    </section>
  );
};
export default PublishForm;
