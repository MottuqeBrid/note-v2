import { useState } from "react";
import {
  FiCode,
  FiFileText,
  FiFile,
  FiExternalLink,
  FiClock,
  FiChevronDown,
  FiImage,
  FiPaperclip,
  FiX,
  FiEdit2,
  FiTrash,
} from "react-icons/fi";
import useAxios from "../../lib/useAxios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { getToken } from "../../lib/localstoreage";

const FILE_TYPE_MAP = {
  "text/html": {
    label: "HTML",
    Icon: FiCode,
    color: "text-orange-500 bg-orange-50 border-orange-200",
  },
  "text/javascript": {
    label: "JS",
    Icon: FiFileText,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  "text/css": {
    label: "CSS",
    Icon: FiCode,
    color: "text-blue-500 bg-blue-50 border-blue-200",
  },
  default: {
    label: "FILE",
    Icon: FiFile,
    color: "text-slate-500 bg-slate-50 border-slate-200",
  },
};

function FileChip({ file }) {
  const map = FILE_TYPE_MAP[file.type] || FILE_TYPE_MAP.default;
  const { label, Icon, color } = map;
  const name = file.originalName || file.filename;

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150 hover:shadow-sm hover:-translate-y-px group"
      style={{ textDecoration: "none" }}
    >
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide border ${color}`}
      >
        <Icon size={10} />
        {label}
      </span>
      <span className="text-base-400 max-w-30 truncate group-hover:text-base-900 transition-colors">
        {name}
      </span>
      <FiExternalLink
        size={11}
        className="text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors"
      />
    </a>
  );
}

function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null);
  if (!images?.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(img)}
            className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:scale-105 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <img
              src={img.url}
              alt={img.filename}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.filename}
              className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg text-slate-500 hover:text-slate-900 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const NoteCard = ({ note, fetchNotes, setShowEditNoteForm, setEditNote }) => {
  const app = useAxios();
  const [expanded, setExpanded] = useState(false);
  if (!note) return null;

  const { title, content, createdAt, updatedAt, deleted } = note;
  const files = content?.files || [];
  const images = content?.images || [];
  const text = content?.text;
  const isActive = !deleted;
  const isEdited = createdAt !== updatedAt;

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const deleteNote = async (noteId) => {
    try {
      const token = getToken("token");
      if (!token) {
        toast.error("You are not logged in");
        return;
      }
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { data: response } = await app.delete(`/note/${noteId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.success) {
            Swal.fire(
              "Deleted!",
              response.message || "Note has been deleted.",
              "success",
            );
            fetchNotes(); // Refresh the notes list
          }
        } else {
          Swal.fire("Cancelled", "Your note is not deleted.", "info");
        }
      });
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "An error occurred while deleting the note.",
        "error",
      );
    }
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setShowEditNoteForm(true);
  };
  return (
    <div className="bg-primary/20 rounded-2xl border border-primary/30 shadow-sm w-full  px-5 space-y-4">
      <div className="flex justify-between h-full items-center flex-col">
        <div className=" w-full my-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-emerald-400" : "bg-red-400"}`}
                />
                <span
                  className={`text-[10px] font-semibold tracking-widest uppercase ${isActive ? "text-emerald-500" : "text-red-500"}`}
                >
                  {isActive ? "Active" : "Deleted"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 truncate leading-snug">
                {title || "Untitled"}
              </h3>
            </div>

            {text && text.length > 100 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-slate-300 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0"
                title={expanded ? "Hide details" : "Show details"}
              >
                <FiChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>

          {/* Body text */}
          {text && (
            <p className="text-sm text-black leading-relaxed bg-slate-50/20 rounded-lg px-3 py-2.5 border-l-2 border-primary/30">
              {expanded
                ? text
                : text.length > 100
                  ? `${text.slice(0, 100)}...`
                  : text}
            </p>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FiPaperclip size={11} className="text-slate-300" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  Attachments · {files.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <FileChip key={i} file={f} />
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FiImage size={11} className="text-slate-300" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  Images · {images.length}
                </span>
              </div>
              <ImageGallery images={images} />
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="border-t w-full mb-4 border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className=" space-y-2">
              {/* Created Date */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <FiClock size={11} />
                <span>{fmtDate(createdAt)}</span>
              </div>
              {/* Updated Date */}
              <div className="flex items-center justify-between">
                {isEdited && (
                  <span className="text-[11px] text-slate-300">
                    Edited {fmtDate(updatedAt)}
                  </span>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <button
                onClick={() => handleEdit(note)}
                className="p-1 rounded-lg hover:bg-primary/70 transition-colors cursor-pointer"
              >
                <FiEdit2 size={18} className="w-full h-full" />
              </button>
              {/* Delete Button */}
              <button
                onClick={() => deleteNote(note?._id)}
                className="p-1 rounded-lg hover:bg-red-600/70 transition-colors cursor-pointer"
              >
                <FiTrash size={18} className="w-full h-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
