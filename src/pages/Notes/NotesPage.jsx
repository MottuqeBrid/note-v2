import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import Swal from "sweetalert2";
import useAxios from "../../lib/useAxios";
import AddNoteButton from "../../components/Notes/AddNoteButton";
import NotesList from "../../components/Notes/NotesList";
import NoteModal from "../../components/Notes/NoteModal";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const axios = useAxios();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/notes");
      setNotes(data?.notes || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/notes");
        setNotes(data?.notes || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [axios]);

  const filtered = search
    ? notes.filter((n) => {
        const q = search.toLowerCase();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
    : notes;

  const handleDelete = async (note) => {
    const result = await Swal.fire({
      title: "Delete note?",
      text: `"${note.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/note/${note.id}`);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      Swal.fire("Deleted", "", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Your Notes</h1>
          <p className="text-sm text-base-content/60">
            {filtered.length} note{filtered.length !== 1 && "s"} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="input input-bordered flex items-center gap-2">
            <FiSearch className="text-base-content/40" />
            <input
              type="text"
              placeholder="Search notes…"
              className="grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <AddNoteButton onClick={() => setEditingNote("new")} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <NotesList
          notes={filtered}
          onEdit={setEditingNote}
          onDelete={handleDelete}
        />
      )}

      <NoteModal
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onSaved={fetchNotes}
      />
    </div>
  );
};

export default NotesPage;
