import { FiCopy } from "react-icons/fi";
import { useState } from "react";

const NoteCode = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-lg border border-base-300 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-base-200">
        <span className="badge badge-ghost badge-sm">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-xs gap-1"
        >
          <FiCopy size={14} />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-base-300/50">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default NoteCode;
