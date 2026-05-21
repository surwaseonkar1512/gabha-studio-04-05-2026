const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['lead', 'system', 'alert', 'task', 'payment'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d', // MongoDB TTL Index: Document expires 7 days after createdAt
    },
  },
  {
    timestamps: false,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
