const express = require('express');
const {
  loginUser,
  sendLoginOtp,
  loginWithOtp,
  getUserProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.post('/send-login-otp', sendLoginOtp);
router.post('/login-otp', loginWithOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
