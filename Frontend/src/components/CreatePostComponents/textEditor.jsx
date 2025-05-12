import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import axios from "axios";
import "../../styles/createPost.css";

const TextEditor = ({ onChange, value }) => {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("coverImage", file);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/blogs/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, // ✅ Send cookies for auth
          }
        );

        const url = res.data.imageUrl;
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Failed to upload image. Please try again.");
      }
    };
  };

  if (!editor) return null;

  return (
    <div className="editor-container">
      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap border-b pb-2 mb-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">Italic</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className="btn">Strike</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="btn">H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn">H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="btn">1. List</button>
        <button onClick={handleImageUpload} className="btn">Image</button>
      </div>

      {/* Editor Content Area */}
      <div className="tiptap">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;