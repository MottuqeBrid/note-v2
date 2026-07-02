import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArchive,
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";
import { useAuth } from "../../../hooks/useAuth";
import useAxios from "../../../lib/useAxios";
import { getToken } from "../../../lib/localstoreage";
import { useNavigate } from "react-router";
import NotePreviewModal from "./NotePreviewModal";
import StatCard from "./StatCard";
import NoteTable from "./NoteTable";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getTextPreview = (note) => {
  const text = note?.content?.text || "";
  return text.length > 130 ? `${text.slice(0, 130)}...` : text || "No content";
};

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const app = useAxios();
  const token = getToken("token");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role?.includes?.("admin");

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await app.get("admin/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes(data?.notes || []);
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to load notes",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [app, token]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    const lodeNotes = async () => {
      if (authLoading || !isAdmin) return;
      fetchNotes();
    };
    lodeNotes();
  }, [authLoading, isAdmin, fetchNotes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return notes;

    return notes.filter((note) =>
      [
        note.title,
        note.content?.type,
        note.content?.text,
        note.user?.name,
        note.user?.email,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [notes, search]);

  const stats = useMemo(
    () => ({
      total: notes.length,
      active: notes.filter((note) => !note.deleted).length,
      deleted: notes.filter((note) => note.deleted).length,
      files: notes.reduce(
        (total, note) => total + (note.content?.files?.length || 0),
        0,
      ),
      images: notes.reduce(
        (total, note) => total + (note.content?.images?.length || 0),
        0,
      ),
    }),
    [notes],
  );

  const handleExport = () => {
    const rows = filteredNotes.map((note) => ({
      title: note.title,
      type: note.content?.type,
      author: note.user?.name || "Unknown",
      email: note.user?.email || "",
      deleted: note.deleted ? "Yes" : "No",
      files: note.content?.files?.length || 0,
      images: note.content?.images?.length || 0,
      createdAt: formatDate(note.createdAt),
    }));

    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "admin-notes.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleDelete = async (note) => {
    const result = await Swal.fire({
      title: "Delete note?",
      text: `"${note.title}" will be marked as deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#22c55e",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await app.delete(`admin/notes/${note._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes((prev) =>
        prev.map((item) =>
          item._id === note._id ? { ...item, deleted: true } : item,
        ),
      );

      Swal.fire("Deleted", "Note deleted successfully.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message ||
          "Delete endpoint not found. Add DELETE /admin/notes/:id in backend.",
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
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Notes</h1>
            <p className="mt-1 text-sm text-neutral/60">
              Review all notes, owners, content types, files, and deleted
              status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="input input-bordered flex min-w-0 items-center gap-2 bg-base-100 sm:w-80">
              <FiSearch className="shrink-0 text-primary" />
              <input
                type="text"
                placeholder="Search notes..."
                className="grow"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-neutral/50 transition hover:text-primary"
                >
                  <FiX />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={handleExport}
              className="btn btn-outline btn-primary gap-2"
            >
              <FiDownload />
              Export
            </button>

            <button
              type="button"
              onClick={fetchNotes}
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
          <StatCard
            icon={<FiFileText />}
            label="Total Notes"
            value={stats.total}
          />
          <StatCard icon={<FiArchive />} label="Active" value={stats.active} />
          <StatCard icon={<FiTrash2 />} label="Deleted" value={stats.deleted} />
          <StatCard icon={<FiFile />} label="Files" value={stats.files} />
          <StatCard icon={<FiImage />} label="Images" value={stats.images} />
        </div>

        <p className="mt-4 text-sm text-neutral/60">
          Showing {filteredNotes.length} of {notes.length} notes
        </p>
      </div>

      <NoteTable
        filteredNotes={filteredNotes}
        loading={loading}
        getTextPreview={getTextPreview}
        setSelectedNote={setSelectedNote}
        handleDelete={handleDelete}
        search={search}
      />

      <NotePreviewModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </section>
  );
};

export default AdminNotes;
