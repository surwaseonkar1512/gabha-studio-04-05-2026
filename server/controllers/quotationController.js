const Quotation = require('../models/Quotation');
const Lead = require('../models/Lead');
const SiteSettings = require('../models/SiteSettings');
const puppeteer = require('puppeteer');
const { generatePDFHTML } = require('../utils/pdfTemplate');

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
      notes,
      status,
      discount = 0,
      shipping = 0,
      terms
    } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: 'leadId is required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Generate quotation number e.g. GS-0001
    const count = await Quotation.countDocuments();
    const quotationNumber = `GS-${(count + 1).toString().padStart(4, '0')}`;

    const subTotal = items.reduce((acc, item) => acc + Number(item.amount), 0);
    const gstAmount = gstEnabled ? (subTotal - Number(discount)) * (Number(gstPercentage) / 100) : 0;
    const total = subTotal - Number(discount) + gstAmount + Number(shipping);

    const quotation = await Quotation.create({
      quotationNumber,
      lead: leadId,
      customerName: lead.name,
      customerPhone: lead.phone,
      customerEmail: lead.email || '',
      customerLocation: lead.location || '',
      customerAddress: lead.fullAddress || '',
      notes: notes || lead.notesRequirements || '',
      status: status || 'Draft',
      items,
      gstEnabled: !!gstEnabled,
      gstPercentage: Number(gstPercentage),
      subTotal,
      gstAmount,
      discount: Number(discount),
      shipping: Number(shipping),
      total,
      terms: terms || []
    });

    // Advance lead stage & status
    const newStage = 'Quote Sent';
    const newStatus = 'Quotation Sent';
    await Lead.updateOne({ _id: leadId }, { hasQuotation: true, stage: newStage, status: newStatus });

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
        { customerLocation: searchRegex },
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
    const { items, gstEnabled, gstPercentage, notes, status, leadId, discount, shipping, terms } = req.body;

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    if (notes !== undefined) quotation.notes = notes;
    if (status) quotation.status = status;
    if (terms !== undefined) quotation.terms = terms;

    if (leadId !== undefined) {
      quotation.lead = leadId || null;
      if (leadId) {
        const lead = await Lead.findById(leadId);
        if (lead) {
          const newStage = 'Quote Sent';
          const newStatus = 'Quotation Sent';
          await Lead.updateOne({ _id: leadId }, { hasQuotation: true, stage: newStage, status: newStatus });
        }
      }
    }

    // Recalculate totals
    const newItems = items !== undefined ? items : quotation.items;
    const newGstEnabled = gstEnabled !== undefined ? !!gstEnabled : quotation.gstEnabled;
    const newGstPct = gstPercentage !== undefined ? Number(gstPercentage) : quotation.gstPercentage;
    const newDiscount = discount !== undefined ? Number(discount) : (quotation.discount || 0);
    const newShipping = shipping !== undefined ? Number(shipping) : (quotation.shipping || 0);

    quotation.items = newItems;
    quotation.gstEnabled = newGstEnabled;
    quotation.gstPercentage = newGstPct;
    quotation.discount = newDiscount;
    quotation.shipping = newShipping;
    
    quotation.subTotal = newItems.reduce((acc, item) => acc + Number(item.amount), 0);
    quotation.gstAmount = newGstEnabled ? (quotation.subTotal - newDiscount) * (newGstPct / 100) : 0;
    quotation.total = quotation.subTotal - newDiscount + quotation.gstAmount + newShipping;

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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate PDF for quotation
// @route   GET /api/quotations/:id/pdf
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const generateQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('lead');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const settings = await SiteSettings.findOne() || {};

    const lead = quotation.lead;
    const name = quotation.customerName || lead?.name || 'Valued Customer';
    const phone = quotation.customerPhone || lead?.phone || '-';
    const email = quotation.customerEmail || lead?.email || '';
    const location = quotation.customerLocation || lead?.location || '';

    const dateStr = new Date(quotation.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const validDate = new Date(quotation.createdAt);
    validDate.setDate(validDate.getDate() + 30);
    const validStr = validDate.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const data = {
      type: 'QUOTATION',
      documentNo: quotation.quotationNumber,
      date: dateStr,
      validUntil: validStr,
      preparedBy: 'Gabha Studio',
      customer: {
        name,
        phone,
        email,
        location,
      },
      items: quotation.items.map(i => ({
        description: i.description,
        qty: 1,
        rate: i.amount,
        amount: i.amount
      })),
      subTotal: quotation.subTotal,
      gstEnabled: quotation.gstEnabled,
      gstPercentage: quotation.gstPercentage,
      gstAmount: quotation.gstAmount,
      discount: quotation.discount || 0,
      shipping: quotation.shipping || 0,
      total: quotation.total,
      notes: quotation.notes ? [quotation.notes] : [
        'Includes all approved materials and fabrication costs.',
        'Delivery timeline starts after advance payment.',
        'Any additional changes in scope will be charged separately.'
      ],
      terms: quotation.terms && quotation.terms.length > 0 ? quotation.terms : [
        '50% advance payment required to initiate the work.',
        'Remaining payment before final handover.',
        'Design revisions after approval will be chargeable.',
        'Quotation valid for 30 days from the date of issue.'
      ],
      websiteName: settings.websiteName,
      logoUrl: settings.websiteLogo,
      signatureUrl: settings.ownerSignature,
      stampUrl: settings.companyStamp,
      upiId: settings.upiId,
      upiQrUrl: settings.upiQrCode,
      bankAccountName: settings.bankAccountName,
      bankName: settings.bankName,
      bankAccountNumber: settings.bankAccountNumber,
      bankIfscCode: settings.bankIfscCode,
      gstNumber: settings.gstNumber,
    };

    const htmlContent = generatePDFHTML(data);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Quotation_${quotation.quotationNumber}.pdf"`);
    res.send(pdfBuffer);
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