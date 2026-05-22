import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../lib/useAxios";

const emptyForm = {
  title: "",
  content: { type: "text", text: "" },
  tags: "",
};

const NoteModal = ({ editingNote, setEditingNote, onSaved }) => {
  const axios = useAxios();
  const [form, setForm] = useState(emptyForm);
  const [contentType, setContentType] = useState("text");
  const [loading, setLoading] = useState(false);

  const isAdding = editingNote === "new";
  const isEditing = editingNote && editingNote !== "new";

  useEffect(() => {
    if (editingNote && editingNote !== "new") {
      setForm({
        title: editingNote.title || "",
        content: editingNote.content || { type: "text", text: "" },
        tags: editingNote.tags?.join(", ") || "",
      });
      setContentType(editingNote.content?.type || "text");
    } else {
      setForm(emptyForm);
      setContentType("text");
    }
  }, [editingNote]);

  const handleContentChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value, type: contentType },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      content: { ...form.content, type: contentType },
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing) {
        await axios.patch(`/note/${editingNote.id}`, payload);
        Swal.fire("Updated", "", "success");
      } else {
        await axios.post("/note", payload);
        Swal.fire("Created", "", "success");
      }
      close();
      onSaved();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const close = () => setEditingNote(null);

  return (
    <dialog className={`modal ${editingNote ? "modal-open" : ""}`}>
      <div className="modal-box max-w-2xl">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
          >
            <FiX />
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">
          {isAdding ? "New Note" : "Edit Note"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="form-control w-full">
            <span className="label-text mb-1">Title</span>
            <input
              name="title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="input input-bordered w-full"
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1">Content Type</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="file">File</option>
              <option value="code">Code</option>
            </select>
          </label>

          {contentType === "text" && (
            <label className="form-control w-full">
              <span className="label-text mb-1">Content</span>
              <textarea
                value={form.content.text || ""}
                onChange={(e) => handleContentChange("text", e.target.value)}
                className="textarea textarea-bordered h-32"
                required
              />
            </label>
          )}

          {contentType === "image" && (
            <>
              <label className="form-control w-full">
                <span className="label-text mb-1">Image URL</span>
                <input
                  value={form.content.src || ""}
                  onChange={(e) => handleContentChange("src", e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1">Alt Text</span>
                <input
                  value={form.content.alt || ""}
                  onChange={(e) => handleContentChange("alt", e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>
            </>
          )}

          {contentType === "file" && (
            <>
              <label className="form-control w-full">
                <span className="label-text mb-1">File URL</span>
                <input
                  value={form.content.url || ""}
                  onChange={(e) => handleContentChange("url", e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1">File Name</span>
                <input
                  value={form.content.name || ""}
                  onChange={(e) => handleContentChange("name", e.target.value)}
                  className="input input-bordered w-full"
                />
              </label>
            </>
          )}

          {contentType === "code" && (
            <>
              <label className="form-control w-full">
                <span className="label-text mb-1">Language</span>
                <input
                  value={form.content.language || ""}
                  onChange={(e) =>
                    handleContentChange("language", e.target.value)
                  }
                  className="input input-bordered w-full"
                  placeholder="e.g. javascript, python, bash"
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-1">Code</span>
                <textarea
                  value={form.content.code || ""}
                  onChange={(e) => handleContentChange("code", e.target.value)}
                  className="textarea textarea-bordered font-mono h-40"
                  required
                />
              </label>
            </>
          )}

          <label className="form-control w-full">
            <span className="label-text mb-1">
              Tags{" "}
              <span className="text-base-content/50">(comma separated)</span>
            </span>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="input input-bordered w-full"
              placeholder="react, tutorial, idea"
            />
          </label>

          <div className="modal-action">
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner" />}
              {isEditing ? "Save Changes" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={close} />
    </dialog>
  );
};

export default NoteModal;
