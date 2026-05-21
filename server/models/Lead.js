const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
    source: {
      type: String,
      enum: ['Website Form', 'Product Inquiry', 'Manual Entry'],
      default: 'Manual Entry',
    },
    stage: {
      type: String,
      enum: ['New Lead', 'Contacted', 'Quote Sent', 'Booking', 'Completed'],
      default: 'New Lead',
    },
    notes: [
      {
        text: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    productReference: {
      type: String, // Or ObjectId if referencing Product model later
    },
    hasQuotation: {
      type: Boolean,
      default: false
    },
    quotationSkipped: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
