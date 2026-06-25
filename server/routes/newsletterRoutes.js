const express = require('express');
const { getNewsletterSubscribers, createNewsletterSubscriber, updateNewsletterSubscriberStatus } = require('../controllers/newsletterController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public subscription route
router.post('/public', createNewsletterSubscriber);

// Protected admin routes
router.get('/', protect, getNewsletterSubscribers);
router.put('/:id/status', protect, updateNewsletterSubscriberStatus);

module.exports = router;
