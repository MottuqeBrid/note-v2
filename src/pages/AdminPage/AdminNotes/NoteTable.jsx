import {
  FiCalendar,
  FiEye,
  FiFile,
  FiFileText,
  FiImage,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
const NoteTable = ({
  filteredNotes,
  loading,
  getTextPreview,
  setSelectedNote,
  handleDelete,
  search,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-primary/20 bg-base-100 shadow-sm">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : filteredNotes.length ? (
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-primary/10 text-neutral">
              <tr>
                <th>Note</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Assets</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredNotes.map((note) => (
                <tr key={note._id} className="hover:bg-primary/5">
                  <td className="max-w-md">
                    <p className="font-semibold">{note.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral/60">
                      {getTextPreview(note)}
                    </p>
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FiUser />
                      </span>
                      <div>
                        <p className="font-medium">
                          {note.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-neutral/50">
                          {note.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-primary badge-sm capitalize">
                      {note.content?.type || "text"}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-2 text-sm text-neutral/60">
                      <span className="flex items-center gap-1">
                        <FiFile />
                        {note.content?.files?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiImage />
                        {note.content?.images?.length || 0}
                      </span>
                    </div>
                  </td>

                  <td>
                    {note.deleted ? (
                      <span className="badge badge-error badge-sm">
                        Deleted
                      </span>
                    ) : (
                      <span className="badge badge-success badge-sm">
                        Active
                      </span>
                    )}
                  </td>

                  <td>
                    <span className="flex items-center gap-2 text-sm text-neutral/60">
                      <FiCalendar className="text-primary" />
                      {formatDate(note.createdAt)}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square tooltip"
                        data-tip="Preview"
                        onClick={() => setSelectedNote(note)}
                      >
                        <FiEye className="text-primary" />
                      </button>

                      {!note.deleted && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square tooltip"
                          data-tip="Delete"
                          onClick={() => handleDelete(note)}
                        >
                          <FiTrash2 className="text-error" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-20 text-center text-neutral/50">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <FiFileText size={34} />
          </div>
          <p className="font-medium">
            {search ? "No notes match your search." : "No notes found."}
          </p>
        </div>
      )}
    </div>
  );
};

export default NoteTable;
