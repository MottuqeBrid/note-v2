// src/pages/Files/SelectedFileRow.jsx
import { FiX } from "react-icons/fi";
import {
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiAlertCircle,
} from "react-icons/fi";
import { FILE_META, formatSize } from "./filesUtils";

const ICONS = {
  file: FiFile,
  image: FiImage,
  video: FiVideo,
  audio: FiMusic,
  other: FiAlertCircle,
};

const SelectedFileRow = ({ file, onRemove }) => {
  const meta = FILE_META[file.type] || FILE_META.file;
  const Icon = ICONS[file.type] || FiFile;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2">
      <span className={`rounded-md border p-2 ${meta.badge}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{file.filename}</p>
        <p className="text-xs text-base-content/50">
          {file.rawFile ? formatSize(file.size) : "Uploaded"}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-ghost btn-square btn-sm"
        aria-label={`Remove ${file.filename}`}
      >
        <FiX />
      </button>
    </li>
  );
};

export default SelectedFileRow;
