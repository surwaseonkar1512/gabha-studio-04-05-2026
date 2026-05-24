const mongoose = require('mongoose');

const quotationMasterItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true }
});

const quotationMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  items: [quotationMasterItemSchema],
  gstPercentage: {
    type: Number,
    default: 18,
    min: 0,
    max: 99
  }
}, { timestamps: true });

const QuotationMaster = mongoose.model('QuotationMaster', quotationMasterSchema);

module.exports = QuotationMaster;
