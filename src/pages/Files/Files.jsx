// src/pages/Files/Files.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiCheckCircle,
  FiFolderPlus,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../lib/useAxios";
import FileCard from "./FileCard";
import UploadGroup from "./UploadGroup";
import {
  emptyForm,
  getAuthHeaders,
  getRootFiles,
  getSubfolder,
  getSubfolderFiles,
  getTotalFiles,
  mapApiFile,
  mapLocalFile,
  serializeExistingFile,
  serializeUploadedFile,
} from "./filesUtils";
import FolderCardSkeleton from "./FolderCardSkeleton";

const Files = () => {
  const app = useAxios();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, navigate, user]);

  const fetchFiles = useCallback(
    async (notify = false) => {
      if (!user) return;
      notify ? setRefreshing(true) : setLoadingFiles(true);
      try {
        const { data } = await app.get("file", { headers: getAuthHeaders() });
        setFiles(data.files || []);
        if (notify) toast.success(data.message || "Files refreshed");
      } catch (error) {
        if (error.response?.status === 404) {
          setFiles([]);
          if (notify) toast.info("No files found");
          return;
        }
        toast.error(error.response?.data?.message || "Failed to load files");
      } finally {
        setLoadingFiles(false);
        setRefreshing(false);
      }
    },
    [app, user],
  );

  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => fetchFiles(), 0);
    return () => clearTimeout(id);
  }, [fetchFiles, user]);

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;
    return files.filter((item) => {
      const searchable = [
        item.folder?.name,
        item.privacy,
        ...getRootFiles(item).map((f) => f?.originalName || f?.filename || ""),
        getSubfolder(item)?.name,
        ...getSubfolderFiles(item).map(
          (f) => f?.originalName || f?.filename || "",
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [files, search]);

  const stats = useMemo(() => {
    const totalFiles = files.reduce(
      (sum, item) => sum + getTotalFiles(item),
      0,
    );
    const publicFolders = files.filter(
      (item) => item.privacy === "public",
    ).length;
    return {
      folders: files.length,
      totalFiles,
      publicFolders,
      privateFolders: files.length - publicFolders,
    };
  }, [files]);

  const openCreateForm = () => {
    setEditingFile(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingFile(item);
    setForm({
      folderName: item.folder?.name || "",
      privacy: item.privacy || "private",
      rootFiles: getRootFiles(item).map(mapApiFile),
      subfolderName: getSubfolder(item)?.name || "",
      subfolderFiles: getSubfolderFiles(item).map(mapApiFile),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingFile(null);
    setForm(emptyForm);
  };

  const updateForm = (field, value) =>
    setForm((cur) => ({ ...cur, [field]: value }));

  const addFilesToGroup = (group, selected) =>
    setForm((cur) => ({
      ...cur,
      [group]: [...cur[group], ...selected.map(mapLocalFile)],
    }));

  const removeFileFromGroup = (group, id) =>
    setForm((cur) => ({
      ...cur,
      [group]: cur[group].filter((f) => f.id !== id),
    }));

  const resolveFileRecords = async (records) => {
    const newRecords = records.filter((r) => r.rawFile);
    let uploadedFiles = [];

    if (newRecords.length > 0) {
      const formData = new FormData();
      newRecords.forEach((r) => formData.append("files", r.rawFile));
      const { data } = await app.post("upload", formData, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
      });
      uploadedFiles = data.files || [];
      if (uploadedFiles.length < newRecords.length)
        throw new Error("Some files could not be uploaded.");
    }

    let uploadIndex = 0;
    return records
      .map((record) => {
        if (record.rawFile) {
          const uploaded = uploadedFiles[uploadIndex++];
          return serializeUploadedFile(uploaded, record);
        }
        return serializeExistingFile(record);
      })
      .filter((f) => f.filename || f.url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const folderName = form.folderName.trim();
    const subfolderName = form.subfolderName.trim();

    if (!folderName) {
      toast.error("Folder name is required");
      return;
    }
    if (form.subfolderFiles.length > 0 && !subfolderName) {
      toast.error("Subfolder name is required");
      return;
    }

    setSaving(true);
    try {
      const [rootFiles, subfolderFiles] = await Promise.all([
        resolveFileRecords(form.rootFiles),
        resolveFileRecords(form.subfolderFiles),
      ]);

      const payload = {
        folder: { name: folderName, files: rootFiles },
        privacy: form.privacy,
      };

      if (subfolderName || subfolderFiles.length > 0) {
        payload.folder.subfolder = {
          name: subfolderName || "Subfolder",
          files: subfolderFiles,
        };
      }

      const request = editingFile
        ? app.patch(`file/${editingFile._id}`, payload, {
            headers: getAuthHeaders(),
          })
        : app.post("file", payload, { headers: getAuthHeaders() });

      const { data } = await request;
      if (data.success === false)
        throw new Error(data.message || "Request failed");

      toast.success(
        data.message || (editingFile ? "Folder updated" : "Folder created"),
      );
      closeForm();
      await fetchFiles();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Delete folder?",
      text: "This folder will be removed from your files.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const { data } = await app.delete(`file/${item._id}`, {
        headers: getAuthHeaders(),
      });
      toast.success(data.message || "Folder deleted");
      await fetchFiles();
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info("Folder is no longer available");
        await fetchFiles();
        return;
      }
      Swal.fire(
        "Error",
        error.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Files
          </p>
          <h1 className="text-3xl font-bold">File Library</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => fetchFiles(true)}
            disabled={refreshing}
            className="btn btn-outline btn-primary gap-2"
          >
            {refreshing ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FiRefreshCcw />
            )}
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="btn btn-primary gap-2"
          >
            <FiPlus /> New Folder
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Folders", value: stats.folders },
          { label: "Files", value: stats.totalFiles },
          { label: "Public", value: stats.publicFolders },
          { label: "Private", value: stats.privateFolders },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-base-300 bg-base-100 p-4"
          >
            <p className="text-sm text-base-content/50">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* File Grid */}
      {loadingFiles ? (
        <div className="flex min-h-80 items-center justify-center">
          {Array.from({ length: 6 }).map((_, index) => (
            <FolderCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((item) => (
            <FileCard
              key={item._id}
              item={item}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-100 px-4 text-center">
          <FiFolderPlus className="h-12 w-12 text-primary/60" />
          <h2 className="mt-4 text-xl font-bold">
            {search ? "No matching files" : "No files yet"}
          </h2>
          <button
            type="button"
            onClick={openCreateForm}
            className="btn btn-primary btn-sm mt-4 gap-2"
          >
            <FiPlus /> New Folder
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="my-auto w-full max-w-3xl rounded-lg bg-base-100 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingFile ? "Edit Folder" : "New Folder"}
                </h2>
                <p className="text-sm text-base-content/50">
                  {editingFile ? "Update folder files" : "Create a file folder"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="btn btn-ghost btn-square"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="form-control">
                  <span className="label">
                    <span className="label-text font-bold">Folder Name</span>
                  </span>
                  <input
                    type="text"
                    value={form.folderName}
                    onChange={(e) => updateForm("folderName", e.target.value)}
                    className="input input-bordered"
                    placeholder="Project files"
                    required
                  />
                </label>
                <label className="form-control">
                  <span className="label">
                    <span className="label-text font-bold">Privacy</span>
                  </span>
                  <select
                    value={form.privacy}
                    onChange={(e) => updateForm("privacy", e.target.value)}
                    className="select select-bordered"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </label>
              </div>

              <UploadGroup
                title="Folder Files"
                description="Files stored directly in this folder"
                files={form.rootFiles}
                buttonLabel="Add Files"
                onAddFiles={(f) => addFilesToGroup("rootFiles", f)}
                onRemoveFile={(id) => removeFileFromGroup("rootFiles", id)}
              />

              <div className="space-y-3">
                <label className="form-control">
                  <span className="label">
                    <span className="label-text font-bold">Subfolder Name</span>
                    <span className="label-text-alt">Optional</span>
                  </span>
                  <input
                    type="text"
                    value={form.subfolderName}
                    onChange={(e) =>
                      updateForm("subfolderName", e.target.value)
                    }
                    className="input input-bordered"
                    placeholder="Archive"
                  />
                </label>
                <UploadGroup
                  title="Subfolder Files"
                  description="Files stored inside the optional subfolder"
                  files={form.subfolderFiles}
                  buttonLabel="Add Files"
                  onAddFiles={(f) => addFilesToGroup("subfolderFiles", f)}
                  onRemoveFile={(id) =>
                    removeFileFromGroup("subfolderFiles", id)
                  }
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-base-300 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary gap-2"
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <FiCheckCircle />
                  )}
                  {saving ? "Saving..." : editingFile ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
