import React, { useState, useEffect } from "react";
import CategoriesSelector from "../components/CreatePostComponents/categoriesSelector";
import CoverImageUploader from "../components/CreatePostComponents/featuredImageUploader";
import MetaDetails from "../components/CreatePostComponents/metaDetails";
import PublishControls from "../components/CreatePostComponents/publishControls";
import TagsSelector from "../components/CreatePostComponents/tagsSelector";
import TextEditor from "../components/CreatePostComponents/textEditor";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";
import { FaBars } from "react-icons/fa";

const EditorPage = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [showMetaDetails, setShowMetaDetails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [editorContent, setEditorContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postStatus, setPostStatus] = useState("draft");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedData = {
      title: localStorage.getItem("draftTitle"),
      content: localStorage.getItem("draftContent"),
      metaTitle: localStorage.getItem("draftMetaTitle"),
      metaDescription: localStorage.getItem("draftMetaDescription"),
      status: localStorage.getItem("draftStatus"),
      categories: JSON.parse(localStorage.getItem("draftCategories")) || [],
      tags: JSON.parse(localStorage.getItem("draftTags")) || [],
      image: localStorage.getItem("draftCoverImage"),
    };

    if (savedData.title) setPostTitle(savedData.title);
    if (savedData.content) setEditorContent(savedData.content);
    if (savedData.metaTitle) setMetaTitle(savedData.metaTitle);
    if (savedData.metaDescription) setMetaDescription(savedData.metaDescription);
    if (savedData.status) setPostStatus(savedData.status);
    if (savedData.categories.length > 0) setSelectedCategories(savedData.categories);
    if (savedData.tags.length > 0) setSelectedTags(savedData.tags);
    if (savedData.image) setCoverImage(savedData.image);
  }, []);

  // Auto-save draft when data changes
  useEffect(() => {
    localStorage.setItem("draftTitle", postTitle);
    localStorage.setItem("draftContent", editorContent);
    localStorage.setItem("draftMetaTitle", metaTitle);
    localStorage.setItem("draftMetaDescription", metaDescription);
    localStorage.setItem("draftStatus", postStatus);
    localStorage.setItem("draftCategories", JSON.stringify(selectedCategories));
    localStorage.setItem("draftTags", JSON.stringify(selectedTags));
    localStorage.setItem("draftCoverImage", coverImage);
  }, [postTitle, editorContent, metaTitle, metaDescription, postStatus, selectedCategories, selectedTags, coverImage]);

  const handlePublish = (publishedPost) => {
    console.log("📢 Publishing post:", publishedPost);
    localStorage.clear();
    setPostTitle("");
    setEditorContent("");
    setMetaTitle("");
    setMetaDescription("");
    setPostStatus("draft");
    setSelectedCategories([]);
    setSelectedTags([]);
    setCoverImage(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white transition-all duration-300">
    {/* Sidebar */}
    <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
  
    {/* Main Content */}
    <div className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          className="top-4 left-4 bg-[#1E293B] mb-3 text-white p-3 rounded-full shadow-md hover:bg-gray-800 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars className="text-xl" />
        </button>
      )}
  
      {/* 🎯 Title Input & Publish Controls (Same Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* 📝 Title Input (2/3 width) */}
        <input
          type="text"
          placeholder="Enter Post Title..."
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="col-span-2 p-3 text-lg bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        {/* 📢 Publish Controls (1/3 width) */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">📢 Publish</h2>
          <PublishControls
            postTitle={postTitle}
            editorContent={editorContent}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            category={selectedCategories}
            tags={selectedTags}
            coverImage={coverImage}
            postStatus={postStatus}
            setPostStatus={setPostStatus}
            onPublish={handlePublish}
          />
        </div>
      </div>
  
      {/* 🛠️ Buttons Below Title */}
      <div className="flex gap-4 ">
        <button
          onClick={() => setShowEditor(true)}
          className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Open Editor
        </button>
        <button
          onClick={() => setShowMetaDetails(true)}
          className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          Open Meta Details
        </button>
      </div>
  
      {/* 🎯 Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* ✏️ Left Side (Editor & Options) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rich Text Editor Modal */}
          {showEditor && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 p-6">
              <div className="relative w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg">
                <button
                  onClick={() => setShowEditor(false)}
                  className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Close Editor
                </button>
                <TextEditor value={editorContent} onChange={setEditorContent} />
              </div>
            </div>
          )}
  
          {/* Meta Details Modal */}
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
  
        {/* 📌 Right Sidebar (Categories, Tags, Cover Image) */}
        <div className="space-y-6">
          {/* Categories Selector */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">📌 Categories</h2>
            <CategoriesSelector selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
          </div>
  
          {/* Cover Image Upload */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🖼️ Cover Image</h2>
            <CoverImageUploader coverImage={coverImage} setCoverImage={setCoverImage} />
          </div>
  
          {/* Tags Selector */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🏷️ Tags</h2>
            <TagsSelector tags={selectedTags} setTags={setSelectedTags} />
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default EditorPage;
