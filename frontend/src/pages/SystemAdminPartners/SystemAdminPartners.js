import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faSearch,
  faFilter,
  faSpinner,
  faHotel,
  faCalendarCheck,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { getAllPartners, updatePartnerStatus } from "~/common/adminApi";
import styles from "./SystemAdminPartners.module.scss";

function SystemAdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPartners();
  }, [currentPage, searchTerm]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await getAllPartners({
        page: currentPage,
        limit: 20,
        search: searchTerm,
      });
      setPartners(response.partners);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(error.message || "Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  if (loading && partners.length === 0) {
    return (
      <div className={styles.loading}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading partners...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>
            <FontAwesomeIcon icon={faUserTie} /> Partner Management
          </h1>
          <p>Manage all hotel partners</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="text"
          placeholder="Search partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Partners Grid */}
      <div className={styles.grid}>
        {partners.map((partner) => (
          <motion.div
            key={partner._id}
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.cardHeader}>
              <img
                src={partner.personal_info.profile_img}
                alt={partner.personal_info.fullname}
              />
              <div className={styles.info}>
                <h3>{partner.personal_info.fullname || "N/A"}</h3>
                <p>@{partner.personal_info.username}</p>
                <span className={styles.email}>
                  {partner.personal_info.email}
                </span>
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faHotel} />
                <div>
                  <span className={styles.value}>
                    {partner.hotelCount || 0}
                  </span>
                  <span className={styles.label}>Hotels</span>
                </div>
              </div>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faCalendarCheck} />
                <div>
                  <span className={styles.value}>
                    {partner.bookingCount || 0}
                  </span>
                  <span className={styles.label}>Bookings</span>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <span className={styles.joinedDate}>
                Joined: {new Date(partner.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SystemAdminPartners;
