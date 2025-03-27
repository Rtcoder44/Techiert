import React, { useState } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/createPost.css";
import axios from "axios";

const TextEditor = ({ onChange, value }) => {
  const [editorData, setEditorData] = useState(value || "");

  // Upload Image to Backend (which stores in Cloudinary)
  const handleImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append("coverImage", file); // Backend expects "coverImage"

    try {
      const res = await axios.post(
        `http://localhost:5000/api/blogs/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // Ensures authentication
        }
      );

      if (res.data.imageUrl) {
        callback(res.data.imageUrl); // Insert Cloudinary URL into editor
      }
    } catch (error) {
      console.error("❌ Image upload failed:", error.response?.data || error);
    }
  };

  return (
    <div className="editor-container">
      <SunEditor
        setOptions={{
          height: "100%", 
          minHeight: "400px",
          width: "100%",
          resizingBar: false,
          buttonList: [
            ["formatBlock", "bold", "italic", "underline", "strike"],
            ["fontSize", "fontColor", "hiliteColor"],
            ["align", "list", "table"],
            ["link", "image", "video"],
            ["undo", "redo", "removeFormat"],
          ],
          imageUploadHandler: handleImageUpload, // Backend Image Upload
        }}
        setContents={editorData}
        onChange={(content) => {
          setEditorData(content);
          if (onChange) onChange(content);
        }}
      />
    </div>
  );
};

export default TextEditor;
