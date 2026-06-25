const express = require('express');
const { getContactInquiries, createContactInquiry, updateContactInquiryStatus } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public submission route
router.post('/public', createContactInquiry);

// Protected admin routes
router.get('/', protect, getContactInquiries);
router.put('/:id/status', protect, updateContactInquiryStatus);

module.exports = router;
