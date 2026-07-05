// NotesPage.jsx
import { useEffect, useState } from "react";
import NoteCard from "./NoteCard";
import AddNotes from "./AddNotes";
import { useAuth } from "./../../hooks/useAuth";
import { useNavigate } from "react-router";
import useAxios from "../../lib/useAxios";
import { FaPlus } from "react-icons/fa";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import EditNote from "./EditNote";
import { getToken } from "../../lib/localstoreage";
import NoteCardSkeleton from "./NoteCardSkeleton";

const NotesPage = () => {
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [showEditNoteForm, setShowEditNoteForm] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const app = useAxios();

  const { user, loading } = useAuth();

  const fetchNotes = async (notify = false) => {
    try {
      const token = getToken("token");
      const { data: response } = await app.get("note", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (notify) {
        toast.success(response.message || "Notes fetched successfully");
      }
      setNotes(response.notes || []);
    } catch (error) {
      if (notify) {
        toast.error(error.message || "An error occurred while fetching notes.");
      }
      return [];
    }
  };
  useEffect(() => {
    const searchNotes = async () => {
      try {
        if (!search) {
          await fetchNotes();
          return;
        }
        const token = getToken("token");
        const { data: response } = await app.get(
          `note/search?query=${search}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setNotes(response.notes || []);
      } catch (error) {
        toast.error(
          error.message || "An error occurred while searching notes.",
        );
      }
    };
    searchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    if (!loading && user && !user.isVerified) {
      navigate("/verify", { state: { email: user.email } });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    const loadNotes = async () => {
      // Fetch notes from the API and set them in state
      await fetchNotes();
    };

    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user && !loading) {
    return navigate("/login");
  }

  return (
    <div className="p-4">
      <div className="w-full flex justify-between items-center gap-4 mt-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchNotes(true)}
            className="bg-primary hover:bg-secondary font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
          >
            <span className="text-xl leading-none">
              <FiRefreshCcw size={16} className="w-4 h-4" />
            </span>
          </button>
          <button
            onClick={() => setShowAddNoteForm(true)}
            className="bg-primary hover:bg-secondary font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
          >
            <span className="text-xl leading-none">
              <FaPlus size={16} className="w-4 h-4" />
            </span>
            Add Note
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {loading &&
          !user &&
          Array.from({ length: 6 }).map((_, index) => (
            <NoteCardSkeleton key={index} />
          ))}
        {(notes.length === 0 && <p>No notes found</p>) ||
          notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              fetchNotes={fetchNotes}
              setShowEditNoteForm={setShowEditNoteForm}
              setEditNote={setEditNote}
            />
          ))}
      </div>

      {showAddNoteForm && (
        <AddNotes
          fetchNotes={fetchNotes}
          setShowAddNoteForm={setShowAddNoteForm}
        />
      )}
      {showEditNoteForm && (
        <EditNote
          setEditNote={setEditNote}
          note={editNote}
          fetchNotes={fetchNotes}
          setShowEditNoteForm={setShowEditNoteForm}
        />
      )}
    </div>
  );
};

export default NotesPage;
