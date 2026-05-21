const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electricity Bill', 'Raw Materials', 'Transport Charges', 
      'Salaries', 'Office Expenses', 'Vendor Payments', 
      'Equipment Purchases', 'Maintenance', 'Internet Bill', 
      'Marketing', 'Other'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  method: {
    type: String,
    required: true,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Cheque']
  },
  vendorName: {
    type: String
  },
  proofUrls: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
