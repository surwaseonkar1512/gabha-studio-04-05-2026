const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, required: true },
  reference: { type: String },
  notes: { type: String },
  isFinal: { type: Boolean, default: false },
  proofUrls: [{ type: String }],
  pdfUrl: { type: String },
  pdfPublicId: { type: String },
  generatedAt: { type: Date }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: false
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  payments: [paymentSchema],
  deliveryDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
