import React, { useState, useEffect } from "react";
import CategoriesSelector from "../components/CreatePostComponents/categoriesSelector";
import FeaturedImageUploader from "../components/CreatePostComponents/featuredImageUploader";
import MetaDetails from "../components/CreatePostComponents/metaDetails";
import PublishControls from "../components/CreatePostComponents/publishControls";
import TagsSelector from "../components/CreatePostComponents/tagsSelector";
import TextEditor from "../components/CreatePostComponents/textEditor";

const EditorPage = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [showMetaDetails, setShowMetaDetails] = useState(false);
  const [editorContent, setEditorContent] = useState(""); 
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postStatus, setPostStatus] = useState("draft");
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [selectedTags, setSelectedTags] = useState([]); 
  const [featuredImage, setFeaturedImage] = useState(null);

  useEffect(() => {
    const savedTitle = localStorage.getItem("draftTitle");
    const savedContent = localStorage.getItem("draftContent");
    const savedMetaTitle = localStorage.getItem("draftMetaTitle");
    const savedMetaDescription = localStorage.getItem("draftMetaDescription");
    const savedStatus = localStorage.getItem("draftStatus");
    const savedCategories = JSON.parse(localStorage.getItem("draftCategories")) || [];
    const savedTags = JSON.parse(localStorage.getItem("draftTags")) || [];
    const savedImage = localStorage.getItem("draftFeaturedImage");

    if (savedTitle) setPostTitle(savedTitle);
    if (savedContent) setEditorContent(savedContent);
    if (savedMetaTitle) setMetaTitle(savedMetaTitle);
    if (savedMetaDescription) setMetaDescription(savedMetaDescription);
    if (savedStatus) setPostStatus(savedStatus);
    if (savedCategories) setSelectedCategories(savedCategories);
    if (savedTags) setSelectedTags(savedTags);
    if (savedImage) setFeaturedImage(savedImage);
  }, []);

  useEffect(() => {
    localStorage.setItem("draftTitle", postTitle);
    localStorage.setItem("draftContent", editorContent);
    localStorage.setItem("draftMetaTitle", metaTitle);
    localStorage.setItem("draftMetaDescription", metaDescription);
    localStorage.setItem("draftStatus", postStatus);
    localStorage.setItem("draftCategories", JSON.stringify(selectedCategories));
    localStorage.setItem("draftTags", JSON.stringify(selectedTags));
    localStorage.setItem("draftFeaturedImage", featuredImage);
  }, [postTitle, editorContent, metaTitle, metaDescription, postStatus, selectedCategories, selectedTags, featuredImage]);

  const handlePublish = () => {
    console.log("Publishing post:", { postTitle, editorContent, metaTitle, metaDescription, postStatus, selectedCategories, selectedTags, featuredImage });
    localStorage.clear();
    setPostTitle("");
    setEditorContent("");
    setMetaTitle("");
    setMetaDescription("");
    setPostStatus("draft");
    setSelectedCategories([]);
    setSelectedTags([]);
    setFeaturedImage(null);
  };

  return (
    <div className="grid grid-cols-3 min-h-screen bg-gray-900 text-white p-6 gap-6">
      <div className="col-span-2 space-y-6">
        <input 
          type="text" 
          placeholder="Enter Post Title..." 
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="w-full p-3 text-lg bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-4">
          <button onClick={() => setShowEditor(true)} className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Open Editor</button>
          <button onClick={() => setShowMetaDetails(true)} className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">Open Meta Details</button>
        </div>
        {showEditor && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 p-6">
            <button onClick={() => setShowEditor(false)} className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Close Editor</button>
            <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg">
              <TextEditor value={editorContent} onChange={setEditorContent} />
            </div>
          </div>
        )}
        {showMetaDetails && (
          <MetaDetails 
            metaTitle={metaTitle} 
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription} 
            setMetaDescription={setMetaDescription}
            onClose={() => setShowMetaDetails(false)} 
          />
        )}
      </div>
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Publish</h2>
          <PublishControls editorContent={editorContent} onPublish={handlePublish} postStatus={postStatus} setPostStatus={setPostStatus} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Categories</h2>
          <CategoriesSelector selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Featured Image</h2>
          <FeaturedImageUploader featuredImage={featuredImage} setFeaturedImage={setFeaturedImage} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Tags</h2>
          <TagsSelector tags={selectedTags} setTags={setSelectedTags} />

        </div>
      </div>
    </div>
  );
};

export default EditorPage;
