import { FiDownload, FiX } from "react-icons/fi";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
const NotePreviewModal = ({ note, onClose }) => {
  console.log("NotePreviewModal rendered with note:", note);
  if (!note) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl rounded-xl border border-primary/20 bg-base-100 p-0 text-neutral">
        <div className="flex items-start justify-between border-b border-primary/10 bg-primary/10 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold">{note.title}</h3>
            <p className="mt-1 text-sm text-neutral/60">
              {note.user?.name || "Unknown"} • {formatDate(note.createdAt)}
            </p>
            <p className="mt-1 text-sm text-neutral/60">
              {note.user?.email || "Unknown"} • {formatDate(note.updatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary capitalize">
              {note.content?.type || "text"}
            </span>
            <span className="badge badge-outline">
              {note.content?.files?.length || 0} files
            </span>
            <span className="badge badge-outline">
              {note.content?.images?.length || 0} images
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {note.content?.files?.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 p-4"
              >
                <span className="text-lg font-bold text-primary">
                  {file?.originalName || file?.filename || `File ${index + 1}`}
                </span>
                <FiDownload
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(file.url, "_blank");
                  }}
                  size={20}
                  className="text-primary hover:text-secondary cursor-pointer transition-colors"
                />
              </div>
            ))}
          </div>
          {/* Images */}
          <div className="grid grid-cols-3 gap-4">
            {note.content?.images?.map((image, index) => (
              <div className="relative aspect-square" key={index}>
                <img
                  src={image.url}
                  alt={image?.filename || `Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <FiDownload
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(image.url, "_blank");
                  }}
                  size={20}
                  className="absolute top-2 right-2 text-primary hover:text-secondary cursor-pointer transition-colors"
                />
              </div>
            ))}
          </div>

          <pre className="max-h-80 overflow-auto rounded-lg border border-primary/10 bg-primary/5 p-4 whitespace-pre-wrap text-sm leading-6">
            {note.content?.text || "No content"}
          </pre>
        </div>
      </div>

      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default NotePreviewModal;
