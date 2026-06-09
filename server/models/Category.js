const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryImage: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
