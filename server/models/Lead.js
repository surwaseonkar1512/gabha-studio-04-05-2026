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
    productName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    fullAddress: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    locationType: {
      type: String,
      enum: ['GPS', 'Manual'],
      default: 'Manual',
    },
    notesRequirements: {
      type: String,
    },
    hasQuotation: {
      type: Boolean,
      default: false
    },
    quotationSkipped: {
      type: Boolean,
      default: false
    },
    activityLogs: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
      }
    ],
    reminders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reminder'
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
