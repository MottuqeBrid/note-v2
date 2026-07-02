// src/components/FileUpload.tsx
import { useState, useRef, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CONTENT_TYPES = [
  "text",
  "markdown",
  "html",
  "htmlc",
  "code",
  "python",
  "javascript",
  "json",
  "jsonc",
  "csv",
  "xml",
  "sql",
  "yaml",
  "yamlc",
  "toml",
  "tomlc",
  "css",
  "scss",
  "less",
  "java",
  "go",
  "ruby",
  "php",
  "rust",
  "swift",
  "kotlin",
  "csharp",
  "cpp",
  "c",
  "bash",
  "powershell",
  "R",
  "Rmd",
  "dart",
  "perl",
  "lua",
  "haskell",
  "elixir",
  "text",
  "markdown",
  "html",
  "htmlc",
  "code",
  "python",
  "javascript",
  "json",
  "jsonc",
  "csv",
  "xml",
  "sql",
  "yaml",
  "yamlc",
  "Rmd",
  "dart",
  "perl",
  "lua",
  "haskell",
  "elixir",
];

function getFileIcon(file) {
  if (file.type.startsWith("image/")) return "🖼️";
  if (file.type.startsWith("video/")) return "🎬";
  if (file.type.startsWith("audio/")) return "🎵";
  if (file.type === "application/pdf") return "📕";
  if (file.type === "application/zip") return "🗜️";
  return "📄";
}

export default function FileUpload() {
  const [mode, setMode] = useState("file");
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef < HTMLInputElement > null;

  const getToken = () => localStorage.getItem("token") ?? "";

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped].slice(0, 10));
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, 10));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setFiles([]);
    setContent("");
    setFilename("");
    setResults([]);
    setErrors([]);
    setProgress(0);
  };

  const handleUpload = async () => {
    setUploading(true);
    setResults([]);
    setErrors([]);
    setProgress(0);

    try {
      const formData = new FormData();

      if (mode === "content") {
        if (!content.trim()) {
          setErrors(["Content cannot be empty"]);
          return;
        }
        formData.append("contentType", contentType);
        formData.append("content", content);
        if (filename) formData.append("filename", filename);
      } else {
        if (files.length === 0) {
          setErrors(["Please select at least one file"]);
          return;
        }
        files.forEach((file) => formData.append("files", file));
      }

      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total ?? 1));
          setProgress(percent);
        },
      });

      if (mode === "content" && data.file) {
        setResults([data.file]);
      } else if (data.files) {
        setResults(data.files);
      }

      if (data.errors?.length) {
        setErrors(data.errors);
      }

      setFiles([]);
      setContent("");
      setFilename("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrors([err.response?.data?.message ?? "Upload failed"]);
      } else {
        setErrors(["Network error. Please try again."]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-slate-900 rounded-xl text-slate-100 font-mono">
      <h2 className="text-xl font-bold mb-6 text-slate-200">File Upload</h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        {["file", "content"].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            {m === "file" ? "File Upload" : "Code / Text"}
          </button>
        ))}
      </div>

      {/* ─── File Upload Mode ─── */}
      {mode === "file" && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-indigo-500 bg-indigo-950"
                : "border-slate-700 bg-slate-800 hover:border-slate-500"
            }`}
          >
            <p className="text-slate-400 text-base">
              {dragOver ? "Drop files here" : "Click or drag files here"}
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Max 10 files · Images → ImgBB · Files → Supabase
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-3"
                >
                  <span className="text-xl">{getFileIcon(file)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSize(file.size)} ·{" "}
                      <span
                        className={
                          file.type.startsWith("image/")
                            ? "text-pink-400"
                            : "text-blue-400"
                        }
                      >
                        {file.type.startsWith("image/") ? "ImgBB" : "Supabase"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-300 text-sm px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Content Upload Mode ─── */}
      {mode === "content" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              Filename (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. script.py"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Content</label>
            <textarea
              rows={10}
              placeholder={`Write your ${contentType} content here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-slate-600 text-right">
              {content.length} characters
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full mt-4 py-3 rounded-lg text-sm font-semibold transition-all ${
          uploading
            ? "bg-indigo-800 text-indigo-300 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
        }`}
      >
        {uploading ? `Uploading... ${progress}%` : "Upload"}
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 bg-red-950 border border-red-500 rounded-lg p-4">
          {errors.map((err, i) => (
            <p key={i} className="text-red-400 text-sm">
              ⚠️ {err}
            </p>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 bg-green-950 border border-green-500 rounded-lg p-4">
          <h3 className="text-green-400 text-sm font-semibold mb-3">
            ✅ Uploaded Successfully
          </h3>
          <div className="flex flex-col gap-2">
            {results.map((result, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">
                    {result.isImage ? "🖼️" : "📄"}{" "}
                    {result.originalName ?? result.filename}
                  </p>
                  <p className="text-xs text-slate-500">
                    {result.type} · {formatSize(result.size)} ·{" "}
                    <span
                      className={
                        result.isImage ? "text-pink-400" : "text-blue-400"
                      }
                    >
                      {result.isImage ? "ImgBB" : "Supabase"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 ml-3">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 text-xs border border-indigo-700 rounded px-2 py-1 hover:bg-indigo-900"
                  >
                    View ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
