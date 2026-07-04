import { useState } from "react";
import useAxios from "../../lib/useAxios";
import Swal from "sweetalert2";
import NotesForm from "./NotesForm";
import { getToken } from "../../lib/localstoreage";

const EditNote = ({ note, setShowEditNoteForm, fetchNotes }) => {
  const [isLoading, setIsLoading] = useState(false);
  const app = useAxios();
  const token = getToken("token");

  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  const uploadFiles = async (files) => {
    if (!files?.length) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await app.post("upload", formData, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });
    return data.files ?? [];
  };

  // Strip internal _file blobs — only send serializable fields to the API
  const serializeFile = ({ filename, url, type, originalName }) => ({
    filename,
    url,
    type,
    originalName,
  });

  const serializeImage = ({ filename, url, type }) => ({ filename, url, type });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Upload only new files (those with a raw _file blob attached)
      const newFiles =
        data.content.files?.filter((f) => f._file).map((f) => f._file) ?? [];
      const newImages =
        data.content.images?.filter((f) => f._file).map((f) => f._file) ?? [];

      const [uploadedFiles, uploadedImages] = await Promise.all([
        uploadFiles(newFiles),
        uploadFiles(newImages),
      ]);

      // Existing entries (no _file) are already uploaded — keep them as-is
      const existingFiles = (note.content.files ?? []).map(serializeFile);
      const existingImages = (note.content.images ?? []).map(serializeImage);

      const payload = {
        title: data.title,
        content: {
          type: data.content.type,
          text: data.content.text,
          files: [...existingFiles, ...uploadedFiles.map(serializeFile)],
          images: [...existingImages, ...uploadedImages.map(serializeImage)],
        },
      };

      const { data: response } = await app.patch(`note/${note._id}`, payload, {
        headers: authHeader(),
      });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: response.message || "Note updated successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        setShowEditNoteForm(false);
        fetchNotes();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update note",
          text:
            response.message || "An error occurred while updating the note.",
        });
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to update note",
        text:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start overflow-y-auto z-50 py-10">
      <div className="bg-base-100 rounded-xl shadow-2xl p-6 w-11/12 md:w-7/12 lg:w-6/12 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Note</h2>
          <button
            onClick={() => setShowEditNoteForm(false)}
            className="btn btn-square btn-ghost text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>
        <NotesForm
          defaultValues={note}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default EditNote;
