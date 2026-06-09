const mongoose = require('mongoose');

const productAnalyticsSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: {
    type: String,
    enum: ['View', 'Click', 'AddToCart', 'Wishlist', 'Order'],
    required: true
  },
  date: { type: Date, required: true } // Stored as normalized date (midnight) for grouping
}, { timestamps: true });

module.exports = mongoose.model('ProductAnalytics', productAnalyticsSchema);
