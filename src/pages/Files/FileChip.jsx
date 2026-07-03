// src/pages/Files/FileChip.jsx
import { FiExternalLink } from "react-icons/fi";
import { FILE_META, classifyFile, getDisplayName } from "./filesUtils";

const FileChip = ({ file }) => {
  const category = classifyFile(file?.type, getDisplayName(file));
  const meta = FILE_META[category] || FILE_META.file;
  const name = getDisplayName(file);

  const chip = (
    <>
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${meta.badge}`}
      >
        {meta.label}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {name}
      </span>
    </>
  );

  if (!file?.url) {
    return (
      <span className="flex min-w-0 items-center gap-2 rounded-lg border border-dashed border-base-300 px-3 py-2 text-base-content/60">
        {chip}
      </span>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 transition hover:border-primary hover:bg-primary/5"
    >
      {chip}
      <FiExternalLink className="h-4 w-4 shrink-0 text-base-content/40" />
    </a>
  );
};

export default FileChip;
