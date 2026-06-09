const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'About Us' },
  subtitle: { type: String, default: 'Our Story' },
  description: { type: String, default: '' },
  leftImage: { type: String, default: '' },
  rightImage: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AboutUs', aboutUsSchema);
