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
      notes,
      status
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
    const gstAmount = gstEnabled ? subTotal * (gstPercentage / 100) : 0;
    const total = subTotal + gstAmount;

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
      total,
    });

    // Advance lead stage
    const newStage = (lead.stage === 'New Lead' || lead.stage === 'Contacted') ? 'Quote Sent' : lead.stage;
    await Lead.updateOne({ _id: leadId }, { hasQuotation: true, stage: newStage });

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
    const { items, gstEnabled, gstPercentage, notes, status, leadId } = req.body;

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    if (notes !== undefined) quotation.notes = notes;
    if (status) quotation.status = status;

    if (leadId !== undefined) {
      quotation.lead = leadId || null;
      if (leadId) {
        const lead = await Lead.findById(leadId);
        if (lead) {
          const newStage = (lead.stage === 'New Lead' || lead.stage === 'Contacted') ? 'Quote Sent' : lead.stage;
          await Lead.updateOne({ _id: leadId }, { hasQuotation: true, stage: newStage });
        }
      }
    }

    // Recalculate totals if items or GST changed
    const newItems = items !== undefined ? items : quotation.items;
    const newGstEnabled = gstEnabled !== undefined ? !!gstEnabled : quotation.gstEnabled;
    const newGstPct = gstPercentage !== undefined ? Number(gstPercentage) : quotation.gstPercentage;

    if (items !== undefined || gstEnabled !== undefined || gstPercentage !== undefined) {
      quotation.items = newItems;
      quotation.gstEnabled = newGstEnabled;
      quotation.gstPercentage = newGstPct;
      quotation.subTotal = newItems.reduce((acc, item) => acc + Number(item.amount), 0);
      quotation.gstAmount = newGstEnabled ? quotation.subTotal * (newGstPct / 100) : 0;
      quotation.total = quotation.subTotal + quotation.gstAmount;
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

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const COLOR = {
  black: '#1A1A1A',
  darkGray: '#2D2D2D',
  midGray: '#6B6B6B',
  lightGray: '#F5F5F5',
  divider: '#E0E0E0',
  gold: '#C9A84C',
  white: '#FFFFFF',
  ccGray: '#CCCCCC',
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fillRect(doc, hex, x, y, w, h) {
  const [r, g, b] = hexToRgb(hex);
  doc.save().rect(x, y, w, h).fill(`rgb(${r},${g},${b})`).restore();
}

function hRule(doc, y, x1 = MARGIN, x2 = PAGE_W - MARGIN, color = COLOR.divider, thickness = 0.5) {
  doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(thickness).strokeColor(color).stroke().restore();
}

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate PDF for quotation
// @route   GET /api/quotations/:id/pdf
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const generateQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('lead');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 0, compress: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=quotation-${quotation.quotationNumber}.pdf`);
    doc.pipe(res);

    // Resolve customer info (always from lead)
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

    // ── 1. GOLD TOP BAR ───────────────────────────────────────────
    fillRect(doc, COLOR.gold, 0, 0, PAGE_W, 40);

    // ── 2. DARK HEADER BAND ───────────────────────────────────────
    fillRect(doc, COLOR.black, 0, 40, PAGE_W, 95);

    doc.font('Helvetica-Bold').fontSize(22).fillColor(COLOR.white)
      .text('GABHA STUDIO', MARGIN, 58, { lineBreak: false });

    doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLOR.gold)
      .text('Art Gallery & Photography Services', MARGIN, 86, { lineBreak: false });

    doc.font('Helvetica').fontSize(8).fillColor(COLOR.ccGray)
      .text('123 Creative Avenue, Mumbai, India', 0, 64,
        { align: 'right', width: PAGE_W - MARGIN, lineBreak: false });
    doc.text('+91 9876543210  |  hello@gabhastudio.com', 0, 78,
      { align: 'right', width: PAGE_W - MARGIN, lineBreak: false });

    // ── 3. QUOTATION TITLE + META ─────────────────────────────────
    let y = 155;

    doc.font('Helvetica-Bold').fontSize(18).fillColor(COLOR.black)
      .text('QUOTATION', MARGIN, y, { lineBreak: false });

    const metaX = PAGE_W - MARGIN - 180;
    const metaRows = [
      ['Quotation No:', quotation.quotationNumber],
      ['Date:', dateStr],
      ['Valid Until:', validStr],
    ];
    let metaY = y;
    metaRows.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.midGray)
        .text(label, metaX, metaY, { lineBreak: false, width: 72 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
        .text(value, metaX + 74, metaY, { lineBreak: false });
      metaY += 16;
    });

    y += 55;
    hRule(doc, y);
    y += 12;

    // ── 4. BILL TO / PREPARED BY ──────────────────────────────────
    const colMid = PAGE_W / 2;
    const billTopY = y;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
      .text('BILL TO', MARGIN, y, { lineBreak: false });
    y += 14;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
      .text(name, MARGIN, y, { lineBreak: false });
    y += 13;
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.darkGray)
      .text(phone, MARGIN, y, { lineBreak: false });
    y += 13;
    if (email) {
      doc.text(email, MARGIN, y, { lineBreak: false });
      y += 13;
    }
    if (location) {
      doc.text(location, MARGIN, y, { lineBreak: false });
      y += 13;
    }

    // Prepared By – right column aligned to same top
    let prepY = billTopY;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
      .text('PREPARED BY', colMid, prepY, { lineBreak: false });
    prepY += 14;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
      .text('Gabha Studio', colMid, prepY, { lineBreak: false });
    prepY += 13;
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.darkGray)
      .text('hello@gabhastudio.com', colMid, prepY, { lineBreak: false });
    prepY += 13;
    doc.text('+91 9876543210', colMid, prepY, { lineBreak: false });

    y += 10;
    hRule(doc, y);
    y += 12;

    // ── 5. LINE ITEMS TABLE ───────────────────────────────────────
    // Only 3 columns: # | Description | Amount (INR)
    const COL = {
      no: { x: MARGIN, w: 30 },
      desc: { x: MARGIN + 30, w: 360 },
      amt: { x: MARGIN + 390, w: 105 },
    };
    const TABLE_RIGHT = COL.amt.x + COL.amt.w; // ≈ 545

    // Header
    const HEADER_H = 26;
    fillRect(doc, COLOR.black, MARGIN, y, TABLE_RIGHT - MARGIN, HEADER_H);

    const hTextY = y + 8;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.white);
    doc.text('#', COL.no.x, hTextY, { width: COL.no.w, align: 'center', lineBreak: false });
    doc.text('Description', COL.desc.x, hTextY, { width: COL.desc.w, align: 'left', lineBreak: false });
    doc.text('Amount (INR)', COL.amt.x, hTextY, { width: COL.amt.w, align: 'right', lineBreak: false });
    y += HEADER_H;

    // Data rows
    const ROW_H = 26;
    quotation.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? COLOR.white : COLOR.lightGray;
      fillRect(doc, bg, MARGIN, y, TABLE_RIGHT - MARGIN, ROW_H);

      const textY = y + 8;
      doc.font('Helvetica').fontSize(9).fillColor(COLOR.darkGray);
      doc.text(String(idx + 1), COL.no.x, textY, { width: COL.no.w, align: 'center', lineBreak: false });
      doc.text(item.description || '—', COL.desc.x, textY, { width: COL.desc.w, align: 'left', lineBreak: false });
      doc.text(`Rs. ${fmt(item.amount)}`, COL.amt.x, textY, { width: COL.amt.w, align: 'right', lineBreak: false });
      y += ROW_H;
    });

    hRule(doc, y, MARGIN, TABLE_RIGHT);
    y += 10;

    // ── 6. TOTALS ─────────────────────────────────────────────────
    const TOT_LABEL_X = COL.desc.x + COL.desc.w - 60; // starts in desc column
    const TOT_VAL_X = COL.amt.x;
    const TOT_W_LABEL = 70;
    const TOT_W_VAL = COL.amt.w;

    // Subtotal (only show if GST is enabled — otherwise grand total = subtotal)
    if (quotation.gstEnabled) {
      doc.font('Helvetica').fontSize(9).fillColor(COLOR.darkGray)
        .text('Subtotal', TOT_LABEL_X, y, { width: TOT_W_LABEL, align: 'right', lineBreak: false });
      doc.text(`Rs. ${fmt(quotation.subTotal)}`, TOT_VAL_X, y,
        { width: TOT_W_VAL, align: 'right', lineBreak: false });
      y += 18;

      const pct = quotation.gstPercentage || 18;
      doc.text(`GST (${pct}%)`, TOT_LABEL_X, y, { width: TOT_W_LABEL, align: 'right', lineBreak: false });
      doc.text(`Rs. ${fmt(quotation.gstAmount)}`, TOT_VAL_X, y,
        { width: TOT_W_VAL, align: 'right', lineBreak: false });
      y += 18;
    }

    // Grand Total – gold band
    const GT_H = 28;
    fillRect(doc, COLOR.gold, TOT_LABEL_X - 12, y, TABLE_RIGHT - TOT_LABEL_X + 12, GT_H);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.white)
      .text('Grand Total', TOT_LABEL_X, y + 8, { width: TOT_W_LABEL, align: 'right', lineBreak: false });
    doc.text(`Rs. ${fmt(quotation.total)}`, TOT_VAL_X, y + 8,
      { width: TOT_W_VAL, align: 'right', lineBreak: false });
    y += GT_H + 22;

    // ── 7. NOTES ──────────────────────────────────────────────────
    if (quotation.notes) {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
        .text('NOTES', MARGIN, y, { lineBreak: false });
      y += 13;
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(COLOR.midGray)
        .text(quotation.notes, MARGIN, y, { width: PAGE_W - 2 * MARGIN });
      y = doc.y + 10;
    }

    // ── 8. TERMS ──────────────────────────────────────────────────
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLOR.midGray)
      .text(
        'Terms & Conditions: Payment due within 15 days of quotation date. ' +
        'Prices include all material and processing costs. ' +
        'Final output may vary slightly based on print medium chosen.',
        MARGIN, y,
        { width: (PAGE_W / 2) - MARGIN - 10 }
      );

    // ── 9. SIGNATURE BLOCK ────────────────────────────────────────
    const sigBaseY = PAGE_H - 110;
    const sigRightX = PAGE_W - MARGIN - 130;

    // Authorized Signatory – right
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.midGray)
      .text('Authorized Signatory', sigRightX, sigBaseY, { width: 130, lineBreak: false });
    hRule(doc, sigBaseY + 35, sigRightX, sigRightX + 130, COLOR.darkGray, 0.6);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
      .text('Gabha Studio', sigRightX, sigBaseY + 40, { lineBreak: false });

    // Company Stamp – left
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.midGray)
      .text('Company Stamp', MARGIN, sigBaseY, { width: 130, lineBreak: false });
    hRule(doc, sigBaseY + 35, MARGIN, MARGIN + 130, COLOR.divider, 0.6);

    // ── 10. GOLD FOOTER BAR ───────────────────────────────────────
    fillRect(doc, COLOR.gold, 0, PAGE_H - 28, PAGE_W, 28);
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.white)
      .text(
        'Thank you for your business  •  hello@gabhastudio.com  •  +91 9876543210',
        0, PAGE_H - 18,
        { align: 'center', width: PAGE_W, lineBreak: false }
      );

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