import { FiImage } from "react-icons/fi";

const NoteImage = ({ src, alt }) => {
  return (
    <figure className="relative group">
      <img
        src={src}
        alt={alt || "note image"}
        className="w-full h-48 object-cover rounded-lg"
        loading="lazy"
      />
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg"
      >
        <FiImage
          size={32}
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </figure>
  );
};

export default NoteImage;
