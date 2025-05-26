import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { Helmet } from "react-helmet";  // Import Helmet for SEO meta tags management
import CategoriesSelector from "../components/CreatePostComponents/categoriesSelector";
import CoverImageUploader from "../components/CreatePostComponents/featuredImageUploader";
import MetaDetails from "../components/CreatePostComponents/metaDetails";
import PublishControls from "../components/CreatePostComponents/publishControls";
import TagsSelector from "../components/CreatePostComponents/tagsSelector";
import CustomEditor from "../components/CreatePostComponents/textEditor";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";

// Debounce function to delay state updates and avoid frequent re-renders
const useDebouncedState = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const EditorPage = () => {
  const [showMetaDetails, setShowMetaDetails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [editorContent, setEditorContent] = useState(() => {
    // Initialize editor content from localStorage
    const savedContent = localStorage.getItem("draftContent");
    console.log("Initial editor content from localStorage:", savedContent);
    return savedContent || "";
  });
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postStatus, setPostStatus] = useState("draft");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  // Use debounced values to prevent unnecessary re-renders
  const debouncedPostTitle = useDebouncedState(postTitle, 500);
  const debouncedEditorContent = useDebouncedState(editorContent, 500);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedData = {
      title: localStorage.getItem("draftTitle"),
      metaTitle: localStorage.getItem("draftMetaTitle"),
      metaDescription: localStorage.getItem("draftMetaDescription"),
      status: localStorage.getItem("draftStatus"),
      categories: JSON.parse(localStorage.getItem("draftCategories")) || [],
      tags: JSON.parse(localStorage.getItem("draftTags")) || [],
      image: localStorage.getItem("draftCoverImage"),
    };

    if (savedData.title) setPostTitle(savedData.title);
    if (savedData.metaTitle) setMetaTitle(savedData.metaTitle);
    if (savedData.metaDescription) setMetaDescription(savedData.metaDescription);
    if (savedData.status) setPostStatus(savedData.status);
    if (savedData.categories.length > 0) setSelectedCategories(savedData.categories);
    if (savedData.tags.length > 0) setSelectedTags(savedData.tags);
    if (savedData.image) setCoverImage(savedData.image);
  }, []);

  // Auto-save draft when data changes
  useEffect(() => {
    if (debouncedEditorContent) {
      console.log("Saving editor content to localStorage");
      localStorage.setItem("draftContent", debouncedEditorContent);
    }
    
    if (debouncedPostTitle) {
      localStorage.setItem("draftTitle", debouncedPostTitle);
    }
    
    localStorage.setItem("draftMetaTitle", metaTitle);
    localStorage.setItem("draftMetaDescription", metaDescription);
    localStorage.setItem("draftStatus", postStatus);
    localStorage.setItem("draftCategories", JSON.stringify(selectedCategories));
    localStorage.setItem("draftTags", JSON.stringify(selectedTags));
    if (coverImage) {
      localStorage.setItem("draftCoverImage", coverImage);
    }
  }, [debouncedPostTitle, debouncedEditorContent, metaTitle, metaDescription, postStatus, selectedCategories, selectedTags, coverImage]);

  const handlePublish = (publishedPost) => {
    // Clear all localStorage data after successful publish
    localStorage.removeItem("draftTitle");
    localStorage.removeItem("draftContent");
    localStorage.removeItem("draftMetaTitle");
    localStorage.removeItem("draftMetaDescription");
    localStorage.removeItem("draftStatus");
    localStorage.removeItem("draftCategories");
    localStorage.removeItem("draftTags");
    localStorage.removeItem("draftCoverImage");

    // Reset all state
    setPostTitle("");
    setEditorContent("");
    setMetaTitle("");
    setMetaDescription("");
    setPostStatus("draft");
    setSelectedCategories([]);
    setSelectedTags([]);
    setCoverImage(null);
  };

  const handleEditorChange = (newContent) => {
    console.log("Editor onChange called");
    setEditorContent(newContent);
  };

  // SEO-friendly title and description
  const seoTitle = metaTitle && metaTitle.length >= 10 ? metaTitle : "Create Post | Techiert";
  const seoDescription = metaDescription && metaDescription.length >= 30 ? metaDescription : "Create and manage your blog posts.";

  return (
    <div className="flex min-h-screen bg-gray-900 text-white transition-all duration-300">
      {/* Helmet for SEO meta tags */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {/* Add more SEO meta tags as needed */}
      </Helmet>

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

        {/* Title Input & Publish Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Enter Post Title..."
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full p-3 text-lg bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            
            {/* Meta Details Button */}
            <button
              onClick={() => setShowMetaDetails(true)}
              className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              SEO Meta Details
            </button>
          </div>

          {/* Publish Controls */}
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side (Editor) */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
            <CustomEditor value={editorContent} onChange={handleEditorChange} />
          </div>

          {/* Right Sidebar (Categories, Tags, Cover Image) */}
          <div className="space-y-6">
            <CategoriesSelector selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
            <CoverImageUploader coverImage={coverImage} setCoverImage={setCoverImage} postTitle={postTitle} />
            <TagsSelector tags={selectedTags} setTags={setSelectedTags} />
          </div>
        </div>

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
    </div>
  );
};

export default EditorPage;
