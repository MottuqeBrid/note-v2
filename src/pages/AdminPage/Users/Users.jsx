import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";
import { useAuth } from "../../../hooks/useAuth";
import useAxios from "../../../lib/useAxios";
import { getToken } from "../../../lib/localstoreage";
import UserModal from "./UserModal";
import UserTable from "./UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const app = useAxios();
  const token = getToken("token");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isAdmin = useMemo(() => {
    if (Array.isArray(user?.role)) return user.role.includes("admin");
    return user?.role === "admin";
  }, [user]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await app.get("admin/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(data?.users || []);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to load users",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [app, token]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    const lodeUsers = async () => {
      if (authLoading || !isAdmin) return;
      fetchUsers();
    };
    lodeUsers();
  }, [authLoading, isAdmin, fetchUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((u) =>
      [u.name, u.email, u.phoneNumber, u.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [users, search]);

  const stats = useMemo(
    () => ({
      total: users.length,
      verified: users.filter((u) => u.isVerified).length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users],
  );

  const handleDelete = async (selectedUser) => {
    const userId = selectedUser._id || selectedUser.id;

    const result = await Swal.fire({
      title: "Delete user?",
      text: `${selectedUser.name || "This user"} will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#22c55e",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await app.delete(`admin/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));

      Swal.fire("Deleted", "User deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Users</h1>
            <p className="mt-1 text-sm text-neutral/60">
              Manage user roles, verification, and account status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="input input-bordered flex min-w-0 items-center gap-2 bg-base-100 sm:w-80">
              <FiSearch className="shrink-0 text-primary" />
              <input
                type="text"
                placeholder="Search users..."
                className="grow"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-neutral/50 transition hover:text-primary"
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={fetchUsers}
              className="btn btn-primary gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FiRefreshCw />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
            <FiUsers className="mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-neutral/60">Total Users</p>
          </div>

          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
            <FiCheckCircle className="mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.verified}</p>
            <p className="text-sm text-neutral/60">Verified Users</p>
          </div>

          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
            <FiShield className="mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.admins}</p>
            <p className="text-sm text-neutral/60">Admins</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral/60">
          Showing {filtered.length} of {users.length} user
          {users.length !== 1 && "s"}
        </p>
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
    </section>
  );
};

export default Users;
