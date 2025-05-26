import React from "react";
import TextEditor from "../PageBuilder/elements/TextEditor";
import "../../styles/createPost.css";

const CustomEditor = ({ value, onChange }) => {
  const handleEditorChange = (newContent) => {
    if (onChange && typeof newContent === 'string') {
      onChange(newContent);
      // Save to localStorage directly here as a backup
      localStorage.setItem("draftContent", newContent);
    }
  };

  return (
    <div className="editor-container" style={{ height: "600px" }}>
      <TextEditor
        content={value}
        onChange={handleEditorChange}
        fontSize="16px"
      />
    </div>
  );
};

export default CustomEditor;
