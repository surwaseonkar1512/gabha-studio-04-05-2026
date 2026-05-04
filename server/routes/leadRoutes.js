const express = require('express');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addLeadNote,
} = require('../controllers/leadController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for website forms (could be secured with a different mechanism later)
router.post('/public', createLead);

router.use(protect);

router
  .route('/')
  .get(checkPermission('crm', 'view'), getLeads)
  .post(checkPermission('crm', 'add'), createLead);

router
  .route('/:id')
  .get(checkPermission('crm', 'view'), getLeadById)
  .put(checkPermission('crm', 'edit'), updateLead)
  .delete(checkPermission('crm', 'delete'), deleteLead);

router.route('/:id/notes').post(checkPermission('crm', 'edit'), addLeadNote);

module.exports = router;
