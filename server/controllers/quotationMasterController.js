const QuotationMaster = require('../models/QuotationMaster');
const puppeteer = require('puppeteer');
const { generatePDFHTML } = require('../utils/pdfTemplate');
const SiteSettings = require('../models/SiteSettings');

// @desc    Get all quotation templates
// @route   GET /api/quotation-masters
// @access  Private
const getMasters = async (req, res) => {
  try {
    const masters = await QuotationMaster.find({}).sort({ createdAt: -1 });
    res.json(masters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new template
// @route   POST /api/quotation-masters
// @access  Private
const createMaster = async (req, res) => {
  try {
    const { name, items, gstPercentage } = req.body;
    if (!name || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Template name and items are required' });
    }

    const exists = await QuotationMaster.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'A template with this name already exists' });
    }

    const master = await QuotationMaster.create({ name, items, gstPercentage: gstPercentage !== undefined ? gstPercentage : 18 });
    res.status(201).json(master);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a template
// @route   PUT /api/quotation-masters/:id
// @access  Private
const updateMaster = async (req, res) => {
  try {
    const { name, items, gstPercentage } = req.body;
    const master = await QuotationMaster.findById(req.params.id);
    if (!master) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (name) {
      const exists = await QuotationMaster.findOne({ name, _id: { $ne: req.params.id } });
      if (exists) {
        return res.status(400).json({ message: 'A template with this name already exists' });
      }
      master.name = name;
    }

    if (items && Array.isArray(items)) {
      master.items = items;
    }
    
    if (gstPercentage !== undefined) {
      master.gstPercentage = gstPercentage;
    }

    await master.save();
    res.json(master);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a template
// @route   DELETE /api/quotation-masters/:id
// @access  Private
const deleteMaster = async (req, res) => {
  try {
    const master = await QuotationMaster.findById(req.params.id);
    if (!master) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await master.deleteOne();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF for template
// @route   GET /api/quotation-masters/:id/pdf
// @access  Public (or Private)
const generateMasterPDF = async (req, res) => {
  try {
    const master = await QuotationMaster.findById(req.params.id);
    if (!master) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const settings = await SiteSettings.findOne() || {};
    
    let subTotal = 0;
    const items = master.items.map(item => {
      subTotal += item.amount;
      return {
        description: item.description,
        qty: 1,
        rate: item.amount,
        amount: item.amount
      };
    });

    const gstPct = master.gstPercentage || 18;
    const gstAmt = subTotal * (gstPct / 100);
    const total = subTotal + gstAmt;

    const data = {
      type: 'QUOTATION TEMPLATE',
      documentNo: master.name,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      preparedBy: 'Gabha Studio',
      customer: null, // No customer for template
      project: null,  // No project for template
      items,
      subTotal,
      gstEnabled: gstPct > 0,
      gstPercentage: gstPct,
      gstAmount: gstAmt,
      total,
      notes: ['This is a master template preview.'],
      terms: ['Standard Gabha Studio terms apply.'],
      websiteName: settings.websiteName,
      logoUrl: settings.websiteLogo,
      signatureUrl: settings.ownerSignature,
      stampUrl: settings.companyStamp,
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
    res.setHeader('Content-Disposition', `attachment; filename="Template_${master.name.replace(/\s+/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster,
  generateMasterPDF
};
