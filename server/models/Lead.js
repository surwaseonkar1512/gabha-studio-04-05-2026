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
    // NEW NESTED SCHEMAS
    customerDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      company: { type: String }
    },
    productDetails: {
      productName: { type: String },
      productImage: { type: String },
      productPrice: { type: Number },
      SKU: { type: String },
      category: { type: String }
    },
    requirementDetails: {
      quantity: { type: Number, default: 1 },
      size: { type: String },
      color: { type: String },
      location: { type: String },
      deliveryDate: { type: Date },
      notes: { type: String }
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Won', 'Lost'],
      default: 'New'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
      type: String,
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

// Pre-save hook to synchronize top-level and nested fields
leadSchema.pre('save', function () {
  // Sync name, email, phone to customerDetails
  if (!this.customerDetails) this.customerDetails = {};
  if (this.name) this.customerDetails.name = this.name;
  if (this.email) this.customerDetails.email = this.email;
  if (this.phone) this.customerDetails.phone = this.phone;

  // Sync productName to productDetails
  if (!this.productDetails) this.productDetails = {};
  if (this.productName) this.productDetails.productName = this.productName;

  // Sync location to requirementDetails
  if (!this.requirementDetails) this.requirementDetails = {};
  if (this.location) this.requirementDetails.location = this.location;
  if (this.notesRequirements) this.requirementDetails.notes = this.notesRequirements;

  // Sync stage <-> status
  const stageToStatus = {
    'New Lead': 'New',
    'Contacted': 'Contacted',
    'Quote Sent': 'Quotation Sent',
    'Booking': 'Negotiation',
    'Completed': 'Won'
  };
  const statusToStage = {
    'New': 'New Lead',
    'Contacted': 'Contacted',
    'Quotation Sent': 'Quote Sent',
    'Negotiation': 'Booking',
    'Won': 'Completed',
    'Lost': 'Completed'
  };

  // If status is modified, update stage. If stage is modified, update status
  if (this.isModified('status')) {
    this.stage = statusToStage[this.status] || this.stage;
  } else if (this.isModified('stage')) {
    this.status = stageToStatus[this.stage] || this.status;
  }
});

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
