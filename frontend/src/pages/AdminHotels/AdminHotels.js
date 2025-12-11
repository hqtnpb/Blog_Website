import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faMapMarkerAlt,
  faImage,
  faSpinner,
  faTimes,
  faSave,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  getPartnerHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from "~/common/partnerApi";
import ImageManager from "~/components/ImageManager";
import styles from "./AdminHotels.module.scss";

function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    images: [],
    hasFreeWifi: false,
    hasPool: false,
    hasParking: false,
    hasGym: false,
    hasSpa: false,
    hasRestaurant: false,
    hasBar: false,
    hasAC: false,
    hasRoomService: false,
    has24HourFrontDesk: false,
    hasAirportShuttle: false,
    hasBeachAccess: false,
    hasBreakfast: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getPartnerHotels();
      setHotels(data);
    } catch (error) {
      toast.error("Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, hotel = null) => {
    setModalMode(mode);
    setSelectedHotel(hotel);

    if (hotel && (mode === "edit" || mode === "view")) {
      // Normalize images to object format for ImageManager
      const normalizedImages = (hotel.images || []).map((img, index) => {
        if (typeof img === "string") {
          return { url: img, isPrimary: index === 0, order: index };
        }
        return img;
      });

      setFormData({
        name: hotel.name || "",
        description: hotel.description || "",
        address: hotel.address || "",
        city: hotel.city || "",
        country: hotel.country || "",
        images: normalizedImages,
        hasFreeWifi: hotel.hasFreeWifi || false,
        hasPool: hotel.hasPool || false,
        hasParking: hotel.hasParking || false,
        hasGym: hotel.hasGym || false,
        hasSpa: hotel.hasSpa || false,
        hasRestaurant: hotel.hasRestaurant || false,
        hasBar: hotel.hasBar || false,
        hasAC: hotel.hasAC || false,
        hasRoomService: hotel.hasRoomService || false,
        has24HourFrontDesk: hotel.has24HourFrontDesk || false,
        hasAirportShuttle: hotel.hasAirportShuttle || false,
        hasBeachAccess: hotel.hasBeachAccess || false,
        hasBreakfast: hotel.hasBreakfast || false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "",
        images: [],
        hasFreeWifi: false,
        hasPool: false,
        hasParking: false,
        hasGym: false,
        hasSpa: false,
        hasRestaurant: false,
        hasBar: false,
        hasAC: false,
        hasRoomService: false,
        has24HourFrontDesk: false,
        hasAirportShuttle: false,
        hasBeachAccess: false,
        hasBreakfast: false,
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      country: "",
      images: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.city || !formData.country) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const submitData = {
      ...formData,
      images: formData.images.map((img) => img.url),
    };

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        await createHotel(submitData);
        toast.success("Tạo khách sạn thành công!");
      } else if (modalMode === "edit") {
        await updateHotel(selectedHotel._id, submitData);
        toast.success("Cập nhật khách sạn thành công!");
      }

      await fetchHotels();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (hotelId, hotelName) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa khách sạn "${hotelName}"?\nTất cả phòng trong khách sạn này cũng sẽ bị xóa.`
      )
    ) {
      try {
        await deleteHotel(hotelId);
        toast.success("Xóa khách sạn thành công!");
        await fetchHotels();
      } catch (error) {
        toast.error(error.message || "Không thể xóa khách sạn");
        console.error(error);
      }
    }
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
        <p>Đang tải danh sách khách sạn...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Khách Sạn</h1>
          <p className={styles.subtitle}>
            Tổng cộng: <strong>{hotels.length}</strong> khách sạn
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => handleOpenModal("create")}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm Khách Sạn</span>
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, thành phố, quốc gia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Hotels Grid */}
      <div className={styles.hotelsGrid}>
        <AnimatePresence>
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel, index) => (
              <motion.div
                key={hotel._id}
                className={styles.hotelCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                {/* Hotel Image */}
                <div className={styles.hotelImage}>
                  {hotel.images && hotel.images.length > 0 ? (
                    <img src={hotel.images[0]} alt={hotel.name} />
                  ) : (
                    <div className={styles.noImage}>
                      <FontAwesomeIcon icon={faImage} />
                    </div>
                  )}
                  {hotel.images && hotel.images.length > 1 && (
                    <div className={styles.imageCount}>
                      <FontAwesomeIcon icon={faImage} />
                      <span>{hotel.images.length}</span>
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <div className={styles.hotelInfo}>
                  <h3 className={styles.hotelName}>{hotel.name}</h3>

                  <div className={styles.hotelLocation}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>
                      {hotel.city}, {hotel.country}
                    </span>
                  </div>

                  {hotel.description && (
                    <p className={styles.hotelDescription}>
                      {hotel.description.substring(0, 100)}
                      {hotel.description.length > 100 && "..."}
                    </p>
                  )}

                  <div className={styles.hotelStats}>
                    <div className={styles.stat}>
                      <FontAwesomeIcon icon={faHotel} />
                      <span>{hotel.rooms?.length || 0} Phòng</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.hotelActions}>
                  <button
                    className={styles.actionBtn + " " + styles.viewBtn}
                    onClick={() => handleOpenModal("view", hotel)}
                    title="Xem chi tiết"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className={styles.actionBtn + " " + styles.editBtn}
                    onClick={() => handleOpenModal("edit", hotel)}
                    title="Chỉnh sửa"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className={styles.actionBtn + " " + styles.deleteBtn}
                    onClick={() => handleDelete(hotel._id, hotel.name)}
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faHotel} className={styles.emptyIcon} />
              <p>
                {searchTerm
                  ? "Không tìm thấy khách sạn nào"
                  : "Chưa có khách sạn nào. Hãy thêm khách sạn đầu tiên!"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>
                  {modalMode === "create" && "Thêm Khách Sạn Mới"}
                  {modalMode === "edit" && "Chỉnh Sửa Khách Sạn"}
                  {modalMode === "view" && "Chi Tiết Khách Sạn"}
                </h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalBody}>
                {/* Name */}
                <div className={styles.formGroup}>
                  <label>
                    Tên Khách Sạn <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Khách sạn Hòa Bình"
                    disabled={modalMode === "view"}
                    required
                  />
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label>Mô Tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả về khách sạn..."
                    rows={4}
                    disabled={modalMode === "view"}
                    autoComplete="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  />
                </div>

                {/* Address */}
                <div className={styles.formGroup}>
                  <label>Địa Chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="VD: 123 Đường ABC"
                    disabled={modalMode === "view"}
                  />
                </div>

                {/* City & Country */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      Thành Phố <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="VD: Hà Nội"
                      disabled={modalMode === "view"}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      Quốc Gia <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="VD: Việt Nam"
                      disabled={modalMode === "view"}
                      required
                    />
                  </div>
                </div>

                {/* Images */}
                <div className={styles.formGroup}>
                  <label>Hình Ảnh Khách Sạn</label>
                  <ImageManager
                    images={formData.images}
                    onChange={(newImages) =>
                      setFormData((prev) => ({ ...prev, images: newImages }))
                    }
                    maxImages={10}
                    disabled={modalMode === "view"}
                    allowReorder={true}
                    allowSetPrimary={true}
                    compressionEnabled={true}
                  />
                </div>

                {/* Amenities */}
                <div className={styles.formGroup}>
                  <label>Tiện Nghi</label>
                  <div className={styles.amenitiesGrid}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasFreeWifi"
                        checked={formData.hasFreeWifi || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasFreeWifi: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Free WiFi</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasPool"
                        checked={formData.hasPool || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasPool: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Bể Bơi</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasParking"
                        checked={formData.hasParking || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasParking: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Bãi Đỗ Xe</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasGym"
                        checked={formData.hasGym || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasGym: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Phòng Gym</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasSpa"
                        checked={formData.hasSpa || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasSpa: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Spa</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasRestaurant"
                        checked={formData.hasRestaurant || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasRestaurant: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Nhà Hàng</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasBar"
                        checked={formData.hasBar || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasBar: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Bar</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasAC"
                        checked={formData.hasAC || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasAC: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Điều Hòa</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasRoomService"
                        checked={formData.hasRoomService || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasRoomService: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Room Service</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="has24HourFrontDesk"
                        checked={formData.has24HourFrontDesk || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            has24HourFrontDesk: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Lễ Tân 24/7</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasAirportShuttle"
                        checked={formData.hasAirportShuttle || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasAirportShuttle: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Đưa Đón Sân Bay</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasBeachAccess"
                        checked={formData.hasBeachAccess || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasBeachAccess: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Gần Bãi Biển</span>
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="hasBreakfast"
                        checked={formData.hasBreakfast || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasBreakfast: e.target.checked,
                          }))
                        }
                        disabled={modalMode === "view"}
                      />
                      <span>Ăn Sáng</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                {modalMode !== "view" && (
                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={handleCloseModal}
                      disabled={submitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          <span>
                            {modalMode === "create" ? "Tạo Mới" : "Cập Nhật"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminHotels;
