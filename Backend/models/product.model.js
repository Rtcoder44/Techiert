const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    public_id: String
  }],
  affiliateUrl: {
    type: String,
    default: ''
  },
  specifications: {
    type: Map,
    of: String
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  aiContent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  }
  next();
});

productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ updatedAt: -1 });

const aiProductContentSchema = new mongoose.Schema({
  handle: { type: String, required: true, unique: true },
  productId: { type: String },
  aiContent: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  product: mongoose.model('Product', productSchema),
  aiProductContent: mongoose.model('AiProductContent', aiProductContentSchema)
};
