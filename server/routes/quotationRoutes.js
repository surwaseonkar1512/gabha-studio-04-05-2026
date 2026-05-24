const express = require('express');
const {
  createQuotation,
  getQuotations,
  getLeadQuotations,
  updateQuotation,
  deleteQuotation,
  generateQuotationPDF,
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createQuotation);
router.get('/', protect, getQuotations);
router.get('/lead/:leadId', protect, getLeadQuotations);
router.put('/:id', protect, updateQuotation);
router.delete('/:id', protect, deleteQuotation);
// Make PDF generation public so clients can download it via WhatsApp directly if needed
router.get('/:id/pdf', generateQuotationPDF);

module.exports = router;
