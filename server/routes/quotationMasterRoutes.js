const express = require('express');
const {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster
} = require('../controllers/quotationMasterController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getMasters)
  .post(protect, createMaster);

router.route('/:id')
  .put(protect, updateMaster)
  .delete(protect, deleteMaster);

module.exports = router;
