const Quotation = require('../models/Quotation');
const Lead = require('../models/Lead');
const PDFDocument = require('pdfkit');

// @desc    Create a new quotation
// @route   POST /api/quotations
// @access  Private
const createQuotation = async (req, res) => {
  try {
    const {
      leadId,
      items,
      gstEnabled,
      gstPercentage = 18,
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
      customerAddress,
      productName,
      notes,
      status
    } = req.body;

    let lead = null;
    let finalCustomerName = customerName;
    let finalCustomerPhone = customerPhone;
    let finalCustomerEmail = customerEmail;
    let finalCustomerLocation = customerLocation;
    let finalCustomerAddress = customerAddress;
    let finalProductName = productName;
    let finalNotes = notes;

    if (leadId) {
      lead = await Lead.findById(leadId);
      if (lead) {
        finalCustomerName = customerName || lead.name;
        finalCustomerPhone = customerPhone || lead.phone;
        finalCustomerEmail = customerEmail || lead.email;
        finalCustomerLocation = customerLocation || lead.location;
        finalCustomerAddress = customerAddress || lead.fullAddress;
        finalProductName = productName || lead.productName;
        finalNotes = notes || lead.notesRequirements;
      }
    }

    if (!finalCustomerName || !finalCustomerPhone) {
      return res.status(400).json({ message: 'Customer Name and Phone are required' });
    }

    // Generate quotation number (e.g., GS-0001)
    const count = await Quotation.countDocuments();
    const nextNumber = count + 1;
    const quotationNumber = `GS-${nextNumber.toString().padStart(4, '0')}`;

    // Calculate totals
    const subTotal = items.reduce((acc, item) => acc + Number(item.amount), 0);
    const gstRate = gstPercentage / 100;
    const gstAmount = gstEnabled ? subTotal * gstRate : 0;
    const total = subTotal + gstAmount;

    const quotation = await Quotation.create({
      quotationNumber,
      lead: leadId || null,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerEmail: finalCustomerEmail || '',
      customerLocation: finalCustomerLocation || '',
      customerAddress: finalCustomerAddress || '',
      productName: finalProductName || '',
      notes: finalNotes || '',
      status: status || 'Draft',
      items,
      gstEnabled: !!gstEnabled,
      gstPercentage,
      subTotal,
      gstAmount,
      total,
    });

    if (lead) {
      lead.hasQuotation = true;
      if (lead.stage === 'New Lead' || lead.stage === 'Contacted') {
        lead.stage = 'Quote Sent';
      }
      await lead.save();
    }

    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
const getQuotations = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { quotationNumber: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { productName: searchRegex },
        { customerLocation: searchRegex }
      ];
    }

    const quotations = await Quotation.find(query).populate('lead').sort({ createdAt: -1 });
    res.json(quotations);
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

// @desc    Update a quotation
// @route   PUT /api/quotations/:id
// @access  Private
const updateQuotation = async (req, res) => {
  try {
    const {
      items,
      gstEnabled,
      gstPercentage,
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
      customerAddress,
      productName,
      notes,
      status,
      leadId
    } = req.body;

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    if (customerName) quotation.customerName = customerName;
    if (customerPhone) quotation.customerPhone = customerPhone;
    if (customerEmail !== undefined) quotation.customerEmail = customerEmail;
    if (customerLocation !== undefined) quotation.customerLocation = customerLocation;
    if (customerAddress !== undefined) quotation.customerAddress = customerAddress;
    if (productName !== undefined) quotation.productName = productName;
    if (notes !== undefined) quotation.notes = notes;
    if (status) quotation.status = status;
    if (gstPercentage !== undefined) quotation.gstPercentage = gstPercentage;

    if (leadId !== undefined) {
      quotation.lead = leadId || null;
      if (leadId) {
        const lead = await Lead.findById(leadId);
        if (lead) {
          lead.hasQuotation = true;
          if (lead.stage === 'New Lead' || lead.stage === 'Contacted') {
            lead.stage = 'Quote Sent';
          }
          await lead.save();
        }
      }
    }

    if (items) {
      quotation.items = items;
      const subTotal = items.reduce((acc, item) => acc + Number(item.amount), 0);
      quotation.subTotal = subTotal;
      const isGst = gstEnabled !== undefined ? gstEnabled : quotation.gstEnabled;
      const rate = quotation.gstPercentage / 100;
      quotation.gstAmount = isGst ? subTotal * rate : 0;
      quotation.total = subTotal + quotation.gstAmount;
    }

    if (gstEnabled !== undefined || gstPercentage !== undefined) {
      if (gstEnabled !== undefined) quotation.gstEnabled = !!gstEnabled;
      if (gstPercentage !== undefined) quotation.gstPercentage = gstPercentage;
      const subTotal = quotation.subTotal;
      const rate = quotation.gstPercentage / 100;
      quotation.gstAmount = quotation.gstEnabled ? subTotal * rate : 0;
      quotation.total = subTotal + quotation.gstAmount;
    }

    await quotation.save();
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quotation
// @route   DELETE /api/quotations/:id
// @access  Private
const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    await quotation.deleteOne();
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF for quotation
// @route   GET /api/quotations/:id/pdf
// @access  Private
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

    const name = quotation.customerName || (quotation.lead ? quotation.lead.name : 'Valued Customer');
    const phone = quotation.customerPhone || (quotation.lead ? quotation.lead.phone : '-');
    const email = quotation.customerEmail || (quotation.lead ? quotation.lead.email : '');
    const locationStr = quotation.customerLocation || (quotation.lead ? quotation.lead.location : '');
    const addressStr = quotation.customerAddress || (quotation.lead ? quotation.lead.fullAddress : '');

    doc.fontSize(10).text(name);
    doc.text(phone);
    if (email) doc.text(email);
    if (locationStr) doc.text(`Location: ${locationStr}`);
    if (addressStr) doc.text(`Address: ${addressStr}`);
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
      const percentageStr = quotation.gstPercentage !== undefined ? quotation.gstPercentage : 18;
      doc.text(`GST (${percentageStr}%):`, 300, y, { width: 100, align: 'right' });
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

module.exports = {
  createQuotation,
  getQuotations,
  getLeadQuotations,
  updateQuotation,
  deleteQuotation,
  generateQuotationPDF
};
