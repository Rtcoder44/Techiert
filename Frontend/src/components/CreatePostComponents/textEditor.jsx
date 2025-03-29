import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import "../../styles/createPost.css";

const TextEditor = ({ onChange, value }) => {
  const [editorData, setEditorData] = useState(value || "");
  const [uploadedImage, setUploadedImage] = useState(null);
  const quillRef = useRef(null);

  // ✅ Handle Image Upload
  const imageHandler = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("coverImage", file);

      try {
        const res = await axios.post(
          "http://localhost:5000/api/blogs/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.imageUrl) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection();
          editor.insertEmbed(range.index, "image", res.data.imageUrl);

          setUploadedImage(res.data.imageUrl);
        }
      } catch (error) {
        console.error("❌ Image Upload Failed:", error);
      }
    };
  };

  // ✅ Remove Image
  const removeImage = () => {
    setUploadedImage(null);

    const editor = quillRef.current.getEditor();
    const images = editor.root.querySelectorAll("img");
    images.forEach((img) => img.remove());
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 border rounded-lg shadow-lg bg-white p-4">
      {/* ✅ Ensure Editor is Scrollable & Text is Visible */}
      <div className="h-[400px] overflow-y-auto border border-gray-300 rounded-md">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorData}
          onChange={(content) => {
            setEditorData(content);
            if (onChange) onChange(content);
          }}
          modules={{
            toolbar: {
              container: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["link", "image", "video"],
                ["clean"],
              ],
              handlers: { image: imageHandler },
            },
          }}
          className="h-full"
        />
      </div>

     
    </div>
  );
};

export default TextEditor;
