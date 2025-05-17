import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import axios from "axios";
import "../../styles/createPost.css";

const TextEditor = ({ onChange, value }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.extend({
        renderHTML({ HTMLAttributes }) {
          return [
            "img",
            {
              ...HTMLAttributes,
              loading: "lazy",
              class: "max-w-full h-auto rounded-md my-4",
            },
          ];
        },
      }),
    ],
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
            withCredentials: true,
          }
        );

        // Resize image to max width 800 via Cloudinary transformation
        let url = res.data.imageUrl;
        url = url.replace("/upload/", "/upload/w_800/");

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
      <div className="flex flex-wrap gap-2 border-b pb-2 mb-4">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Italic</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Strike</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">1. List</button>
        <button onClick={handleImageUpload} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Image</button>
      </div>

      {/* Editor */}
      <div className="prose max-w-full">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;