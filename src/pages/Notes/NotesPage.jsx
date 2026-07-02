// NotesPage.jsx
import { useState } from "react";
import NoteCard from "./NoteCard";
import AddNotes from "./AddNotes";

const NotesPage = () => {
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="p-4">
      <div className="w-full flex justify-between items-center gap-4 mt-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowAddNoteForm(true)}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all"
        >
          <span className="text-xl leading-none">+</span>
          Add Note
        </button>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <NoteCard />
        <NoteCard />
        <NoteCard />
      </div>

      {showAddNoteForm && <AddNotes setShowAddNoteForm={setShowAddNoteForm} />}
    </div>
  );
};

export default NotesPage;
