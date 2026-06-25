const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true }
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: false
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String
  },
  customerLocation: {
    type: String
  },
  customerAddress: {
    type: String
  },
  productName: {
    type: String
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  items: [quotationItemSchema],
  gstEnabled: {
    type: Boolean,
    default: false
  },
  gstPercentage: {
    type: Number,
    default: 18
  },
  subTotal: {
    type: Number,
    required: true
  },
  gstAmount: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  pdfUrl: { type: String },
  pdfPublicId: { type: String },
  generatedAt: { type: Date }
}, { timestamps: true });

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
