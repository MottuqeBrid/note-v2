import { FiFile, FiDownload } from "react-icons/fi";

const NoteFile = ({ url, name }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-200 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <FiFile className="text-primary" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name || url}</p>
        <p className="text-xs text-base-content/50">Click to download</p>
      </div>
      <FiDownload
        size={16}
        className="text-base-content/30 group-hover:text-primary transition-colors"
      />
    </a>
  );
};

export default NoteFile;
