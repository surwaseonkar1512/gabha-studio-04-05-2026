const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  secure_url: { type: String },
  public_id: { type: String }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true }, // Map to Category Name
  slug: { type: String, required: true, unique: true },
  categoryImage: {
    type: mongoose.Schema.Types.Mixed, // Supports old string URL or new imageSchema object
    required: true
  },
  bannerImage: {
    type: mongoose.Schema.Types.Mixed, // Supports old string URL or new imageSchema object
  },
  shortDescription: { type: String },
  fullDescription: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }, // Keep for backward compatibility
  status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
