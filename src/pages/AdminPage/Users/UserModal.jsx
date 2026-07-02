import { useState } from "react";
import {
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../../lib/useAxios";

const UserModal = ({ editingUser, setEditingUser, setUsers }) => {
  const axios = useAxios();
  const [isSaving, setIsSaving] = useState(false);

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
      isDeleted: formData.get("isDeleted") === "on",
      isVerified: formData.get("isVerified") === "on",
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

  return (
    <dialog className={`modal ${editingUser ? "modal-open" : ""}`}>
      <div className="modal-box max-w-2xl overflow-hidden rounded-xl border border-primary/20 bg-base-100 p-0 text-neutral shadow-2xl">
        <div className="flex items-start justify-between border-b border-primary/10 bg-primary/10 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                <FiUser size={20} />
              </span>

              <div>
                <h3 className="text-xl font-bold">Edit User</h3>
                <p className="text-sm text-neutral/70">
                  Update profile, role, and account status.
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
