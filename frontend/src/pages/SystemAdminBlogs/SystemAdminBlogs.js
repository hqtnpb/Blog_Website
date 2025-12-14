import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faNewspaper,
  faSearch,
  faEye,
  faEyeSlash,
  faTrash,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  getAllBlogsAdmin,
  deleteBlogAdmin,
  updateBlogStatus,
} from "~/common/adminApi";
import styles from "./SystemAdminBlogs.module.scss";

const cx = classNames.bind(styles);

function SystemAdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, statusFilter, sortBy]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogsAdmin({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
        sortBy,
      });
      setBlogs(data.blogs);
      setTotalPages(data.totalPages);
      setTotalBlogs(data.totalBlogs);
    } catch (error) {
      toast.error(error.error || "Không thể tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa blog này?")) {
      return;
    }

    try {
      await deleteBlogAdmin(blogId);
      toast.success("Đã xóa blog thành công");
      fetchBlogs();
    } catch (error) {
      toast.error(error.error || "Không thể xóa blog");
    }
  };

  const handleToggleStatus = async (blogId, currentDraft) => {
    try {
      await updateBlogStatus(blogId, !currentDraft);
      toast.success(
        `Blog đã được ${!currentDraft ? "ẩn" : "công khai"} thành công`
      );
      fetchBlogs();
    } catch (error) {
      toast.error(error.error || "Không thể cập nhật trạng thái blog");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && blogs.length === 0) {
    return (
      <div className={cx("loading")}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <div className={cx("header")}>
        <div>
          <h1>
            <FontAwesomeIcon icon={faNewspaper} />
            Quản lý Blog
          </h1>
          <p>
            Tổng cộng <strong>{totalBlogs}</strong> bài viết
          </p>
        </div>
      </div>

      <div className={cx("filters")}>
        <form className={cx("searchBox")} onSubmit={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Tìm kiếm blog theo tiêu đề, mô tả, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className={cx("filterGroup")}>
          <FontAwesomeIcon icon={faFilter} />
          <select
            className={cx("filterSelect")}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã công khai</option>
            <option value="draft">Bản nháp</option>
          </select>

          <select
            className={cx("filterSelect")}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="latest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="trending">Hot nhất</option>
          </select>
        </div>
      </div>

      <div className={cx("blogGrid")}>
        {blogs.map((blog) => (
          <div key={blog._id} className={cx("blogCard")}>
            {blog.banner && (
              <div className={cx("blogBanner")}>
                <img src={blog.banner} alt={blog.title} />
                {blog.draft && <span className={cx("draftBadge")}>Nháp</span>}
              </div>
            )}
            <div className={cx("blogContent")}>
              <h3>{blog.title}</h3>
              <p className={cx("blogDesc")}>{blog.desc}</p>

              <div className={cx("blogMeta")}>
                <div className={cx("author")}>
                  <img
                    src={
                      blog.author?.personal_info?.profile_img ||
                      "/default-avatar.png"
                    }
                    alt={blog.author?.personal_info?.username}
                  />
                  <span>@{blog.author?.personal_info?.username}</span>
                </div>
                <span className={cx("date")}>
                  {formatDate(blog.publishedAt)}
                </span>
              </div>

              <div className={cx("blogStats")}>
                <span>👁️ {blog.activity.total_reads}</span>
                <span>❤️ {blog.activity.total_likes}</span>
                <span>💬 {blog.activity.total_comments}</span>
              </div>

              {blog.tags && blog.tags.length > 0 && (
                <div className={cx("blogTags")}>
                  {blog.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className={cx("tag")}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={cx("blogActions")}>
                <button
                  className={cx("actionBtn", "toggleBtn")}
                  onClick={() => handleToggleStatus(blog._id, blog.draft)}
                  title={blog.draft ? "Công khai" : "Ẩn blog"}
                >
                  <FontAwesomeIcon icon={blog.draft ? faEye : faEyeSlash} />
                  {blog.draft ? "Công khai" : "Ẩn"}
                </button>
                <button
                  className={cx("actionBtn", "deleteBtn")}
                  onClick={() => handleDelete(blog._id)}
                  title="Xóa blog"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && !loading && (
        <div className={cx("emptyState")}>
          <FontAwesomeIcon icon={faNewspaper} className={cx("emptyIcon")} />
          <p>Không tìm thấy blog nào</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className={cx("pagination")}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trang trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

export default SystemAdminBlogs;
