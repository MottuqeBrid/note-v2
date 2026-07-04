import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiShield,
  FiUser,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../lib/useAxios";
import { getToken } from "../../lib/localstoreage";

const isAdminUser = (user) => {
  if (Array.isArray(user?.role)) return user.role.includes("admin");
  return user?.role === "admin";
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "Optional", color: "bg-base-300" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak", color: "bg-error" };
  if (score === 2) return { score, label: "Fair", color: "bg-warning" };
  if (score === 3) return { score, label: "Good", color: "bg-info" };
  return { score, label: "Strong", color: "bg-success" };
};

const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="form-control">
      <span className="label">
        <span className="label-text flex items-center gap-2 font-semibold">
          <FiLock className="text-primary" />
          {label}
        </span>
      </span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`input input-bordered w-full pr-11 ${error ? "input-error" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/45 transition hover:text-primary"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && (
        <span className="label-text-alt mt-1 flex items-center gap-1 text-error">
          <FiAlertCircle />
          {error}
        </span>
      )}
    </label>
  );
};

const AdminPage = () => {
  const app = useAxios();
  const token = getToken("token");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = useMemo(() => isAdminUser(user), [user]);
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const selectedUser = useMemo(
    () => users.find((item) => item._id === selectedUserId),
    [selectedUserId, users],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((item) =>
      [item.name, item.email, item.phoneNumber, item.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, users]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data } = await app.get("admin/user", {
        headers: authHeaders,
      });
      const userList = data?.users || [];

      setUsers(userList);
      if (!selectedUserId && userList.length > 0) {
        setSelectedUserId(userList[0]._id);
        setEmail(userList[0].email || "");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to load users",
        "error",
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [app, authHeaders, selectedUserId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) navigate("/login", { replace: true });
  }, [authLoading, isAdmin, navigate, user]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    const timerId = setTimeout(() => loadUsers(), 0);
    return () => clearTimeout(timerId);
  }, [authLoading, isAdmin, loadUsers]);

  const handleSelectUser = (userId) => {
    const nextUser = users.find((item) => item._id === userId);
    setSelectedUserId(userId);
    setEmail(nextUser?.email || "");
    setPassword("");
    setConfirmPassword("");
  };

  const validateForm = () => {
    if (!selectedUser) return "Please select a user.";
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (password && password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!password && email.trim() === selectedUser.email) {
      return "Change the email or enter a new password before saving.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      Swal.fire("Check form", validationError, "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Update user credentials?",
      text: `This will update ${selectedUser.name || selectedUser.email}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Update",
    });

    if (!result.isConfirmed) return;

    const payload = {
      ...selectedUser,
      email: email.trim(),
      id: selectedUser._id,
    };

    if (password) {
      payload.password = password;
    }

    try {
      setSaving(true);
      const { data } = await app.patch(`admin/user`, payload, {
        headers: authHeaders,
      });

      setUsers((current) =>
        current.map((item) =>
          item._id === selectedUser._id
            ? data?.user || { ...item, email: payload.email }
            : item,
        ),
      );
      setPassword("");
      setConfirmPassword("");

      Swal.fire(
        "Updated",
        data?.message || "User credentials updated successfully.",
        "success",
      );
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to update user credentials",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <Loading />;

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              User Credentials
            </h1>
            <p className="mt-1 text-sm text-neutral/60">
              Select a user and update their email or password securely.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            className="btn btn-primary gap-2"
            disabled={loadingUsers}
          >
            {loadingUsers ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FiRefreshCw />
            )}
            Refresh Users
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FiUser className="text-primary" />
              Select User
            </h2>
            <p className="mt-1 text-sm text-neutral/60">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          <label className="input input-bordered mb-4 flex items-center gap-2">
            <FiSearch className="text-primary" />
            <input
              type="search"
              className="grow"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="max-h-130 space-y-2 overflow-y-auto pr-1">
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : filteredUsers.length ? (
              filteredUsers.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleSelectUser(item._id)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:border-primary hover:bg-primary/5 ${
                    selectedUserId === item._id
                      ? "border-primary bg-primary/10"
                      : "border-base-300 bg-base-100"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                    {(item.name || item.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {item.name || "Unnamed user"}
                    </span>
                    <span className="block truncate text-xs text-neutral/55">
                      {item.email || "No email"}
                    </span>
                  </span>
                  <span className="badge badge-primary badge-sm capitalize">
                    {item.role || "user"}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-base-300 py-12 text-center text-sm text-neutral/50">
                No users found.
              </div>
            )}
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <FiShield className="text-primary" />
                Update Email & Password
              </h2>
              <p className="mt-1 text-sm text-neutral/60">
                Password is optional. Leave it blank to update email only.
              </p>
            </div>
            {selectedUser && (
              <span className="badge badge-outline capitalize">
                {selectedUser.role || "user"}
              </span>
            )}
          </div>

          {selectedUser ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                <p className="font-semibold">
                  {selectedUser.name || "Unnamed user"}
                </p>
                <p className="text-sm text-neutral/60">{selectedUser.email}</p>
              </div>

              <label className="form-control">
                <span className="label">
                  <span className="label-text flex items-center gap-2 font-semibold">
                    <FiMail className="text-primary" />
                    Email Address
                  </span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input input-bordered"
                  placeholder="user@example.com"
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <PasswordField
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Minimum 8 characters"
                  disabled={saving}
                  error={
                    password && password.length < 8
                      ? "Minimum 8 characters"
                      : ""
                  }
                />
                <PasswordField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat new password"
                  disabled={saving}
                  error={
                    confirmPassword && password !== confirmPassword
                      ? "Passwords do not match"
                      : ""
                  }
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral/50">Password strength</span>
                  <span className="font-semibold">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex h-2 gap-1">
                  {[1, 2, 3, 4].map((item) => (
                    <span
                      key={item}
                      className={`h-2 flex-1 rounded-full ${
                        item <= passwordStrength.score
                          ? passwordStrength.color
                          : "bg-base-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-base-300 bg-base-200/50 p-4 text-sm text-neutral/60">
                <p className="mb-2 flex items-center gap-2 font-semibold text-neutral">
                  <FiAlertCircle className="text-primary" />
                  Admin note
                </p>
                <p>
                  After changing a password, tell the user to sign in with the
                  new password and update it from their account settings.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-base-300 pt-5">
                <button
                  type="button"
                  onClick={() => handleSelectUser(selectedUser._id)}
                  className="btn btn-ghost"
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary gap-2"
                  disabled={saving || loadingUsers}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <FiSave />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-base-300 text-center text-neutral/50">
              <FiUser className="mb-3 h-10 w-10 text-primary/60" />
              <p className="font-medium">
                Select a user to update credentials.
              </p>
            </div>
          )}
        </form>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
          <FiUser className="mb-2 text-primary" />
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-neutral/60">Total Users</p>
        </div>
        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
          <FiCheckCircle className="mb-2 text-primary" />
          <p className="text-2xl font-bold">
            {users.filter((item) => item.isVerified).length}
          </p>
          <p className="text-sm text-neutral/60">Verified Users</p>
        </div>
        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
          <FiShield className="mb-2 text-primary" />
          <p className="text-2xl font-bold">
            {users.filter((item) => item.role === "admin").length}
          </p>
          <p className="text-sm text-neutral/60">Admins</p>
        </div>
      </div>
    </section>
  );
};

export default AdminPage;
