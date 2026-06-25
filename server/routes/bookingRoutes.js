const express = require('express');
const {
  createBookingWithAdvance,
  addPayment,
  getBookings,
  getBookingDetails,
  generateInvoicePDF
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/advance', protect, upload.array('proofs', 5), createBookingWithAdvance);
router.post('/:id/payment', protect, upload.array('proofs', 5), addPayment);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingDetails);
router.get('/:bookingId/invoice/:paymentId', generateInvoicePDF);

module.exports = router;
