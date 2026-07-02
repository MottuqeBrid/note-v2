// InputImage.jsx
import { useState, useRef, useCallback } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";

const InputImage = ({ register, index, remove, setValue }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const ALLOWED = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];

  const handleFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;
      if (!ALLOWED.includes(selectedFile.type)) {
        alert("Only images allowed (jpg, png, webp, gif, svg)");
        return;
      }
      setFile(selectedFile);
      setValue(`content.images.${index}.filename`, selectedFile.name);
      setValue(`content.images.${index}._file`, selectedFile);
      setValue(`content.images.${index}.type`, selectedFile.type);

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);

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
        onClick={() => !preview && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg transition-all ${
          dragOver
            ? "border-primary bg-primary/10"
            : preview
              ? "border-green-400"
              : "border-gray-300 hover:border-primary bg-gray-50 cursor-pointer"
        }`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover rounded-lg"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="btn btn-sm btn-white"
              >
                Change
              </button>
            </div>
            {/* File info */}
            <div className="p-2">
              <p className="text-xs text-gray-500 truncate">{file?.name}</p>
              <p className="text-xs text-gray-400">
                {formatSize(file?.size ?? 0)}
              </p>
              {/* Progress */}
              {uploading && (
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              {!uploading && progress === 100 && (
                <p className="text-xs text-green-500">✓ Ready</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <FiUploadCloud className="text-3xl text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {dragOver ? "Drop image here" : "Click or drag image here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WEBP, GIF, SVG · Max 5MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Hidden fields */}
      <input type="hidden" {...register(`content.images.${index}.filename`)} />
      <input type="hidden" {...register(`content.images.${index}.url`)} />
      <input type="hidden" {...register(`content.images.${index}.type`)} />

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

export default InputImage;
