// NotesForm.jsx
import { useFieldArray, useForm } from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import InputFile from "./InputFile";
import InputImage from "./InputImage";

const contentTypes = [
  "text",
  "markdown",
  "html",
  "code",
  "python",
  "javascript",
  "json",
  "csv",
  "xml",
  "sql",
  "yaml",
  "toml",
  "css",
  "java",
  "go",
  "ruby",
  "php",
  "rust",
  "swift",
  "kotlin",
  "csharp",
  "cpp",
  "c",
  "bash",
  "powershell",
  "jsonc",
  "yamlc",
  "tomlc",
  "htmlc",
  "scss",
  "less",
  "R",
  "Rmd",
  "dart",
  "perl",
  "lua",
  "haskell",
  "elixir",
];

const NotesForm = ({ onSubmit, defaultValues, isLoading }) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      title: "",
      content: { type: "text", text: "", files: [], images: [] },
    },
  });
  const {
    fields: fileFields,
    append: appendFile,
    remove: removeFile,
  } = useFieldArray({ control, name: "content.files" });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "content.images" });

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Title</label>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
            className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Note title..."
          />
          {errors.title && (
            <p className="text-error text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold">Content</label>
            <select
              {...register("content.type")}
              className="select select-sm select-bordered w-36"
            >
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={8}
            {...register("content.text")}
            className="w-full border rounded-lg py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Write your content here..."
          />
        </div>

        {/* Files */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">
              Files{" "}
              <span className="text-xs text-gray-400 font-normal">
                (pdf, zip, code files...)
              </span>
            </span>
            <button
              type="button"
              onClick={() =>
                appendFile({ filename: "", url: "", type: "", _file: null })
              }
              className="btn btn-sm btn-outline btn-primary gap-1"
            >
              <FiPlus /> Add File
            </button>
          </div>
          {fileFields.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3 border border-dashed rounded-lg">
              No files added yet
            </p>
          )}
          {fileFields.map((field, index) => (
            <InputFile
              key={field.id}
              register={register}
              index={index}
              remove={removeFile}
              setValue={setValue}
              existingFile={!field._file && field.url ? field : null}
            />
          ))}
        </div>

        {/* Images */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">
              Images{" "}
              <span className="text-xs text-gray-400 font-normal">
                (jpg, png, webp, gif...)
              </span>
            </span>
            <button
              type="button"
              onClick={() =>
                appendImage({ filename: "", url: "", type: "", _file: null })
              }
              className="btn btn-sm btn-outline btn-secondary gap-1"
            >
              <FiPlus /> Add Image
            </button>
          </div>
          {imageFields.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3 border border-dashed rounded-lg">
              No images added yet
            </p>
          )}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imageFields.map((field, index) => (
              <InputImage
                key={field.id}
                register={register}
                index={index}
                remove={removeImage}
                setValue={setValue}
              />
            ))}
          </div> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imageFields.map((field, index) => (
              <InputImage
                key={field.id}
                register={register}
                index={index}
                remove={removeImage}
                setValue={setValue}
                existingImage={!field._file && field.url ? field : null}
              />
            ))}
          </div>{" "}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Saving...
              </span>
            ) : (
              "Save Note"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotesForm;
