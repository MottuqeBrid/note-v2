import { useEffect, useState, useMemo } from "react";
import {
  FiSearch,
  FiTrash2,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiMail,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../../lib/useAxios";
import UserModal from "./UserModal";

const ITEMS_PER_PAGE = 5;

const SortIcon = ({ sortBy, sortOrder, field }) => {
  if (sortBy !== field) return null;
  return sortOrder === "asc" ? (
    <FiChevronUp className="inline" />
  ) : (
    <FiChevronDown className="inline" />
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const axios = useAxios();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/users");
        console.log(data);
        setUsers(data?.users || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, [axios]);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      const aVal = (a[sortBy] || "").toString().toLowerCase();
      const bVal = (b[sortBy] || "").toString().toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, search, sortBy, sortOrder]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filtered, currentPage],
  );

  const toggleSort = (field) => {
    setCurrentPage(1);
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Delete user?",
      text: `${user.name} will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      Swal.fire("Deleted", "", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Users</h1>
          <p className="text-sm text-base-content/60">
            {filtered.length} user{filtered.length !== 1 && "s"} found
          </p>
        </div>

        <div className="flex gap-3">
          <label className="input input-bordered flex items-center gap-2">
            <FiSearch className="text-base-content/40" />
            <input
              type="text"
              placeholder="Search by name or email…"
              className="grow"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </label>

          <select
            className="select select-bordered"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="email-asc">Email A-Z</option>
            <option value="email-desc">Email Z-A</option>
            <option value="role-asc">Role A-Z</option>
            <option value="role-desc">Role Z-A</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="createdAt-desc">Newest first</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("name")}
                >
                  User
                  <SortIcon
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    field="name"
                  />
                </button>
              </th>
              <th className="hidden md:table-cell">
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("email")}
                >
                  Email
                  <SortIcon
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    field="email"
                  />
                </button>
              </th>
              <th>
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("role")}
                >
                  Role
                  <SortIcon
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    field="role"
                  />
                </button>
              </th>
              <th className="hidden lg:table-cell">
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("created_at")}
                >
                  Joined
                  <SortIcon
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    field="created_at"
                  />
                </button>
              </th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="w-10 rounded-full bg-primary/10 text-primary">
                        <FiUser />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-base-content/50 md:hidden">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  <span className="flex items-center gap-1 text-sm">
                    <FiMail className="text-base-content/40" />
                    {user.email}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${user.role === "admin" ? "badge-primary" : "badge-ghost"} gap-1`}
                  >
                    <FiShield />
                    {user.role}
                  </span>
                </td>
                <td className="hidden lg:table-cell">
                  <span className="flex items-center gap-1 text-sm text-base-content/60">
                    <FiCalendar />
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      title="Edit"
                      onClick={() => setEditingUser(user)}
                    >
                      <FiEdit className="text-info" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      title="Delete"
                      onClick={() => handleDelete(user)}
                    >
                      <FiTrash2 className="text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-base-content/40"
                >
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn btn-sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <FiChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`btn btn-sm ${page === currentPage ? "btn-primary" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="btn btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
      <UserModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        setUsers={setUsers}
      />
    </div>
  );
};

export default Users;
