import { memo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeView = ({ code = "", language = "text", cls = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className={`relative w-full overflow-x-auto ${cls}`}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <SyntaxHighlighter
        className="w-full"
        language={language || "text"}
        style={vscDarkPlus}
        showLineNumbers
        wrapLines={true}
        startingLineNumber={1}
        wrapLongLines={true}
        lineProps={{ style: { wordBreak: "break-all" } }}
        customStyle={{ margin: 0, borderRadius: "0.5rem" }}
      >
        {code.trimEnd()}
      </SyntaxHighlighter>
    </div>
  );
};

export default memo(CodeView);
