import NoteCard from "./NoteCard";

const NotesList = ({ notes, onEdit, onDelete }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-base-content/50 text-lg">No notes yet</p>
        <p className="text-sm text-base-content/30 mt-1">
          Click &ldquo;Add Note&rdquo; to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotesList;
