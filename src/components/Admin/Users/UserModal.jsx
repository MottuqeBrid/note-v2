import { FiX } from "react-icons/fi";
import useAxios from "../../../lib/useAxios";
import Swal from "sweetalert2";

const UserModal = ({ editingUser, setEditingUser, setUsers }) => {
  const axios = useAxios();
  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value,
      username: form.username.value,
      email: form.email.value,
      phone_number: form.phone_number.value,
      role: form.role.value,
    };
    try {
      const { data } = await axios.patch(`/user/${editingUser.id}`, payload);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? data?.user || { ...u, ...payload } : u,
        ),
      );
      Swal.fire("Updated", "", "success");
      setEditingUser(null);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Update failed",
        "error",
      );
    }
  };
  return (
    <dialog className={`modal ${editingUser ? "modal-open" : ""}`}>
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setEditingUser(null)}
          >
            <FiX />
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Edit User</h3>
        {editingUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <label className="form-control w-full">
              <span className="label-text mb-1">Name</span>
              <input
                name="name"
                defaultValue={editingUser.name}
                className="input input-bordered w-full"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1">Username</span>
              <input
                name="username"
                defaultValue={editingUser.username}
                className="input input-bordered w-full"
                required
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1">Phone Number</span>
              <input
                name="phone_number"
                defaultValue={editingUser.phone_number}
                className="input input-bordered w-full"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={editingUser.email}
                className="input input-bordered w-full"
                required
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-1">Role</span>
              <select
                name="role"
                defaultValue={editingUser.role}
                className="select select-bordered w-full"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
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
