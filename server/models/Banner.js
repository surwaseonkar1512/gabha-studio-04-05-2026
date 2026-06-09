const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  bannerImage: { type: String, required: true },
  mobileBannerImage: { type: String },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
