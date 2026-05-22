import NoteImage from "./NoteImage";
import NoteFile from "./NoteFile";
import NoteCode from "./NoteCode";

const NoteContent = ({ content }) => {
  if (!content) return null;

  switch (content.type) {
    case "image":
      return (
        <div className="mt-3">
          <NoteImage src={content.src} alt={content.alt} />
        </div>
      );
    case "file":
      return (
        <div className="mt-3">
          <NoteFile url={content.url} name={content.name} />
        </div>
      );
    case "code":
      return (
        <div className="mt-3">
          <NoteCode code={content.code} language={content.language} />
        </div>
      );
    case "text":
    default:
      return (
        <p className="mt-2 text-base-content/80 whitespace-pre-wrap">
          {content.text}
        </p>
      );
  }
};

export default NoteContent;
