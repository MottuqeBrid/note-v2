// InputFile.jsx
import { useState, useRef, useCallback } from "react";
import { FiTrash2, FiUploadCloud, FiFile } from "react-icons/fi";
import { IoIosReturnRight } from "react-icons/io";

const InputFile = ({ register, index, remove, setValue, existingFile }) => {
  // const [file, setFile] = useState(null);
  // Pre-populate with existing uploaded file (no raw _file blob)
  const [file, setFile] = useState(
    existingFile
      ? { name: existingFile.originalName || existingFile.filename, size: 0 }
      : null,
  );
  const [isExisting, setIsExisting] = useState(!!existingFile);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;
      setIsExisting(false); // switching away from existing
      setFile(selectedFile);
      setValue(`content.files.${index}.filename`, selectedFile.name);
      setValue(`content.files.${index}._file`, selectedFile);
      setValue(`content.files.${index}.type`, selectedFile.type);
      // Fake progress
      setUploading(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 80);
    },
    [index, setValue],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mb-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all flex items-center gap-3 ${
          dragOver
            ? "border-primary bg-primary/10"
            : file
              ? "border-green-400"
              : "border-gray-300 hover:border-primary"
        }`}
      >
        <FiUploadCloud
          className={`text-2xl shrink-0 ${file ? "text-green-500" : "text-gray-400"}`}
        />

        {file ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate flex items-center gap-1">
              <FiFile className="text-gray-500" /> {file.name}
            </p>
            {/* Show size only for newly picked files */}
            {!isExisting && (
              <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
            )}
            {isExisting && (
              <p className="text-xs text-blue-400 flex items-center gap-1 m-2">
                <IoIosReturnRight />
                <span>Already uploaded · click to replace</span>
              </p>
            )}
            {uploading && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {!uploading && progress === 100 && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <IoIosReturnRight />
                <span>Ready</span>
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-sm text-gray-500">
              {dragOver ? "Drop file here" : "Click or drag file here"}
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <input type="hidden" {...register(`content.files.${index}.filename`)} />
      <input type="hidden" {...register(`content.files.${index}.url`)} />
      <input type="hidden" {...register(`content.files.${index}.type`)} />

      <div className="flex justify-end mt-1">
        <button
          type="button"
          onClick={() => remove(index)}
          className="btn btn-sm btn-error btn-outline gap-1"
        >
          <FiTrash2 /> Remove
        </button>
      </div>
    </div>
  );
};

export default InputFile;
