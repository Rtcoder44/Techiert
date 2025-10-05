const { product: Product } = require('../models/product.model');
const ProductCategory = require('../models/productCategory.model');
const cloudinary = require('../config/cloudinary');
const slugify = require('slugify');
const mongoose = require('mongoose');
const { setCache, getCache, delCache, delCacheByPattern } = require('../utils/redisClient');
const { generateProductDetails } = require('../services/gemini.service');

// Optimized image upload function (handles local files only)
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'product-images',
      transformation: [
        { width: 800, height: 800, crop: "fill", gravity: "auto" },
        { fetch_format: "webp", quality: "auto:good" },
        { flags: "preserve_transparency" },
      ],
      eager: [
        {
          width: 200,
          height: 200,
          crop: "fill",
          gravity: "auto",
          fetch_format: "webp",
          quality: "auto:good",
        }
      ]
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      thumbnail: result.eager[0].secure_url
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed');
  }
};

// Normalize file from multer-storage-cloudinary (already uploaded)
const normalizeCloudinaryFile = (file) => {
  // When using CloudinaryStorage, file.path is the secure URL and file.filename is public_id
  if (file && file.path && /^https?:\/\//.test(file.path)) {
    return {
      public_id: file.filename || file.public_id || '',
      url: file.path,
      thumbnail: file.path,
    };
  }
  return null;
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, specifications, affiliateUrl } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "Product images are required" });
    }

    // Generate slug from title
    let slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug exists and make it unique if needed
    let slugExists = await Product.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
      slugExists = await Product.findOne({ slug });
      counter++;
    }

    // Resolve category: accepts Mongo ID or category name; creates if missing
    let categoryId = null;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const byId = await ProductCategory.findById(category);
        if (byId) categoryId = byId._id;
      }
      if (!categoryId) {
        const candidateName = String(category).trim();
        const candidateSlug = slugify(candidateName, { lower: true, strict: true });
        let byName = await ProductCategory.findOne({ $or: [ { slug: candidateSlug }, { name: new RegExp(`^${candidateName}$`, 'i') } ] });
        if (!byName) {
          byName = await ProductCategory.create({ name: candidateName, slug: candidateSlug });
        }
        categoryId = byName._id;
      }
    }
    if (!categoryId) {
      return res.status(400).json({ success: false, error: "Invalid category" });
    }

    // Process images: if using CloudinaryStorage, files already uploaded
    let images = [];
    if (Array.isArray(req.files)) {
      const fromStorage = req.files.map(normalizeCloudinaryFile).filter(Boolean);
      if (fromStorage.length > 0) {
        images = fromStorage;
      } else {
        const imagePromises = req.files.map(file => uploadImage(file));
        images = await Promise.all(imagePromises);
      }
    }

    // Handle specifications
    let specificationsData = {};
    if (specifications) {
      try {
        const specsData = JSON.parse(specifications);
        if (typeof specsData === 'object' && !Array.isArray(specsData)) {
          // If it's already in object format
          specificationsData = specsData;
        } else if (Array.isArray(specsData)) {
          // If it's in array format, convert to object
          specsData.forEach(spec => {
            if (spec && spec.key && spec.value) {
              specificationsData[spec.key] = spec.value;
            }
          });
        } else {
          throw new Error('Invalid specifications format');
        }
      } catch (error) {
        console.error('Error processing specifications:', error);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid specifications format' 
        });
      }
    }

    let aiContent = '';
    if (!description || description.trim().length < 30) {
      try {
        aiContent = await generateProductDetails(title, description || title);
      } catch (err) {
        console.error('Gemini generation failed:', err.message);
        aiContent = '';
      }
    }

    const product = await Product.create({
      title,
      slug,
      description,
      price,
      category: categoryId,
      stock,
      specifications: specificationsData,
      images,
      affiliateUrl: affiliateUrl || '',
      createdBy: req.user._id,
      aiContent,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || 'latest';
    const stock = req.query.stock || 'all';
    const exclude = req.query.exclude || '';

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ success: false, error: "Invalid category ID" });
      }
      query.category = category;
    }

    // Stock filter
    if (stock === 'inStock') query.stock = { $gt: 0 };
    if (stock === 'outOfStock') query.stock = 0;

    // Exclude specific product
    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      query._id = { $ne: exclude };
    }

    const sortOptions = {
      latest: { updatedAt: -1 },
      oldest: { updatedAt: 1 },
      priceHigh: { price: -1 },
      priceLow: { price: 1 },
      nameAZ: { title: 1 },
      nameZA: { title: -1 }
    };

    // Use default sort if invalid sort option provided
    const sortKey = sortOptions[sort] ? sort : 'latest';

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions[sortKey])
        .skip(skip)
        .limit(limit)
        .select('title slug price images updatedAt affiliateUrl')
        .lean(),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category") // ✅ include category info
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    const oldSlug = product.slug;
    const updateData = { ...req.body };

    // Update slug if title is changed
    if (updateData.title) {
      let newSlug = slugify(updateData.title, { lower: true, strict: true });
      
      // Check if new slug exists and make it unique if needed
      let slugExists = await Product.findOne({ 
        slug: newSlug,
        _id: { $ne: req.params.id } // exclude current product
      });
      let counter = 1;
      while (slugExists) {
        newSlug = `${slugify(updateData.title, { lower: true, strict: true })}-${counter}`;
        slugExists = await Product.findOne({ 
          slug: newSlug,
          _id: { $ne: req.params.id }
        });
        counter++;
      }
      
      updateData.slug = newSlug;
    }

    // Validate category if updated
    if (updateData.category) {
      const categoryExists = await ProductCategory.findById(updateData.category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, error: "Invalid category ID" });
      }
    }

    // Update images if provided
    if (req.files && req.files.length > 0) {
      const deletePromises = product.images.map(image =>
        cloudinary.uploader.destroy(image.public_id)
      );
      await Promise.all(deletePromises);

      const imagePromises = req.files.map(file => uploadImage(file));
      updateData.images = await Promise.all(imagePromises);
    }

    // Handle specifications update
    if (updateData.specifications) {
      try {
        const specsData = JSON.parse(updateData.specifications);
        if (typeof specsData === 'object' && !Array.isArray(specsData)) {
          // If it's already in object format
          updateData.specifications = specsData;
        } else if (Array.isArray(specsData)) {
          // If it's in array format, convert to object
          const specificationsData = {};
          specsData.forEach(spec => {
            if (spec && spec.key && spec.value) {
              specificationsData[spec.key] = spec.value;
            }
          });
          updateData.specifications = specificationsData;
        } else {
          throw new Error('Invalid specifications format');
        }
      } catch (error) {
        console.error('Error processing specifications:', error);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid specifications format' 
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category");

    // Clear product cache for old and new slug
    if (oldSlug) await delCache(`product:${oldSlug}`);
    if (product.slug && product.slug !== oldSlug) await delCache(`product:${product.slug}`);
    // Clear product list cache
    await delCacheByPattern('products:*');
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Delete images from cloudinary
    const deletePromises = product.images.map(image =>
      cloudinary.uploader.destroy(image.public_id)
    );
    await Promise.all(deletePromises);

    await Product.findByIdAndDelete(req.params.id);

    // Clear product cache for slug
    if (product.slug) await delCache(`product:${product.slug}`);
    // Clear product list cache
    await delCacheByPattern('products:*');
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'name avatar'
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      reviews: product.reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    // Validate input
    if (!rating || !review) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating and review text are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be between 1 and 5' 
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if user has already reviewed
    const existingReview = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this product' 
      });
    }

    product.reviews.push({
      user: req.user._id,
      rating,
      review
    });

    // Calculate new average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'name avatar'
      });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      reviews: updatedProduct.reviews,
      rating: updatedProduct.rating
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding review', 
      error: error.message 
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviewIndex = product.reviews.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    product.reviews[reviewIndex].rating = rating;
    product.reviews[reviewIndex].review = review;

    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate({
        path: 'reviews.user',
        select: 'name avatar'
      });

    res.status(200).json({
      message: 'Review updated successfully',
      reviews: updatedProduct.reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.reviews = product.reviews.filter(
      review => review.user.toString() !== req.user._id.toString()
    );

    await product.save();

    res.status(200).json({
      message: 'Review deleted successfully',
      reviews: product.reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userLikedIndex = product.likes.indexOf(req.user._id);
    let liked;

    if (userLikedIndex === -1) {
      product.likes.push(req.user._id);
      liked = true;
    } else {
      product.likes.splice(userLikedIndex, 1);
      liked = false;
    }

    await product.save();

    res.status(200).json({
      liked,
      likes: product.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category")
      .populate({
        path: 'reviews.user',
        select: 'name avatar'
      })
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
