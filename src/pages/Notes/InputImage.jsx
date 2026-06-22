import { FiTrash2 } from "react-icons/fi";

const InputImage = ({ register, index, remove }) => {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label className="input">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
          </g>
        </svg>
        <input
          type="text"
          className="grow"
          placeholder="Image name"
          {...register(`content.images.${index}.filename`)}
        />
      </label>
      <input
        type="file"
        className="file-input file-input-ghost"
        {...register(`content.images.${index}.url`)}
      />
      <button
        type="button"
        onClick={() => remove(index)}
        className="btn btn-circle btn-error"
      >
        <FiTrash2 />
      </button>
    </div>
  );
};

export default InputImage;
