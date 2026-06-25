const express = require('express');
const {
  createExpense,
  getExpenses,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.array('proofs', 5), createExpense);
router.get('/', protect, getExpenses);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
