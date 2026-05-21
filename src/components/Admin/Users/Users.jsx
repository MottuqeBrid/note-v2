import { useEffect, useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../../lib/useAxios";
import UserModal from "./UserModal";
import UserTable from "./UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const axios = useAxios();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/users");
        setUsers(data?.users || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [axios]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }, [users, search]);

  //   Handle user deletion with confirmation
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
      await axios.delete(`/user/${user.id}`);
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

        <label className="input input-bordered flex items-center gap-2">
          <FiSearch className="text-base-content/40" />
          <input
            type="text"
            placeholder="Search by name or email…"
            className="grow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <UserTable
        data={filtered}
        loading={loading}
        search={search}
        onEdit={setEditingUser}
        onDelete={handleDelete}
      />

      <UserModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        setUsers={setUsers}
      />
    </div>
  );
};

export default Users;
