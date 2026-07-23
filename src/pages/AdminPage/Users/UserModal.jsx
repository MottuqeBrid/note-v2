import { useRef, useState } from "react";
import {
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiPlus,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../../lib/useAxios";
import { PiRanking } from "react-icons/pi";

const UserModal = ({ editingUser, setEditingUser, setUsers }) => {
  const axios = useAxios();
  const [isSaving, setIsSaving] = useState(false);
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const prevUserId = useRef(null);

  if (editingUser?._id !== prevUserId.current) {
    prevUserId.current = editingUser?._id;
    setEmails(editingUser?.emails || []);
    setNewEmail("");
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);

    const payload = {
      ...editingUser,
      name: formData.get("name"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      role: formData.get("role"),
      level: parseInt(formData.get("level"), 10),
      isDeleted: formData.get("isDeleted") === "on",
      isVerified: formData.get("isVerified") === "on",
      emails,
    };

    try {
      setIsSaving(true);

      const { data } = await axios.patch(
        `admin/user/${editingUser._id}`,
        payload,
      );

      setUsers((prev) =>
        prev.map((user) =>
          user._id === editingUser._id
            ? data?.user || { ...user, ...payload }
            : user,
        ),
      );

      Swal.fire(
        "Updated",
        data?.message || "User updated successfully",
        "success",
      );

      setEditingUser(null);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Update failed",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      Swal.fire("Invalid", "Please enter a valid email address.", "error");
      return;
    }
    if (emails.includes(trimmed)) {
      Swal.fire("Duplicate", "This email is already added.", "warning");
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setNewEmail("");
  };

  return (
    <dialog className={`modal ${editingUser ? "modal-open" : ""}`}>
      <div className="modal-box max-w-2xl overflow-auto rounded-xl border border-primary/20 bg-base-100 p-0 text-neutral shadow-2xl">
        <div className="flex items-start justify-between border-b border-primary/10 bg-primary/10 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                <FiUser size={20} />
              </span>

              <div>
                <h3 className="text-xl font-bold">Edit User</h3>
                <p className="text-sm text-neutral/70">
                  Update profile, role, Level and account status.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditingUser(null)}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {editingUser && (
          <form onSubmit={handleUpdate} className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-control">
                <span className="label-text mb-1 flex items-center gap-2 font-medium">
                  <FiUser />
                  Name
                </span>
                <input
                  name="name"
                  defaultValue={editingUser.name}
                  className="input input-bordered w-full bg-base-100 focus:outline-primary"
                  placeholder="User name"
                />
              </label>

              <label className="form-control">
                <span className="label-text mb-1 flex items-center gap-2 font-medium">
                  <FiPhone />
                  Phone Number
                </span>
                <input
                  name="phoneNumber"
                  defaultValue={editingUser.phoneNumber}
                  className="input input-bordered w-full bg-base-100 focus:outline-primary"
                  placeholder="Phone number"
                />
              </label>
            </div>

            <label className="form-control">
              <span className="label-text mb-1 flex items-center gap-2 font-medium">
                <FiMail />
                Email
              </span>
              <input
                name="email"
                type="email"
                defaultValue={editingUser.email}
                className="input input-bordered w-full bg-base-100 focus:outline-primary"
                placeholder="Email address"
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1 flex items-center gap-2 font-medium">
                <PiRanking />
                Level
              </span>
              <select
                name="level"
                defaultValue={editingUser.level}
                className="select select-bordered w-full bg-base-100 focus:outline-primary"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control">
              <span className="label-text mb-1 flex items-center gap-2 font-medium">
                <FiShield />
                Role
              </span>
              <select
                name="role"
                defaultValue={editingUser.role}
                className="select select-bordered w-full bg-base-100 focus:outline-primary"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
              <span className="label-text mb-2 flex items-center gap-2 font-medium text-primary">
                <FiMail />
                Emails
              </span>

              {emails.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <span
                      key={index}
                      className="badge badge-outline badge-primary gap-1 pr-1"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() =>
                          setEmails((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="ml-1 text-error/70 hover:text-error"
                        aria-label={`Remove ${email}`}
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  className="input input-bordered input-sm grow bg-base-100 focus:outline-primary"
                  placeholder="Add an email address"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="btn btn-primary btn-sm gap-1"
                  disabled={!newEmail.trim()}
                >
                  <FiPlus />
                  Add
                </button>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-base-100 px-4 py-3 shadow-sm">
                <span className="flex items-center gap-3 font-medium">
                  <FiTrash2 className="text-error" />
                  Is Deleted
                </span>
                <input
                  name="isDeleted"
                  type="checkbox"
                  defaultChecked={editingUser.isDeleted}
                  className="toggle toggle-error"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-base-100 px-4 py-3 shadow-sm">
                <span className="flex items-center gap-3 font-medium">
                  <FiCheckCircle className="text-primary" />
                  Is Verified
                </span>
                <input
                  name="isVerified"
                  type="checkbox"
                  defaultChecked={editingUser.isVerified}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            <div className="modal-action border-t border-primary/10 pt-5">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditingUser(null)}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <FiSave />
                )}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="modal-backdrop" onClick={() => setEditingUser(null)} />
    </dialog>
  );
};

export default UserModal;
