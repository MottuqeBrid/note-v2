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
];

const NotesForm = ({ onSubmit, defaultValues, isLoading }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      title: "",
      content: {
        type: "text",
        text: "",
        files: [],
        images: [],
      },
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
        <div className="mb-4">
          <label htmlFor="title" className="block text-primary font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "Title is required" })}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          {errors.title && (
            <p className="text-error text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="text"
              className="block text-secondary font-bold mb-2"
            >
              Content
            </label>
            <select
              id="type"
              {...register("content.type")}
              className="w-1/4 select"
            >
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            id="text"
            rows={8}
            {...register("content.text")}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-secondary font-bold mb-2">Files</span>
            <button
              type="button"
              onClick={() => appendFile({ filename: "", url: "", type: "" })}
              className="btn btn-circle btn-ghost"
            >
              <FiPlus />
            </button>
          </div>
          {fileFields.map((field, index) => (
            <InputFile
              key={field.id}
              register={register}
              index={index}
              remove={removeFile}
            />
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-secondary font-bold mb-2">Images</span>
            <button
              type="button"
              onClick={() => appendImage({ filename: "", url: "", type: "" })}
              className="btn btn-circle btn-ghost"
            >
              <FiPlus />
            </button>
          </div>
          {imageFields.map((field, index) => (
            <InputImage
              key={field.id}
              register={register}
              index={index}
              remove={removeImage}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="submit"
            className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotesForm;
