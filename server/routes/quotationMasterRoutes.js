const express = require('express');
const {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster,
  generateMasterPDF
} = require('../controllers/quotationMasterController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, checkPermission('quotations', 'view'), getMasters)
  .post(protect, checkPermission('quotations', 'create'), createMaster);

router.route('/:id')
  .put(protect, checkPermission('quotations', 'edit'), updateMaster)
  .delete(protect, checkPermission('quotations', 'delete'), deleteMaster);

router.route('/:id/pdf').get(generateMasterPDF);

module.exports = router;
