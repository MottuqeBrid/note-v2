import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiFolderPlus,
  FiGlobe,
  FiRefreshCcw,
  FiSearch,
  FiShare2,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import FileCard from "../../components/FileCard/FileCard";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../lib/useAxios";
import FolderCardSkeleton from "../Files/FolderCardSkeleton";
import {
  getAuthHeaders,
  getDisplayName,
  getRootFiles,
  getSubfolder,
  getSubfolderFiles,
  getTotalFiles,
} from "../Files/filesUtils";

const getOwnerName = (item) => {
  if (typeof item?.owner === "string") return "";
  return item?.owner?.name || item?.owner?.email || "";
};

const SharedFilesPage = () => {
  const app = useAxios();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, navigate, user]);

  const fetchSharedFiles = useCallback(
    async (notify = false) => {
      if (!user) return;
      notify ? setRefreshing(true) : setLoadingFiles(true);

      try {
        const { data } = await app.get("file/shared", {
          headers: getAuthHeaders(),
        });

        setFiles(data.files || []);
        if (notify) toast.success(data.message || "Shared files refreshed");
      } catch (error) {
        if (error.response?.status === 404) {
          setFiles([]);
          if (notify) toast.info("No shared files found");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load shared files",
        );
      } finally {
        setLoadingFiles(false);
        setRefreshing(false);
      }
    },
    [app, user],
  );

  useEffect(() => {
    if (!user) return;
    const timerId = setTimeout(() => fetchSharedFiles(), 0);
    return () => clearTimeout(timerId);
  }, [fetchSharedFiles, user]);

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;

    return files.filter((item) => {
      const searchable = [
        item.folder?.name,
        item.privacy,
        getOwnerName(item),
        ...getRootFiles(item).map(getDisplayName),
        getSubfolder(item)?.name,
        ...getSubfolderFiles(item).map(getDisplayName),
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
    const owners = new Set(
      files.map((item) => getOwnerName(item) || item.owner).filter(Boolean),
    );
    const publicFolders = files.filter(
      (item) => item.privacy === "public",
    ).length;

    return {
      folders: files.length,
      totalFiles,
      owners: owners.size,
      publicFolders,
    };
  }, [files]);

  if (loading || (!user && loadingFiles)) {
    return (
      <div className="space-y-6 px-4 py-6">
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <FolderCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-base-100 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="rounded-lg bg-primary/10 p-3 text-primary">
            <FiShare2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Shared Files
            </p>
            <h1 className="text-3xl font-bold">Files Shared With You</h1>
            <p className="mt-1 max-w-2xl text-sm text-base-content/55">
              Browse folders other users gave you access to. Shared folders are
              read-only here.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchSharedFiles(true)}
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
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: FiFolderPlus, label: "Shared Folders", value: stats.folders },
          { icon: FiShare2, label: "Files", value: stats.totalFiles },
          { icon: FiUsers, label: "Owners", value: stats.owners },
          { icon: FiGlobe, label: "Public", value: stats.publicFolders },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-base-300 bg-base-100 p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
          >
            <div className="mb-3 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-base-content/50">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search shared folders..."
          className="input input-bordered w-full pl-10"
        />
      </div>

      {loadingFiles ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <FolderCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((item) => (
            <FileCard key={item._id} item={item} variant="shared" />
          ))}
        </div>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-100 px-4 text-center">
          <FiShare2 className="h-12 w-12 text-primary/60" />
          <h2 className="mt-4 text-xl font-bold">
            {search ? "No matching shared files" : "No shared files yet"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-base-content/50">
            {search
              ? "Try another folder, owner, or file name."
              : "Shared folders will appear here when another user grants you access."}
          </p>
        </div>
      )}
    </div>
  );
};

export default SharedFilesPage;
