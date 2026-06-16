const express = require('express');
const {
  createQuotation,
  getQuotations,
  getLeadQuotations,
  updateQuotation,
  deleteQuotation,
  generateQuotationPDF,
} = require('../controllers/quotationController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, checkPermission('quotations', 'create'), createQuotation);
router.get('/', protect, checkPermission('quotations', 'view'), getQuotations);
router.get('/lead/:leadId', protect, checkPermission('quotations', 'view'), getLeadQuotations);
router.put('/:id', protect, checkPermission('quotations', 'edit'), updateQuotation);
router.delete('/:id', protect, checkPermission('quotations', 'delete'), deleteQuotation);
// Make PDF generation public so clients can download it via WhatsApp directly if needed
router.get('/:id/pdf', generateQuotationPDF);

module.exports = router;
