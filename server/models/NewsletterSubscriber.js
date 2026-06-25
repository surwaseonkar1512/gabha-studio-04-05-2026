const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  source: { type: String, default: 'Website Footer' },
  status: { type: String, enum: ['Active', 'Unsubscribed'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
