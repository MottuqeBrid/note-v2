import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiArchive,
  FiCalendar,
  FiDownload,
  FiFile,
  FiFolder,
  FiGlobe,
  FiLock,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";
import { useAuth } from "../../../hooks/useAuth";
import useAxios from "../../../lib/useAxios";
import { getToken } from "../../../lib/localstoreage";
import FileChip from "../../Files/FileChip";
import {
  formatDate,
  getDisplayName,
  getRootFiles,
  getSubfolder,
  getSubfolderFiles,
  getTotalFiles,
} from "../../Files/filesUtils";
import StatCard from "../AdminNotes/StatCard";
import { FaWindowRestore } from "react-icons/fa";
import { toast } from "react-toastify";

const getOwner = (file) => {
  if (!file?.owner || typeof file.owner === "string") {
    return { name: "Unknown owner", email: "" };
  }

  return {
    name: file.owner.name || "Unknown owner",
    email: file.owner.email || "",
  };
};

const isDeletedFile = (file) => Boolean(file?.isDeleted || file?.deleted);

const getSearchText = (file) => {
  const owner = getOwner(file);
  const subfolder = getSubfolder(file);

  return [
    file.folder?.name,
    file.privacy,
    owner.name,
    owner.email,
    subfolder?.name,
    ...getRootFiles(file).map(getDisplayName),
    ...getSubfolderFiles(file).map(getDisplayName),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const exportFiles = (files) => {
  const rows = files.map((file) => {
    const owner = getOwner(file);

    return {
      id: file._id,
      folder: file.folder?.name || "Untitled folder",
      owner: owner.name,
      ownerEmail: owner.email,
      privacy: file.privacy || "private",
      status: isDeletedFile(file) ? "Deleted" : "Active",
      rootFiles: getRootFiles(file).length,
      subfolder: getSubfolder(file)?.name || "",
      subfolderFiles: getSubfolderFiles(file).length,
      totalFiles: getTotalFiles(file),
      createdAt: formatDate(file.createdAt),
      updatedAt: formatDate(file.updatedAt),
    };
  });

  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "admin-files.json";
  link.click();

  URL.revokeObjectURL(url);
};

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const app = useAxios();
  const token = getToken("token");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isAdmin = useMemo(() => {
    if (Array.isArray(user?.role)) return user.role.includes("admin");
    return user?.role === "admin";
  }, [user]);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await app.get("admin/files", {
        headers: authHeaders,
      });

      setFiles(data?.files || []);
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const { data } = await app.get("admin/file", {
            headers: authHeaders,
          });
          setFiles(data?.files || []);
          return;
        } catch (fallbackError) {
          Swal.fire(
            "Error",
            fallbackError?.response?.data?.message || "Failed to load files",
            "error",
          );
          return;
        }
      }

      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to load files",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [app, authHeaders]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    const timerId = setTimeout(() => fetchFiles(), 0);
    return () => clearTimeout(timerId);
  }, [authLoading, isAdmin, fetchFiles]);

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;

    return files.filter((file) => getSearchText(file).includes(query));
  }, [files, search]);

  const stats = useMemo(
    () => ({
      total: files.length,
      active: files.filter((file) => !isDeletedFile(file)).length,
      deleted: files.filter(isDeletedFile).length,
      public: files.filter((file) => file.privacy === "public").length,
      fileCount: files.reduce((total, file) => total + getTotalFiles(file), 0),
    }),
    [files],
  );

  const handleDelete = async (file) => {
    const folderName = file.folder?.name || "this folder";
    const result = await Swal.fire({
      title: "Delete file folder?",
      text: `"${folderName}" will be marked as deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#22c55e",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await app.delete(`admin/files/${file._id}`, {
        headers: authHeaders,
      });
      toast.success(data?.message || "File folder deleted successfully.");
      setFiles((previous) =>
        previous.map((item) =>
          item._id === file._id
            ? { ...item, isDeleted: true, deleted: true }
            : item,
        ),
      );

      Swal.fire("Deleted", "File folder deleted successfully.", "success");
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          await app.delete(`admin/file/${file._id}`, {
            headers: authHeaders,
          });
          setFiles((previous) =>
            previous.map((item) =>
              item._id === file._id
                ? { ...item, isDeleted: true, deleted: true }
                : item,
            ),
          );
          Swal.fire("Deleted", "File folder deleted successfully.", "success");
          return;
        } catch (fallbackError) {
          Swal.fire(
            "Error",
            fallbackError?.response?.data?.message || "Delete failed",
            "error",
          );
          return;
        }
      }

      Swal.fire(
        "Error",
        error?.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  const handleRestore = async (file) => {
    const folderName = file.folder?.name || "this folder";
    const result = await Swal.fire({
      title: "Restore file folder?",
      text: `"${folderName}" will be restored.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, restore",
    });

    if (!result.isConfirmed) return;

    try {
      await app.patch(
        `admin/files/${file._id}`,
        {
          isDeleted: false,
        },
        {
          headers: authHeaders,
        },
      );
      setFiles((previous) =>
        previous.map((item) =>
          item._id === file._id
            ? { ...item, isDeleted: false, deleted: false }
            : item,
        ),
      );

      Swal.fire("Restored", "File folder restored successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Restore failed",
        "error",
      );
    }
  };

  if (authLoading) return <Loading />;

  return (
    <section className="space-y-6 p-4 text-neutral md:p-6">
      <div className="rounded-xl border border-primary/20 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Files</h1>
            <p className="mt-1 text-sm text-neutral/60">
              Review all folders, owners, shared assets, privacy, and deleted
              status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="input input-bordered flex min-w-0 items-center gap-2 bg-base-100 sm:w-80">
              <FiSearch className="shrink-0 text-primary" />
              <input
                type="text"
                placeholder="Search files..."
                className="grow"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-neutral/50 transition hover:text-primary"
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={() => exportFiles(filteredFiles)}
              className="btn btn-outline btn-primary gap-2"
            >
              <FiDownload />
              Export
            </button>

            <button
              type="button"
              onClick={fetchFiles}
              className="btn btn-primary gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FiRefreshCw />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={<FiFolder />} label="Folders" value={stats.total} />
          <StatCard icon={<FiArchive />} label="Active" value={stats.active} />
          <StatCard icon={<FiTrash2 />} label="Deleted" value={stats.deleted} />
          <StatCard icon={<FiGlobe />} label="Public" value={stats.public} />
          <StatCard icon={<FiFile />} label="Files" value={stats.fileCount} />
        </div>

        <p className="mt-4 text-sm text-neutral/60">
          Showing {filteredFiles.length} of {files.length} folder
          {files.length !== 1 && "s"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/20 bg-base-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : filteredFiles.length ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-primary/10 text-neutral">
                <tr>
                  <th>Folder</th>
                  <th>Owner</th>
                  <th>Files</th>
                  <th>Privacy</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFiles.map((file) => {
                  const owner = getOwner(file);
                  const rootFiles = getRootFiles(file);
                  const subfolder = getSubfolder(file);
                  const subfolderFiles = getSubfolderFiles(file);
                  const deleted = isDeletedFile(file);

                  return (
                    <tr
                      key={file._id}
                      className={`hover:bg-primary/5 ${deleted ? "opacity-65" : ""}`}
                    >
                      <td className="min-w-64">
                        <div className="flex items-start gap-3">
                          <span className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FiFolder />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {file.folder?.name || "Untitled folder"}
                            </p>
                            <p className="mt-1 text-xs text-neutral/50">
                              {getTotalFiles(file)} file
                              {getTotalFiles(file) !== 1 && "s"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex min-w-48 items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FiUser />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{owner.name}</p>
                            <p className="truncate text-xs text-neutral/50">
                              {owner.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="min-w-80 max-w-lg">
                        <div className="space-y-3">
                          {rootFiles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {rootFiles.slice(0, 3).map((item, index) => (
                                <div
                                  key={item._id || item.url || index}
                                  className="max-w-56"
                                >
                                  <FileChip file={item} />
                                </div>
                              ))}
                              {rootFiles.length > 3 && (
                                <span className="badge badge-ghost">
                                  +{rootFiles.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral/50">
                              No root files
                            </p>
                          )}

                          {(subfolder?.name || subfolderFiles.length > 0) && (
                            <div className="rounded-lg bg-base-200/60 p-2">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral/50">
                                {subfolder?.name || "Subfolder"}
                              </p>
                              {subfolderFiles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {subfolderFiles
                                    .slice(0, 2)
                                    .map((item, index) => (
                                      <div
                                        key={item._id || item.url || index}
                                        className="max-w-56"
                                      >
                                        <FileChip file={item} />
                                      </div>
                                    ))}
                                  {subfolderFiles.length > 2 && (
                                    <span className="badge badge-ghost">
                                      +{subfolderFiles.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-neutral/50">Empty</p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge gap-1 ${
                            file.privacy === "public"
                              ? "badge-success"
                              : "badge-neutral"
                          }`}
                        >
                          {file.privacy === "public" ? <FiGlobe /> : <FiLock />}
                          {file.privacy || "private"}
                        </span>
                      </td>

                      <td>
                        {deleted ? (
                          <span className="badge badge-error badge-sm">
                            Deleted
                          </span>
                        ) : (
                          <span className="badge badge-success badge-sm">
                            Active
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="flex items-center gap-2 text-sm text-neutral/60">
                          <FiCalendar className="text-primary" />
                          {formatDate(file.createdAt)}
                        </span>
                      </td>

                      <td>
                        <div className="flex justify-end">
                          {!deleted ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm btn-square tooltip"
                              data-tip="Delete"
                              onClick={() => handleDelete(file)}
                              aria-label={`Delete ${file.folder?.name || "file folder"}`}
                            >
                              <FiTrash2 className="text-error" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm btn-square tooltip"
                              data-tip="Restore"
                              onClick={() => handleRestore(file)}
                              aria-label={`Restore ${file.folder?.name || "file folder"}`}
                            >
                              <FaWindowRestore className="text-error" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-20 text-center text-neutral/50">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FiFolder size={34} />
            </div>
            <p className="font-medium">
              {search ? "No files match your search." : "No files found."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminFiles;
