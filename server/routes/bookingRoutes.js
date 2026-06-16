const express = require('express');
const {
  createBookingWithAdvance,
  addPayment,
  getBookings,
  getBookingDetails,
  generateInvoicePDF
} = require('../controllers/bookingController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/advance', protect, checkPermission('orders', 'create'), upload.array('proofs', 5), createBookingWithAdvance);
router.post('/:id/payment', protect, checkPermission('orders', 'update'), upload.array('proofs', 5), addPayment);
router.get('/', protect, checkPermission('orders', 'view'), getBookings);
router.get('/:id', protect, checkPermission('orders', 'view'), getBookingDetails);
router.get('/:bookingId/invoice/:paymentId', generateInvoicePDF);

module.exports = router;
