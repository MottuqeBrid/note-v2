// src/pages/Files/filesUtils.js
import { getToken } from "../../lib/localstoreage";

export const FILE_CATEGORIES = ["file", "image", "video", "audio", "other"];

export const FILE_META = {
  file: {
    label: "File",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  image: {
    label: "Image",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  video: {
    label: "Video",
    badge: "bg-sky-50 text-sky-600 border-sky-200",
  },
  audio: {
    label: "Audio",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
  },
  other: {
    label: "Other",
    badge: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
};

export const emptyForm = {
  folderName: "",
  privacy: "private",
  rootFiles: [],
  subfolderName: "",
  subfolderFiles: [],
};

export const getAuthHeaders = () => {
  const token = getToken("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createRecordId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const formatSize = (bytes = 0) => {
  if (!bytes) return "Uploaded";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

export const classifyFile = (type = "", filename = "") => {
  const normalizedType = String(type).toLowerCase();
  const extension = filename.split(".").pop()?.toLowerCase();

  if (FILE_CATEGORIES.includes(normalizedType)) return normalizedType;
  if (normalizedType.startsWith("image/")) return "image";
  if (normalizedType.startsWith("video/")) return "video";
  if (normalizedType.startsWith("audio/")) return "audio";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension))
    return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(extension)) return "audio";
  return normalizedType || extension ? "file" : "other";
};

export const getDisplayName = (file) =>
  file?.originalName || file?.filename || "Untitled file";

export const getRootFiles = (item) => item?.folder?.files || [];

export const getSubfolder = (item) => item?.folder?.subfolder || null;

export const getSubfolderFiles = (item) => getSubfolder(item)?.files || [];

export const getTotalFiles = (item) =>
  getRootFiles(item).length + getSubfolderFiles(item).length;

export const mapApiFile = (file, index) => ({
  id: file?._id || file?.url || `${getDisplayName(file)}-${index}`,
  filename: getDisplayName(file),
  url: file?.url || "",
  type: classifyFile(file?.type, getDisplayName(file)),
  rawFile: null,
  sourceType: file?.type || "",
  size: 0,
});

export const mapLocalFile = (file) => ({
  id: createRecordId(),
  filename: file.name,
  url: "",
  type: classifyFile(file.type, file.name),
  rawFile: file,
  sourceType: file.type,
  size: file.size,
});

export const serializeUploadedFile = (uploaded, fallback) => ({
  filename: uploaded?.originalName || uploaded?.filename || fallback.filename,
  url: uploaded?.url || fallback.url || "",
  type: classifyFile(
    uploaded?.type || fallback.sourceType || fallback.type,
    uploaded?.originalName || uploaded?.filename || fallback.filename,
  ),
});

export const serializeExistingFile = (file) => ({
  filename: file.filename,
  url: file.url,
  type: classifyFile(file.type, file.filename),
});
