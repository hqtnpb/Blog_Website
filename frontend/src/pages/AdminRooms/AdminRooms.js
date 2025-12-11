import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faHotel,
  faUsers,
  faDollarSign,
  faSpinner,
  faTimes,
  faSave,
  faSearch,
  faImage,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  getPartnerHotels,
  createRoom,
  updateRoom,
  deleteRoom,
} from "~/common/partnerApi";
import ImageManager from "~/components/ImageManager";
import styles from "./AdminRooms.module.scss";

function AdminRooms() {
  const [hotels, setHotels] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotelFilter, setSelectedHotelFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    hotelId: "",
    roomNumber: "",
    type: "",
    pricePerNight: "",
    maxAdults: "",
    maxChildren: "",
    amenities: [],
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHotelsAndRooms();
  }, []);

  const fetchHotelsAndRooms = async () => {
    try {
      setLoading(true);
      const hotelsData = await getPartnerHotels();
      setHotels(hotelsData);

      // Extract all rooms from all hotels
      const rooms = [];
      hotelsData.forEach((hotel) => {
        if (hotel.rooms && hotel.rooms.length > 0) {
          hotel.rooms.forEach((room) => {
            rooms.push({
              ...room,
              hotelName: hotel.name,
              hotelId: hotel._id,
              pricePerNight: Number(room.pricePerNight) || 0,
              maxAdults: Number(room.maxAdults) || 0,
              maxChildren: Number(room.maxChildren) || 0,
            });
          });
        }
      });
      setAllRooms(rooms);
    } catch (error) {
      toast.error("Không thể tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, room = null) => {
    setModalMode(mode);
    setSelectedRoom(room);

    if (room && (mode === "edit" || mode === "view")) {
      setFormData({
        hotelId: room.hotelId || "",
        roomNumber: room.roomNumber || "",
        type: room.type || "",
        title: room.title || "",
        desc: room.desc || "",
        pricePerNight: room.pricePerNight || "",
        maxAdults: room.maxAdults || "",
        maxChildren: room.maxChildren || "",
        amenities: room.amenities || [],
        images: room.images || [],
      });
    } else {
      setFormData({
        hotelId: "",
        roomNumber: "",
        type: "",
        title: "",
        desc: "",
        pricePerNight: "",
        maxAdults: "",
        maxChildren: "",
        amenities: [],
        images: [],
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setFormData({
      hotelId: "",
      roomNumber: "",
      type: "",
      pricePerNight: "",
      maxAdults: "",
      maxChildren: "",
      amenities: [],
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

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hotelId || !formData.roomNumber || !formData.type) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate price
    const price = Number(formData.pricePerNight);
    if (!price || price < 50000) {
      toast.error("Giá phòng phải lớn hơn 50.000 VND");
      return;
    }

    if (price > 100000000) {
      toast.error("Giá phòng không hợp lệ (quá cao)");
      return;
    }

    const submitData = {
      roomNumber: formData.roomNumber,
      type: formData.type,
      title:
        formData.title || `${formData.type} - Phòng ${formData.roomNumber}`,
      desc: formData.desc || "",
      pricePerNight: price,
      maxAdults: Number(formData.maxAdults) || 1,
      maxChildren: Number(formData.maxChildren) || 0,
      amenities: formData.amenities,
      images: formData.images.map((img) => img.url),
    };

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        await createRoom(formData.hotelId, submitData);
        toast.success("Tạo phòng thành công!");
      } else if (modalMode === "edit") {
        await updateRoom(formData.hotelId, selectedRoom._id, submitData);
        toast.success("Cập nhật phòng thành công!");
      }

      await fetchHotelsAndRooms();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (hotelId, roomId, roomNumber) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng "${roomNumber}"?`)) {
      try {
        await deleteRoom(hotelId, roomId);
        toast.success("Xóa phòng thành công!");
        await fetchHotelsAndRooms();
      } catch (error) {
        toast.error(error.message || "Không thể xóa phòng");
        console.error(error);
      }
    }
  };

  const filteredRooms = allRooms.filter((room) => {
    const matchesSearch =
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHotel =
      selectedHotelFilter === "all" || room.hotelId === selectedHotelFilter;

    return matchesSearch && matchesHotel;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code",
    }).format(amount);
  };

  const amenitiesList = [
    "WiFi",
    "TV",
    "Điều hòa",
    "Tủ lạnh",
    "Bàn làm việc",
    "Két an toàn",
    "Máy sấy tóc",
    "Dép đi trong phòng",
    "Minibar",
    "Ban công",
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
        <p>Đang tải danh sách phòng...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Phòng</h1>
          <p className={styles.subtitle}>
            Tổng cộng: <strong>{allRooms.length}</strong> phòng trong{" "}
            <strong>{hotels.length}</strong> khách sạn
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => handleOpenModal("create")}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm Phòng</span>
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        {/* Search */}
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo số phòng, loại phòng, khách sạn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Hotel Filter */}
        <div className={styles.filterBox}>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          <select
            value={selectedHotelFilter}
            onChange={(e) => setSelectedHotelFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả khách sạn</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className={styles.roomsGrid}>
        <AnimatePresence>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => (
              <motion.div
                key={room._id}
                className={styles.roomCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                {/* Room Image */}
                <div className={styles.roomImage}>
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt={room.type} />
                  ) : (
                    <div className={styles.noImage}>
                      <FontAwesomeIcon icon={faImage} />
                    </div>
                  )}
                  <div className={styles.roomBadge}>{room.type}</div>
                </div>

                {/* Room Info */}
                <div className={styles.roomInfo}>
                  <h3 className={styles.roomNumber}>Phòng {room.roomNumber}</h3>
                  <p className={styles.hotelName}>
                    <FontAwesomeIcon icon={faHotel} />
                    <span>{room.hotelName}</span>
                  </p>

                  <div className={styles.roomPrice}>
                    {formatCurrency(room.pricePerNight)}/đêm
                  </div>

                  <div className={styles.roomCapacity}>
                    <div className={styles.capacity}>
                      <FontAwesomeIcon icon={faUsers} />
                      <span>
                        {room.maxAdults} người lớn, {room.maxChildren} trẻ em
                      </span>
                    </div>
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className={styles.amenities}>
                      {room.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className={styles.amenityTag}>
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className={styles.amenityTag}>
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.roomActions}>
                  <button
                    className={styles.actionBtn + " " + styles.viewBtn}
                    onClick={() => handleOpenModal("view", room)}
                    title="Xem chi tiết"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className={styles.actionBtn + " " + styles.editBtn}
                    onClick={() => handleOpenModal("edit", room)}
                    title="Chỉnh sửa"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className={styles.actionBtn + " " + styles.deleteBtn}
                    onClick={() =>
                      handleDelete(room.hotelId, room._id, room.roomNumber)
                    }
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faBed} className={styles.emptyIcon} />
              <p>
                {searchTerm || selectedHotelFilter !== "all"
                  ? "Không tìm thấy phòng nào"
                  : "Chưa có phòng nào. Hãy thêm phòng đầu tiên!"}
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
                  {modalMode === "create" && "Thêm Phòng Mới"}
                  {modalMode === "edit" && "Chỉnh Sửa Phòng"}
                  {modalMode === "view" && "Chi Tiết Phòng"}
                </h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalBody}>
                {/* Hotel Selection */}
                <div className={styles.formGroup}>
                  <label>
                    Khách Sạn <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleInputChange}
                    disabled={modalMode === "view" || modalMode === "edit"}
                    required
                  >
                    <option value="">-- Chọn khách sạn --</option>
                    {hotels.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Number & Type */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      Số Phòng <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      placeholder="VD: 101"
                      disabled={modalMode === "view"}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      Loại Phòng <span className={styles.required}>*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      disabled={modalMode === "view"}
                      required
                    >
                      <option value="">-- Chọn loại phòng --</option>
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className={styles.formGroup}>
                  <label>Tên Phòng</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Deluxe - Phòng 101 (tự động nếu để trống)"
                    disabled={modalMode === "view"}
                  />
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>
                    Để trống để tự động tạo từ loại phòng + số phòng
                  </small>
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label>Mô Tả Phòng</label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về phòng..."
                    rows="3"
                    disabled={modalMode === "view"}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Price */}
                <div className={styles.formGroup}>
                  <label>
                    Giá/Đêm (VND) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    placeholder="500000"
                    min="50000"
                    step="10000"
                    disabled={modalMode === "view"}
                    required
                  />
                  <small
                    style={{
                      color: "#6b7280",
                      fontSize: "0.85rem",
                      marginTop: "0.25rem",
                      display: "block",
                    }}
                  >
                    Giá tối thiểu: 50.000 VND
                  </small>
                </div>

                {/* Capacity */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      Số Người Lớn <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="maxAdults"
                      value={formData.maxAdults}
                      onChange={handleInputChange}
                      placeholder="2"
                      min="1"
                      disabled={modalMode === "view"}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số Trẻ Em</label>
                    <input
                      type="number"
                      name="maxChildren"
                      value={formData.maxChildren}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      disabled={modalMode === "view"}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className={styles.formGroup}>
                  <label>Tiện Nghi</label>
                  <div className={styles.amenitiesGrid}>
                    {amenitiesList.map((amenity) => (
                      <label key={amenity} className={styles.amenityCheckbox}>
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          disabled={modalMode === "view"}
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div className={styles.formGroup}>
                  <label>Hình Ảnh Phòng</label>
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

export default AdminRooms;
