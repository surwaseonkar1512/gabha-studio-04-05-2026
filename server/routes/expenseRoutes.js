const express = require('express');
const {
  createExpense,
  getExpenses,
  deleteExpense
} = require('../controllers/expenseController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, checkPermission('expenses', 'create'), upload.array('proofs', 5), createExpense);
router.get('/', protect, checkPermission('expenses', 'view'), getExpenses);
router.delete('/:id', protect, checkPermission('expenses', 'delete'), deleteExpense);

module.exports = router;
