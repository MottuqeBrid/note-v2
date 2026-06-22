import { useState } from "react";
import NoteCard from "./NoteCard";
import AddNotes from "./AddNotes";

const NotesPage = () => {
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  return (
    <div>
      <div className="w-full flex justify-between items-center gap-4 mt-4">
        <div className="">
          <input
            className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-secondary"
            type="search"
            placeholder="Search notes..."
            name=""
            id=""
          />
        </div>
        <div className="">
          <button
            onClick={() => setShowAddNoteForm(true)}
            className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
          >
            Add Notes
          </button>
        </div>
      </div>

      {/* Note Card */}
      <div className="w-full grid grid-cols-3 gap-4 mt-4">
        <NoteCard />
        <NoteCard />
        <NoteCard />
      </div>

      {/* Add Note Form */}
      {showAddNoteForm && <AddNotes setShowAddNoteForm={setShowAddNoteForm} />}
    </div>
  );
};

export default NotesPage;
