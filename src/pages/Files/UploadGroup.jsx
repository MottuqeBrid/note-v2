// src/pages/Files/UploadGroup.jsx
import { FiUploadCloud } from "react-icons/fi";
import SelectedFileRow from "./SelectedFileRow";

const UploadGroup = ({
  title,
  description,
  files,
  onAddFiles,
  onRemoveFile,
  buttonLabel,
}) => {
  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) onAddFiles(selected);
    e.target.value = "";
  };

  return (
    <div className="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="text-sm font-bold">{title}</label>
          <p className="text-xs text-base-content/50">{description}</p>
        </div>
        <label className="btn btn-outline btn-primary btn-sm gap-2">
          <FiUploadCloud />
          {buttonLabel}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
          />
        </label>
      </div>

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <SelectedFileRow
              key={file.id}
              file={file}
              onRemove={() => onRemoveFile(file.id)}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-base-300 py-4 text-center text-sm text-base-content/50">
          No files selected
        </div>
      )}
    </div>
  );
};

export default UploadGroup;
