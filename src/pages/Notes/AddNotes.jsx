// AddNotes.jsx
import { useState } from "react";
import NotesForm from "./NotesForm";
import useAxios from "./../../lib/useAxios";
import Swal from "sweetalert2";
import { getToken } from "../../lib/localstoreage";

const AddNotes = ({ setShowAddNoteForm, fetchNotes }) => {
  const [isLoading, setIsLoading] = useState(false);
  const app = useAxios();

  const token = getToken("token");

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await app.post(`upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Uploaded files:", data);
    return data.files ?? [];
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // ✅ Upload files
      const uploadedFiles = await uploadFiles(
        data.content.files?.map((f) => f._file).filter(Boolean) ?? [],
      );

      // ✅ Upload images
      const uploadedImages = await uploadFiles(
        data.content.images?.map((f) => f._file).filter(Boolean) ?? [],
      );

      const payload = {
        title: data.title,
        content: {
          type: data.content.type,
          text: data.content.text,
          files: uploadedFiles.map((f) => ({
            filename: f.filename,
            url: f.url,
            type: f.type,
            originalName: f.originalName,
          })),
          images: uploadedImages.map((f) => ({
            filename: f.filename,
            url: f.url,
            type: f.type,
          })),
        },
      };

      const { data: response } = await app.post(`note`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: response.message || "Note added successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add note",
          text: response.message || "An error occurred while adding the note.",
        });
      }
      setShowAddNoteForm(false);
      fetchNotes(); // Refresh notes after adding a new one
    } catch (error) {
      console.error("Failed to save note:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to add note",
        text: error.message || "An error occurred while adding the note.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start overflow-y-auto z-50 py-10">
      <div className="bg-base-100 rounded-xl shadow-2xl p-6 w-11/12 md:w-7/12 lg:w-6/12 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Note</h2>
          <button
            onClick={() => setShowAddNoteForm(false)}
            className="btn btn-square btn-ghost text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>
        <NotesForm onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AddNotes;
