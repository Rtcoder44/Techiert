const Blog = require("../models/blogs.model");
const mongoose = require("mongoose");
const User = require("../models/users.model");
const Comment = require("../models/comments.model");
const slugify = require("slugify");
const Tag = require("../models/tags.model");
const Like = require("../models/likes.model")
const jwt = require("jsonwebtoken");
const SearchQuery = require("../models/searchQuery.model");
const Category = require("../models/categories.model");
const { getCache, client, setCache,delCacheByPattern } = require("../utils/redisClient");


exports.createBlog = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized. Please log in to create a blog." });
    }

    let { title, category, content, status = "published", metaTitle, metaDescription, coverImage, tags } = req.body;

    // Trim inputs
    title = title?.trim();
    metaTitle = metaTitle?.trim();
    metaDescription = metaDescription?.trim();
    content = content?.trim();

    // Validate fields
    if (!title || !category || !content || !metaTitle || !metaDescription) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Ensure category is valid
    if (typeof category === "string") category = [category];
    if (!Array.isArray(category) || !category.every(cat => mongoose.Types.ObjectId.isValid(cat))) {
      return res.status(400).json({ error: "Invalid category format." });
    }

    // Handle tags
    let tagIds = [];
    if (tags?.length > 0) {
      for (const tagName of tags) {
        const trimmedTag = tagName.trim().toLowerCase();
        let tag = await Tag.findOne({ name: trimmedTag });
        if (!tag) {
          tag = new Tag({ name: trimmedTag, slug: slugify(trimmedTag, { lower: true }) });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
    }

    // Unique slug generation
    let slug = slugify(title, { lower: true });
    let uniqueSlug = slug;
    let counter = 1;
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter++}`;
    }

    // Fallback meta
    const seoMetaTitle = metaTitle || `${title} - Blog | Techiert.com`;
    const seoMetaDescription = metaDescription || content.split(" ").slice(0, 30).join(" ") + "...";

    const newBlog = new Blog({
      title,
      category,
      tags: tagIds,
      content,
      slug: uniqueSlug,
      metaTitle: seoMetaTitle,
      metaDescription: seoMetaDescription,
      coverImage,
      author: req.user._id,
      status,
      permalink: `/blog/${uniqueSlug}`,
    });

    await newBlog.save();

    // Invalidate cache if you're caching blog list
    await client.del("blog:all"); // or any specific cache key used for homepage/category

    return res.status(201).json({
      success: true,
      message: `Blog ${status} successfully`,
      blog: newBlog,
    });

  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get all blogs (Only show public, or private if owner/admin)
exports.getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      tags = "",
      status = "all",
      sort = "latest",
    } = req.query;

    // Check for any undefined values
    const queryParams = { page, limit, search, category, tags, status, sort };
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === undefined) {
        console.warn(`⚠️ Query param '${key}' is undefined`);
      }
    }

    const safePage = Math.max(1, parseInt(page));
    const safeLimit = Math.min(50, parseInt(limit));
    const userId = req.user?._id?.toString() || "guest";

    // 🧠 Build safe cache key (fallback values to avoid "undefined")
    const cacheKey = [
      "blogs",
      userId,
      safePage,
      safeLimit,
      search || "none",
      category || "all",
      tags || "all",
      status,
      sort,
    ].join(":");

    // ✅ Try Redis Cache First
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const query = {};

    // 🔹 Status Filter
    if (status === "published") {
      query.status = "published";
    } else if (status === "draft") {
      query.status = "draft";
    } else if (status === "private") {
      query.status = "private";
    } else {
      query.$or = [{ status: "published" }];
      if (req.user) {
        query.$or.push(
          { status: "draft", author: req.user._id },
          { status: "private", author: req.user._id }
        );
      }
    }

    // 🔹 Search Filter
    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
      if (query.$and) {
        query.$and.push(searchQuery);
      } else if (Object.keys(query).length > 0) {
        query.$and = [searchQuery];
      } else {
        Object.assign(query, searchQuery);
      }
    }

    // 🔹 Category Filter
    if (category) {
      query.category = category;
    }

    // 🔹 Tags Filter
    if (tags) {
      query.tags = { $in: tags.split(",").map(tag => tag.trim()) };
    }

    // 🔹 Sorting
    let sortOption = { createdAt: -1 }; // Default: latest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };

    const skip = (safePage - 1) * safeLimit;

    // 🔹 Fetch Data
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query)
        .populate("author", "name")
        .populate("category", "name")
        .populate("tags", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(safeLimit),
      Blog.countDocuments(query),
    ]);

    const response = {
      blogs,
      totalBlogs,
      currentPage: safePage,
      totalPages: Math.ceil(totalBlogs / safeLimit),
    };

    // 🔹 Cache Result for 60 seconds
    await setCache(cacheKey, response, 60);

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in getAllBlogs:", error);
    res.status(500).json({ error: "Server error while fetching blogs." });
  }
};

// Get a single blog post by ID or Slug
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    const cacheKey = isValidObjectId ? `blog:${id}` : `slug:${id}`;

    // ✅ Try Redis Cache First
    const cachedBlog = await getCache(cacheKey);
    if (cachedBlog) {
      // ✅ Check private access again for user-specific logic
      if (
        cachedBlog.status === "private" &&
        userId !== cachedBlog.author._id.toString() &&
        userRole !== "admin"
      ) {
        return res.status(403).json({ error: "This blog is private." });
      }

      return res.status(200).json({
        ...cachedBlog,
        isLikedByUser: userId
          ? Boolean(await Like.exists({ blogId: cachedBlog._id, userId }))
          : false,
      });
    }

    // 🔍 Fetch from DB
    const blog = await Blog.findOne(
      isValidObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id }
    )
      .populate("author", "name role")
      .populate("category", "name")
      .populate("tags", "name slug")
      .lean();

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (
      blog.status === "private" &&
      userId !== blog.author._id.toString() &&
      userRole !== "admin"
    ) {
      return res.status(403).json({ error: "This blog is private." });
    }

    // ✅ Increase views if not author/admin
    if (!userId || (userId !== blog.author._id.toString() && userRole !== "admin")) {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    }

    const [likesCount, userLiked] = await Promise.all([
      Like.countDocuments({ blogId: blog._id }),
      userId ? Like.exists({ blogId: blog._id, userId }) : false,
    ]);

    blog.likesCount = likesCount;
    blog.isLikedByUser = Boolean(userLiked);

    // ✅ Cache the result (excluding isLikedByUser which is user-specific)
    const cacheData = { ...blog };
    delete cacheData.isLikedByUser;

    await setCache(cacheKey, cacheData, 60 * 5); // Cache for 5 minutes

    return res.status(200).json(blog);
  } catch (error) {
    console.error("❌ Error in getBlogById:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

  
  

  // Get Related Blogs by Tags or Category

  
  exports.getRelatedBlogs = async (req, res) => {
    try {
      const { id } = req.params;
  
      const cacheKey = `relatedBlogs:${id}`;
      const cachedData = await getCache(cacheKey);
  
      if (cachedData) {
        return res.status(200).json({ success: true, relatedBlogs: cachedData });
      }
  
      // Fetch main blog
      const mainBlog = await Blog.findById(id).populate("tags category");
      if (!mainBlog) return res.status(404).json({ error: "Main blog not found." });
  
      // Prepare related blogs query
      const relatedQuery = {
        _id: { $ne: mainBlog._id },
        status: "published",
        $or: [
          { tags: { $in: mainBlog.tags.map(tag => tag._id) } },
          { category: { $in: mainBlog.category.map(cat => cat._id) } },
        ],
      };
  
      const relatedBlogs = await Blog.find(relatedQuery)
        .limit(6)
        .sort({ createdAt: -1 })
        .populate("author", "name")
        .populate("category", "name")
        .populate("tags", "name");
  
      // Cache the result for 1 hour (3600 seconds)
      await setCache(cacheKey, relatedBlogs, 3600);
  
      res.status(200).json({ success: true, relatedBlogs });
    } catch (error) {
      console.error("❌ Error fetching related blogs:", error);
      res.status(500).json({ error: "Failed to fetch related blogs." });
    }
  };
  
// Get Latest Published Blogs


exports.getLatestBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const parsedLimit = parseInt(limit);

    const cacheKey = `latestBlogs:${parsedLimit}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ success: true, blogs: cachedData });
    }

    const latestBlogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .populate("author", "name")
      .populate("category", "name")
      .populate("tags", "name");

    await setCache(cacheKey, latestBlogs, 3600); // Cache for 1 hour

    res.status(200).json({ success: true, blogs: latestBlogs });
  } catch (error) {
    console.error("❌ Error fetching latest blogs:", error);
    res.status(500).json({ error: "Failed to fetch latest blogs" });
  }
};




exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, category, content, status, metaTitle, metaDescription, coverImage, tags } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (req.user.role !== "admin" && req.user._id.toString() !== blog.author.toString()) {
      return res.status(403).json({ error: "You can only update your own blogs" });
    }

    // Validate category
    if (category) {
      if (!Array.isArray(category)) category = [category];
      const isValid = category.every(cat => mongoose.Types.ObjectId.isValid(cat));
      if (!isValid) return res.status(400).json({ error: "Invalid category format." });
    }

    // Process tags
    let tagIds = [];
    if (tags && tags.length > 0) {
      for (let tagName of tags) {
        let existingTag = await Tag.findOne({ name: tagName });
        if (!existingTag) {
          const newTag = new Tag({ name: tagName, slug: slugify(tagName, { lower: true }) });
          await newTag.save();
          tagIds.push(newTag._id);
        } else {
          tagIds.push(existingTag._id);
        }
      }
    }

    // Generate new slug if title changed
    let uniqueSlug = blog.slug;
    if (title && title !== blog.title) {
      let originalSlug = slugify(title, { lower: true });
      let newSlug = originalSlug;
      let counter = 1;
      while (await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } })) {
        newSlug = `${originalSlug}-${counter}`;
        counter++;
      }
      uniqueSlug = newSlug;
    }

    const updatedData = {
      ...(title && { title }),
      ...(category && { category }),
      ...(tags && tagIds.length > 0 && { tags: tagIds }),
      ...(content && { content }),
      ...(metaTitle && { metaTitle }),
      ...(metaDescription && { metaDescription }),
      ...(uniqueSlug && { slug: uniqueSlug }),
      ...(status && { status }),
      ...(req.file ? { coverImage: req.file.path } : coverImage && { coverImage }),
    };

    const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, { new: true });

    // Invalidate related cache keys (No caching, just invalidation)
    const keysToDelete = [
      `blog:${id}`,
      `relatedBlogs:${id}`,
      `latestBlogs:*`,
      `search:*`,
      `home:blogs:*`,
    ];

    for (const pattern of keysToDelete) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        console.log(`🧹 Invalidated Redis keys: ${keys.join(", ")}`);
      }
    }

    res.status(200).json({ message: "Blog Updated Successfully", blog: updatedBlog });

  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({ error: error.message });
  }
};



