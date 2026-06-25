const express = require('express');
const {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster,
  generateMasterPDF
} = require('../controllers/quotationMasterController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getMasters)
  .post(protect, createMaster);

router.route('/:id')
  .put(protect, updateMaster)
  .delete(protect, deleteMaster);

router.route('/:id/pdf').get(generateMasterPDF);

module.exports = router;
