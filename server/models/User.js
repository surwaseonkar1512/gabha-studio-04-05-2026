const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
      default: 'STAFF',
    },
    permissions: {
      crm: {
        type: [String],
        enum: ['view', 'add', 'edit', 'delete'],
        default: ['view'],
      },
      cms: {
        type: [String],
        enum: ['view', 'add', 'edit', 'delete'],
        default: [],
      },
      expenses: {
        type: [String],
        enum: ['view', 'add', 'edit', 'delete'],
        default: [],
      },
      dashboard: {
        type: [String],
        enum: ['view'],
        default: [],
      },
    },
    resetPasswordOtp: String,
    resetPasswordOtpExpiry: Date,
    loginOtp: String,
    loginOtpExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
