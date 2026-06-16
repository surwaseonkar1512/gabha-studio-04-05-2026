const express = require('express');
const {
  submitContact,
  getContacts,
  updateContactStatus
} = require('../controllers/contactController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Public contact endpoint
router.post('/public', submitContact);

// Private CRM routes
router.use(protect);

router.route('/')
  .get(checkPermission('crm', 'view'), getContacts);

router.route('/:id/status')
  .put(checkPermission('crm', 'edit'), updateContactStatus);

module.exports = router;
