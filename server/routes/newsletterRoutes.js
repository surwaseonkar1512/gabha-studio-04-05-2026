const express = require('express');
const {
  subscribeNewsletter,
  getSubscribers,
  updateSubscriberStatus
} = require('../controllers/newsletterController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Public subscription route
router.post('/public', subscribeNewsletter);

// Private CRM routes
router.use(protect);

router.route('/')
  .get(checkPermission('crm', 'view'), getSubscribers);

router.route('/:id/status')
  .put(checkPermission('crm', 'edit'), updateSubscriberStatus);

module.exports = router;
