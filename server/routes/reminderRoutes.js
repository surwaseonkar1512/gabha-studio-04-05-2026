const express = require('express');
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(checkPermission('crm', 'view'), getReminders)
  .post(checkPermission('crm', 'add'), createReminder);

router
  .route('/:id')
  .put(checkPermission('crm', 'edit'), updateReminder)
  .delete(checkPermission('crm', 'delete'), deleteReminder);

module.exports = router;
