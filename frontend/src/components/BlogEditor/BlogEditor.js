import classNames from "classnames/bind";
import { Link, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Button from "~/components/Button/Button";
import styles from "./BlogEditor.module.scss";
import image from "~/assets/image";
import { uploadImage } from "~/common/aws";
import { EditorContext } from "~/pages/EditorPage/EditorPage";
import { tools } from "~/components/Tools/Tools";
import { UserContext } from "~/App";
const cx = classNames.bind(styles);

const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, desc },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let navigate = useNavigate();
  let { blog_id } = useParams();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Let's write an awesome blog!",
        })
      );
    } else if (textEditor && content && content.length > 0) {
      // Khi textEditor đã có và content đã có
      textEditor.render(content[0]).catch((err) => {
        console.error("Lỗi render EditorJS:", err);
      });
    }
  }, [content, textEditor]);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0];

    if (img) {
      let loadingToast = toast.loading("Uploading Image...");

      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Image Uploaded Successfully hẹ hẹ hẹ ");

            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      // Enter key: 13
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    let img = e.target;

    img.src = image.blog_banner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Please upload a banner for your blog");
    }

    if (!title.length) {
      return toast.error("Please enter a title for your blog");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Please write something for your blog");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) return;

    if (!title.length) {
      return toast.error("You must provide a title before saving draft");
    }

    let loadingToast = toast.loading("Saving your draft");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          desc,
          banner,
          tags,
          content,
          draft: true,
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
            toast.success("Blog saved");

            setTimeout(() => {
              navigate("/hotels");
            }, 1000);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");

            toast.dismiss(loadingToast);

            return toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <div className={cx("editor")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <nav className={cx("edit-nav")}>
            <Toaster />
            <div className={cx("nav-left")}>
              <div className={cx("logo")}>
                <Link to="/hotels">
                  <img src={image.logo} alt="Path Way" />
                </Link>
              </div>
              <p className={cx("text")}>
                {title && title.length ? title : "New Blog"}
              </p>
            </div>
            <div className={cx("action")}>
              <Button
                inactive
                onClick={handlePublishEvent}
                className={cx("btn")}
              >
                Publish
              </Button>
              <Button inactive onClick={handleSaveDraft} className={cx("btn")}>
                Save Draft
              </Button>
            </div>
          </nav>

          <div className={cx("banner")}>
            <label htmlFor="uploadBanner" className={cx("banner-label")}>
              {banner ? (
                <img
                  src={banner}
                  alt="banner"
                  className={cx("image")}
                  onError={handleError}
                />
              ) : (
                <img
                  src={image.blog_banner}
                  alt="default banner"
                  className={cx("image")}
                />
              )}

              <input
                id="uploadBanner"
                type="file"
                accept=".png, .jpg, jpeg"
                hidden
                onChange={handleBannerUpload}
              />
            </label>
          </div>
          <div className={cx("title")}>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className={cx("title-text")}
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
          </div>

          <div id="textEditor" className={cx("")}></div>
        </div>
      </div>
    </div>
  );
};
export default BlogEditor;