// Delete a Blog Post (Admin or Author Only)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Check permissions
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== blog.author.toString()
    ) {
      return res.status(403).json({ error: "You can only delete your own blogs" });
    }

    // Delete the blog
    await Blog.findByIdAndDelete(req.params.id);

    // 🧹 Invalidate related Redis cache
    const patternsToDelete = [
      `blog:${req.params.id}`,
      `relatedBlogs:${req.params.id}`,
      `blogs:*`,              // all paginated blog lists
      `latestBlogs:*`,
      `search:*`,             // cached searches
      `home:blogs:*`,
      `analytics:*`,          // if you cache mostViewedBlog etc.
    ];

    for (const pattern of patternsToDelete) {
      await delCacheByPattern(pattern);
    }

    res.status(200).json({ message: "Blog Deleted Successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ error: "Server error while deleting blog." });
  }
};

// Like or Unlike a Blog Post (User Only)
exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const existingLike = await Like.findOne({ blogId, userId });

    let liked;

    if (existingLike) {
      await existingLike.deleteOne();
      liked = false;
    } else {
      await Like.create({ blogId, userId });
      liked = true;
    }

    const likesCount = await Like.countDocuments({ blogId });

    // ✅ Invalidate cache using correct Redis client
    await client.del(`blog:${blogId}`);
    await client.del(`slug:${blog.slug}`); // Only if slug is used as cache key too

    return res.status(200).json({
      message: liked ? "Blog liked" : "Blog unliked",
      liked,
      likesCount,
    });
  } catch (error) {
    console.error("❌ Error in likeBlog:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


    


exports.saveDraft = async (req, res) => {
    try {
        console.log("📌 Draft Save - req.user:", req.user);
        console.log("📤 Draft Save - req.body:", req.body);

        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized. Please log in to save a draft." });
        }

        let { title, category, content, metaTitle, metaDescription, coverImage, tags } = req.body;

        let status = "draft";

        // Ensure title and content exist for drafts
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required for saving a draft." });
        }

        if (typeof category === "string") category = [category];

        // Validate category IDs
        if (category && (!Array.isArray(category) || !category.every(cat => mongoose.Types.ObjectId.isValid(cat)))) {
            return res.status(400).json({ error: "Invalid category format." });
        }

        let tagIds = [];
        if (tags && tags.length > 0) {
            for (let tagName of tags) {
                let existingTag = await Tag.findOne({ name: tagName });

                if (!existingTag) {
                    const newTag = new Tag({ name: tagName, slug: slugify(tagName, { lower: true }) });
                    await newTag.save();
                    tagIds.push(newTag._id);
                } else {
                    tagIds.push(existingTag._id);
                }
            }
        }

        let slug = slugify(title, { lower: true });
        let uniqueSlug = slug;
        let counter = 1;

        while (await Blog.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const draftData = {
            title,
            category,
            tags: tagIds,
            content,
            slug: uniqueSlug, // Slug is pre-generated in case of publishing later
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
            coverImage: coverImage || "",
            author: req.user._id,
            status,
            permalink: `/blog/${uniqueSlug}`,
        };

        let draft;
        if (req.params.id) {
            // Update existing draft
            draft = await Blog.findByIdAndUpdate(req.params.id, draftData, { new: true });
        } else {
            // Create new draft
            draft = await Blog.create(draftData);
        }

        res.status(200).json({ success: true, message: "Draft saved successfully", blog: draft });

    } catch (error) {
        console.error("❌ Error saving draft:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Publish a Draft
exports.publishDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findOne({ _id: id, status: "draft" });

        if (!blog) return res.status(404).json({ error: "Draft not found" });

        if (req.user.role !== "admin" && req.user._id.toString() !== blog.author.toString()) {
            return res.status(403).json({ error: "You can only publish your own drafts" });
        }

        blog.status = "published";
        blog.updatedAt = Date.now();
        await blog.save();

        res.status(200).json({ message: "Draft published successfully", blog });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get latest draft
exports.getLatestDraft = async (req, res) => {
    try {
        const latestDraft = await Blog.findOne({ status: "draft", author: req.user._id }).sort({ updatedAt: -1 });

        if (!latestDraft) return res.status(404).json({ message: "No draft found" });

        res.json(latestDraft);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllDrafts = async (req, res) => {
    try {
        const drafts = await Blog.find({ status: "draft" }).populate("author", "name email");
        res.status(200).json(drafts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};





exports.commentOnBlog = async (req, res) => {
  try {
    const { id: blogId } = req.params;
    const { commentText, parentId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "You must be logged in to comment" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const newComment = new Comment({
      comment: commentText,
      userId: req.user._id,
      blogId,
      parentId: parentId || null,
    });

    await newComment.save();
    await newComment.populate("userId", "name");

    // Invalidate Redis cache related to this blog's comments or detail
    const keysToDelete = [
      `blog:${blogId}`,
      `comments:${blogId}`,
      `home:blogs:*`,
      `latestComments:*`
    ];

    for (const pattern of keysToDelete) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        console.log(`🧹 Invalidated Redis keys: ${keys.join(", ")}`);
      }
    }

    res.status(201).json({ message: "Comment added successfully", comment: newComment });

  } catch (error) {
    console.error("❌ Error commenting on blog:", error);
    res.status(500).json({ error: error.message });
  }
};

  

exports.getCommentsForBlog = async (req, res) => {
  try {
    const { id: blogId } = req.params;
    const cacheKey = `comments:${blogId}`;

    // Try fetching from Redis cache
    const cachedComments = await getCache(cacheKey);
    if (cachedComments) {
      return res.status(200).json(cachedComments);
    }

    // If not in cache, fetch from DB
    const comments = await Comment.find({ blogId })
      .populate("userId", "name");

    // Cache the result for future requests (e.g., 1 hour = 3600 seconds)
    await setCache(cacheKey, comments, 3600);

    res.status(200).json(comments);
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentText } = req.body;
    const { commentId } = req.params;

    if (!commentText) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { comment: commentText },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Comment not found." });
    }

    // Invalidate Redis cache for this blog's comments
    const cacheKey = `comments:${updated.blogId}`;
    await client.del(cacheKey);

    res.json({ message: "Comment updated", comment: updated });
  } catch (error) {
    console.error("❌ Error updating comment:", error);
    res.status(500).json({ error: error.message });
  }
};
  
  // ✅ Delete Comment
  exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;
  
    try {
      // Step 0: Get the blogId from the original comment
      const originalComment = await Comment.findById(commentId);
      if (!originalComment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      const blogId = originalComment.blogId;
  
      // Recursive function to delete replies
      const deleteReplies = async (parentId) => {
        const replies = await Comment.find({ parentId });
  
        for (let reply of replies) {
          await deleteReplies(reply._id); // recursively delete nested replies
          await Comment.findByIdAndDelete(reply._id);
        }
      };
  
      // Step 1: Delete all nested replies
      await deleteReplies(commentId);
  
      // Step 2: Delete the parent comment
      await Comment.findByIdAndDelete(commentId);
  
      // Step 3: Invalidate Redis cache
      const cacheKey = `comments:${blogId}`;
      await client.del(cacheKey);
  
      res.json({ message: "Comment and its replies deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment and replies" });
    }
  };