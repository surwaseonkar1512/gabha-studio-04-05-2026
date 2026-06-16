const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const logActivityAndSave = async (user, req) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  if (!user.loginActivity) {
    user.loginActivity = [];
  }

  user.loginActivity.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
  });

  // Cap at 15 items
  if (user.loginActivity.length > 15) {
    user.loginActivity = user.loginActivity.slice(-15);
  }

  await user.save({ validateBeforeSave: false });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'Inactive') {
        return res.status(403).json({ message: 'Your account is deactivated. Please contact an administrator.' });
      }

      await logActivityAndSave(user, req);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        status: user.status,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Login OTP
// @route   POST /api/auth/send-login-otp
// @access  Public
const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact an administrator.' });
    }

    const otp = generateOTP();
    user.loginOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.loginOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Login OTP',
        message: `Your login OTP is ${otp}. It is valid for 10 minutes.`,
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      user.loginOtp = undefined;
      user.loginOtpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with OTP
// @route   POST /api/auth/login-otp
// @access  Public
const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({
      email,
      loginOtp: hashedOTP,
      loginOtpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact an administrator.' });
    }

    user.loginOtp = undefined;
    user.loginOtpExpiry = undefined;
    await logActivityAndSave(user, req);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phone: user.phone,
      employeeId: user.employeeId,
      department: user.department,
      designation: user.designation,
      status: user.status,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP',
        message: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`,
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOTP,
      resetPasswordOtpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    user.mustChangePassword = false; // Reset first-login password force if they reset it this way
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change Password (logged in)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phone: user.phone,
      employeeId: user.employeeId,
      department: user.department,
      designation: user.designation,
      status: user.status,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile (logged in)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }

    // Handle password change if optional current/new passwords are provided
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid current password' });
      }
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      employeeId: updatedUser.employeeId,
      department: updatedUser.department,
      designation: updatedUser.designation,
      status: updatedUser.status,
      permissions: updatedUser.permissions,
      mustChangePassword: updatedUser.mustChangePassword,
      loginActivity: updatedUser.loginActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  sendLoginOtp,
  loginWithOtp,
  getUserProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUserProfile,
};
