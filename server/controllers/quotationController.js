const Quotation = require('../models/Quotation');
const Lead = require('../models/Lead');
const PDFDocument = require('pdfkit');

// @desc    Create a new quotation
// @route   POST /api/quotations
// @access  Private
const createQuotation = async (req, res) => {
  try {
    const { leadId, items, gstEnabled } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Generate quotation number (e.g., GS-0001)
    const count = await Quotation.countDocuments();
    const nextNumber = count + 1;
    const quotationNumber = `GS-${nextNumber.toString().padStart(4, '0')}`;

    // Calculate totals
    const subTotal = items.reduce((acc, item) => acc + Number(item.amount), 0);
    const gstAmount = gstEnabled ? subTotal * 0.18 : 0;
    const total = subTotal + gstAmount;

    const quotation = await Quotation.create({
      quotationNumber,
      lead: leadId,
      items,
      gstEnabled,
      subTotal,
      gstAmount,
      total,
    });

    lead.hasQuotation = true;
    if(lead.stage === 'New Lead' || lead.stage === 'Contacted') {
      lead.stage = 'Quote Sent';
    }
    await lead.save();

    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quotations for a lead
// @route   GET /api/quotations/lead/:leadId
// @access  Private
const getLeadQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ lead: req.params.leadId }).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF for quotation
// @route   GET /api/quotations/:id/pdf
// @access  Private (or Public if using direct link in WA)
const generateQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('lead');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers to trigger file download or inline view
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=quotation-${quotation.quotationNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('GABHA STUDIO', { align: 'center' });
    doc.fontSize(10).text('Art Gallery & Photography Services', { align: 'center' });
    doc.moveDown();
    
    // Address & Info
    doc.fontSize(10).text('123 Creative Avenue, Mumbai, India');
    doc.text('Phone: +91 9876543210 | Email: hello@gabhastudio.com');
    doc.moveDown();
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Quotation Details
    doc.fontSize(14).text('QUOTATION', { align: 'right' });
    doc.fontSize(10).text(`Quotation No: ${quotation.quotationNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, { align: 'right' });
    
    // Customer Details
    doc.moveUp(3);
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(quotation.lead.name);
    doc.text(quotation.lead.phone);
    if(quotation.lead.email) doc.text(quotation.lead.email);
    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Amount (INR)', 400, tableTop, { width: 150, align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    // Table Rows
    let y = tableTop + 25;
    doc.font('Helvetica');
    quotation.items.forEach(item => {
      doc.text(item.description, 50, y);
      doc.text(item.amount.toLocaleString('en-IN'), 400, y, { width: 150, align: 'right' });
      y += 20;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Totals
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 300, y, { width: 100, align: 'right' });
    doc.text(quotation.subTotal.toLocaleString('en-IN'), 400, y, { width: 150, align: 'right' });
    y += 20;

    if (quotation.gstEnabled) {
      doc.text('GST (18%):', 300, y, { width: 100, align: 'right' });
      doc.text(quotation.gstAmount.toLocaleString('en-IN'), 400, y, { width: 150, align: 'right' });
      y += 20;
    }

    doc.moveTo(300, y).lineTo(550, y).stroke();
    y += 10;

    doc.fontSize(12).text('Grand Total:', 300, y, { width: 100, align: 'right' });
    doc.text(`Rs. ${quotation.total.toLocaleString('en-IN')}`, 400, y, { width: 150, align: 'right' });
    
    // Footer / Signatures
    const bottomY = doc.page.height - 150;
    doc.fontSize(10).text('Authorized Signatory', 400, bottomY, { width: 150, align: 'center' });
    doc.text('___________________', 400, bottomY + 50, { width: 150, align: 'center' });
    
    doc.text('Company Stamp', 50, bottomY, { width: 150, align: 'center' });
    doc.text('___________________', 50, bottomY + 50, { width: 150, align: 'center' });
    
    // End document
    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createQuotation, getLeadQuotations, generateQuotationPDF };
