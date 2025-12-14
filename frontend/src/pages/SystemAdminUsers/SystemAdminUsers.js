import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSearch,
  faFilter,
  faEdit,
  faTrash,
  faSpinner,
  faUserShield,
  faUserTie,
  faUser,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserRole,
} from "~/common/adminApi";
import styles from "./SystemAdminUsers.module.scss";

function SystemAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: "",
    search: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: currentPage,
        limit: 20,
        ...filters,
      });
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      await updateUserRole(userId, newRole);
      toast.success("Role updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateUser(editingUser._id, editingUser.personal_info);
      toast.success("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return faUserShield;
      case "partner":
        return faUserTie;
      default:
        return faUser;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "#f44336";
      case "partner":
        return "#4CAF50";
      default:
        return "#2196F3";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.loading}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>
            <FontAwesomeIcon icon={faUsers} /> User Management
          </h1>
          <p>Manage all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by name, email, username..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td>
                  <div className={styles.userCell}>
                    <img
                      src={user.personal_info.profile_img}
                      alt={user.personal_info.fullname || "User"}
                    />
                    <span>{user.personal_info.fullname || "N/A"}</span>
                  </div>
                </td>
                <td>{user.personal_info.email}</td>
                <td>@{user.personal_info.username}</td>
                <td>
                  <span
                    className={styles.roleBadge}
                    style={{
                      background: getRoleBadgeColor(user.personal_info.role),
                    }}
                  >
                    <FontAwesomeIcon
                      icon={getRoleIcon(user.personal_info.role)}
                    />
                    {user.personal_info.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <select
                      value={user.personal_info.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className={styles.roleSelect}
                    >
                      <option value="user">User</option>
                      <option value="partner">Partner</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleEditUser(user)}
                      className={styles.editBtn}
                      title="Edit user"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className={styles.deleteBtn}
                      title="Delete user"
                      disabled={user.personal_info.role === "admin"}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Edit User</h2>
                <button onClick={() => setShowEditModal(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editingUser.personal_info.fullname || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        personal_info: {
                          ...editingUser.personal_info,
                          fullname: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bio</label>
                  <textarea
                    value={editingUser.personal_info.bio || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        personal_info: {
                          ...editingUser.personal_info,
                          bio: e.target.value,
                        },
                      })
                    }
                    rows="3"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className={styles.saveBtn}>
                  <FontAwesomeIcon icon={faSave} /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SystemAdminUsers;
