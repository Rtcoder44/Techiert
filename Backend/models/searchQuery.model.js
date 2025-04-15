const mongoose = require("mongoose");

const searchQuerySchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    count: { type: Number, default: 1 }
  },
  { timestamps: true }
);

searchQuerySchema.index({ query: 1 }); // Optional: For faster search aggregation

const SearchQuery = mongoose.model("SearchQuery", searchQuerySchema);

module.exports = SearchQuery;
