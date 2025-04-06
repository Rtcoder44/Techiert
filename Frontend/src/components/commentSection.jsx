import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CommentsSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyBox, setReplyBox] = useState(null);
  const [editBox, setEditBox] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blogs/comments/${postId}`);
      const flatComments = res.data || [];
      const structured = buildCommentTree(flatComments);
      setComments(structured);
    } catch (err) {
      console.error("❌ Failed to load comments:", err);
      alert("Failed to load comments.");
    }
  };

  const buildCommentTree = (flatComments) => {
    const map = {};
    const roots = [];

    flatComments.forEach((comment) => {
      map[comment._id] = { ...comment, replies: [] };
    });

    flatComments.forEach((comment) => {
      if (comment.parentId) {
        const parent = map[comment.parentId];
        if (parent) {
          parent.replies.push(map[comment._id]);
        }
      } else {
        roots.push(map[comment._id]);
      }
    });

    const sortReplies = (comments) => {
      comments.forEach((c) => {
        c.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        sortReplies(c.replies);
      });
    };

    sortReplies(roots);
    return roots;
  };

  const handleCommentSubmit = async () => {
    if (!user) return alert("You need to log in to comment.");
    if (!newComment.trim()) return alert("Comment cannot be empty.");

    try {
      await axios.post(
        `${API_BASE_URL}/api/blogs/${postId}/comment`,
        { commentText: newComment, parentId: null },
        { withCredentials: true }
      );
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("❌ Error submitting comment:", err);
      alert("Failed to post comment.");
    }
  };

  const handleReplySubmit = async (commentId) => {
    const reply = replyContent[commentId];
    if (!user) return alert("You need to log in to reply.");
    if (!reply || !reply.trim()) return alert("Reply cannot be empty.");

    try {
      await axios.post(
        `${API_BASE_URL}/api/blogs/${postId}/comment`,
        { commentText: reply, parentId: commentId },
        { withCredentials: true }
      );
      setReplyBox(null);
      setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
      fetchComments();
    } catch (err) {
      console.error("❌ Error replying to comment:", err);
      alert("Failed to post reply.");
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) return alert("Edited comment cannot be empty.");

    try {
      await axios.put(
        `${API_BASE_URL}/api/blogs/comments/${commentId}`,
        { commentText: editContent },
        { withCredentials: true }
      );
      setEditBox(null);
      setEditContent("");
      fetchComments();
    } catch (err) {
      console.error("❌ Failed to update comment:", err);
      alert("Could not update comment.");
    }
  };

  const handleDelete = async (commentId) => {
    const confirmDelete = window.confirm("This will delete the comment and all its replies. Continue?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/blogs/comments/${commentId}`, {
        withCredentials: true,
      });
      fetchComments();
    } catch (err) {
      console.error("❌ Failed to delete comment:", err);
      alert("Could not delete comment.");
    }
  };

  const renderCommentWithReplies = (comment, level = 0) => (
    <div
      key={comment._id}
      className={`mt-3 ${level > 0 ? "ml-6" : "ml-0"} bg-white rounded-lg p-3 border border-gray-200`}
    >
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-lg overflow-hidden">
          {comment.userId?.avatarUrl ? (
            <img
              src={comment.userId.avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            comment.userId?.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        <div className="flex-1">
          {editBox === comment._id ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={() => handleEditSubmit(comment._id)}
                className="text-sm bg-blue-600 text-white px-2 py-1 rounded mr-2 mt-1"
              >
                Save
              </button>
              <button
                onClick={() => setEditBox(null)}
                className="text-sm bg-gray-300 px-2 py-1 rounded mt-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="text-sm prose prose-sm max-w-none">
              <strong>{comment.userId?.name || "User"}</strong>
              <ReactMarkdown>{`\n${comment.comment}`}</ReactMarkdown>
            </div>
          )}

          <div className="flex gap-3 text-xs text-gray-600 mt-1">
            {user && <button onClick={() => setReplyBox(comment._id)}>Reply</button>}
            {(user?._id === comment?.userId?._id || user?.role === "admin") && (
              <>
                <button
                  onClick={() => {
                    setEditBox(comment._id);
                    setEditContent(comment.comment);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(comment._id)}>Delete</button>
              </>
            )}
          </div>

          {replyBox === comment._id && (
            <div className="mt-2">
              <textarea
                rows={2}
                className="w-full p-2 border rounded"
                placeholder="Write a reply..."
                value={replyContent[comment._id] || ""}
                onChange={(e) =>
                  setReplyContent((prev) => ({
                    ...prev,
                    [comment._id]: e.target.value,
                  }))
                }
              />
              <button
                onClick={() => handleReplySubmit(comment._id)}
                className="bg-[#E7000B] text-white px-3 py-1 mt-1 rounded"
              >
                Post Reply
              </button>
              <button
                onClick={() => setReplyBox(null)}
                className="ml-2 text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-2">
              <button
                className="text-sm text-blue-500"
                onClick={() =>
                  setExpandedReplies((prev) => ({
                    ...prev,
                    [comment._id]: !prev[comment._id],
                  }))
                }
              >
                {expandedReplies[comment._id]
                  ? "Hide Replies"
                  : `Show ${comment.replies.length} Reply${comment.replies.length > 1 ? "ies" : ""}`}
              </button>

              {expandedReplies[comment._id] && (
                <div className="mt-2">
                  {comment.replies.map((reply) =>
                    renderCommentWithReplies(reply, level + 1)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4 text-[#1E293B]">Comments</h3>

      {user ? (
        <div className="mb-4">
          <textarea
            className="w-full p-3 border rounded-md"
            rows={3}
            placeholder="Write a comment (Markdown supported)..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-[#E7000B] text-white px-4 py-2 rounded mt-2"
          >
            Post Comment
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">Log in to write a comment.</p>
      )}

      {comments.map((comment) => renderCommentWithReplies(comment))}
    </div>
  );
};

export default CommentsSection;
