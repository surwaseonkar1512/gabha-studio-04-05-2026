const mongoose = require('mongoose');

const instagramGallerySchema = new mongoose.Schema({
  image: { type: String, required: true },
  url: { type: String, required: true },
  caption: { type: String },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InstagramGallery', instagramGallerySchema);
