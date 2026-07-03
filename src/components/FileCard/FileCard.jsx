// src/pages/Files/FileCard.jsx
import {
  FiClock,
  FiEdit2,
  FiFile,
  FiFolder,
  FiGlobe,
  FiLock,
  FiShare2,
  FiTrash2,
} from "react-icons/fi";
import FileChip from "../../pages/Files/FileChip";
import {
  formatDate,
  getRootFiles,
  getSubfolder,
  getSubfolderFiles,
  getTotalFiles,
} from "../../pages/Files/filesUtils";

const FileCard = ({ item, onEdit, onDelete, variant = "default" }) => {
  const rootFiles = getRootFiles(item);
  const subfolder = getSubfolder(item);
  const subfolderFiles = getSubfolderFiles(item);
  const totalFiles = getTotalFiles(item);
  const isPublic = item.privacy === "public";
  const canEdit = typeof onEdit === "function";
  const canDelete = typeof onDelete === "function";
  const showActions = canEdit || canDelete;
  const isShared = variant === "shared";

  return (
    <article className="flex h-full flex-col rounded-lg border border-primary/20 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-lg bg-primary/10 p-3 text-primary">
            <FiFolder className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">
              {item.folder?.name || "Untitled folder"}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/50">
              <span>{totalFiles} files</span>
              <span className="flex items-center gap-1">
                <FiClock />
                {formatDate(item.updatedAt || item.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`badge gap-1 ${isPublic ? "badge-success" : "badge-neutral"}`}
        >
          {isPublic ? <FiGlobe /> : <FiLock />}
          {isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        {/* Root Files */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/50">
            <FiFile /> Root Files
          </div>
          {rootFiles.length > 0 ? (
            <div className="space-y-2">
              {rootFiles.map((file, index) => (
                <FileChip key={file._id || file.url || index} file={file} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-base-300 py-3 text-center text-sm text-base-content/50">
              Empty
            </p>
          )}
        </section>

        {/* Subfolder */}
        {subfolder?.name || subfolderFiles.length > 0 ? (
          <section className="space-y-2 rounded-lg bg-base-200/60 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/50">
              <FiFolder /> {subfolder?.name || "Subfolder"}
            </div>
            {subfolderFiles.length > 0 ? (
              <div className="space-y-2">
                {subfolderFiles.map((file, index) => (
                  <FileChip key={file._id || file.url || index} file={file} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/50">Empty</p>
            )}
          </section>
        ) : null}
      </div>

      {showActions ? (
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-base-300 pt-4">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <FiEdit2 /> Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="btn btn-error btn-outline btn-sm gap-2"
            >
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      ) : isShared ? (
        <div className="mt-5 flex items-center justify-end border-t border-base-300 pt-4">
          <span className="badge badge-outline gap-1 text-base-content/60">
            <FiShare2 /> Shared with you
          </span>
        </div>
      ) : null}
    </article>
  );
};

export default FileCard;
