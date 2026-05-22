import { FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import NoteContent from "./NoteContent";

const NoteCard = ({ note, onEdit, onDelete }) => {
  const formattedDate = new Date(note.created_at || note.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-lg font-semibold">{note.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => onEdit(note)}
            >
              <FiEdit2 size={15} />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-square text-error"
              onClick={() => onDelete(note)}
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>

        <NoteContent content={note.content} />

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {note.tags.map((tag, i) => (
              <span key={i} className="badge badge-ghost badge-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-3 text-xs text-base-content/50">
          <FiClock size={12} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
