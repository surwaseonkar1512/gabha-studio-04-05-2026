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
      enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'manager', 'admin', 'user'],
      default: 'STAFF',
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    department: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    loginActivity: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
        userAgent: String,
      },
    ],
    permissions: {
      products: {
        type: [String],
        default: [],
      },
      categories: {
        type: [String],
        default: [],
      },
      orders: {
        type: [String],
        default: [],
      },
      crm: {
        type: [String],
        default: ['view'],
      },
      quotations: {
        type: [String],
        default: [],
      },
      employees: {
        type: [String],
        default: [],
      },
      reports: {
        type: [String],
        default: [],
      },
      cms: {
        type: [String],
        default: [],
      },
      expenses: {
        type: [String],
        default: [],
      },
      dashboard: {
        type: [String],
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

// Hash password before saving & set employee ID
userSchema.pre('save', async function () {
  if (this.isNew && !this.employeeId) {
    const lastUser = await mongoose.model('User').findOne({ employeeId: /^EMP-\d+/ }).sort({ employeeId: -1 });
    let nextNum = 1;
    if (lastUser && lastUser.employeeId) {
      const matches = lastUser.employeeId.match(/EMP-(\d+)/);
      if (matches) {
        nextNum = parseInt(matches[1], 10) + 1;
      }
    }
    this.employeeId = `EMP-${String(nextNum).padStart(4, '0')}`;
  }

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
