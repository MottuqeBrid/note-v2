import { useState } from "react";
import NotesForm from "./NotesForm";

const AddNotes = ({ setShowAddNoteForm }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // TODO: API call will be provided later
      console.log("Form data:", data);
      setShowAddNoteForm(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-accent/20 bg-opacity-50 flex justify-center items-center overflow-y-auto z-50">
      <div className="bg-base-100 rounded-lg p-6 w-11/12 md:w-6/12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add Notes</h2>
          <button
            onClick={() => setShowAddNoteForm(false)}
            className="btn btn-square btn-ghost text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="w-full">
          <NotesForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AddNotes;
