const express = require('express');
const {
  createQuotation,
  getLeadQuotations,
  generateQuotationPDF,
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createQuotation);
router.get('/lead/:leadId', protect, getLeadQuotations);
// Make PDF generation public so clients can download it via WhatsApp directly if needed
// Or protect it and send the PDF directly via WhatsApp API. For now, public URL is easier.
router.get('/:id/pdf', generateQuotationPDF);

module.exports = router;
