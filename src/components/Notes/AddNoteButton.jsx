import { FiPlus } from "react-icons/fi";

const AddNoteButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="btn btn-primary gap-2">
      <FiPlus size={18} />
      Add Note
    </button>
  );
};

export default AddNoteButton;
