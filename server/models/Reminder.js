const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  reminderDate: {
    type: Date,
    required: true,
  },
  reminderTime: {
    type: String,
    required: true,
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  notifiedOneDay: {
    type: Boolean,
    default: false,
  },
  notifiedOneHour: {
    type: Boolean,
    default: false,
  },
  notifiedAtTime: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
