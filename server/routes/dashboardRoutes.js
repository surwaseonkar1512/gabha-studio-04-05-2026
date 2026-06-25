const express = require('express');
const { getDashboardData, getCustomersList } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getDashboardData);
router.get('/customers', protect, getCustomersList);

module.exports = router;
