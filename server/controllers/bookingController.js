const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'gabha_studio/payment_proofs' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc    Create Booking with Advance Payment
// @route   POST /api/bookings/advance
// @access  Private
const createBookingWithAdvance = async (req, res) => {
  try {
    let { leadId, quotationId, totalAmount, payment, deliveryDate, notes } = req.body;

    if (typeof payment === 'string') {
      payment = JSON.parse(payment);
    }

    const proofUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        proofUrls.push(url);
      }
    }

    const bookingCount = await Booking.countDocuments();
    const bookingId = `BK-${(bookingCount + 1).toString().padStart(4, '0')}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const newPayment = {
      ...payment,
      invoiceNumber,
      isFinal: false,
      proofUrls
    };

    const booking = await Booking.create({
      bookingId,
      lead: leadId,
      quotation: quotationId || undefined,
      totalAmount,
      paidAmount: payment.amount,
      payments: [newPayment],
      deliveryDate: deliveryDate || undefined,
      notes: notes || undefined
    });

    await Lead.findByIdAndUpdate(leadId, { stage: 'Booking' });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add subsequent payment to Booking
// @route   POST /api/bookings/:id/payment
// @access  Private
const addPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let paymentData = req.body;
    if (req.body.payment) {
      paymentData = typeof req.body.payment === 'string' ? JSON.parse(req.body.payment) : req.body.payment;
    } else if (req.body.amount && typeof req.body.amount === 'string') {
      paymentData = { ...req.body, isFinal: req.body.isFinal === 'true' };
    }

    const proofUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        proofUrls.push(url);
      }
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const newPayment = { ...paymentData, invoiceNumber, proofUrls };

    booking.payments.push(newPayment);
    booking.paidAmount += Number(paymentData.amount);

    if (paymentData.isFinal) {
      booking.status = 'Completed';
    }

    await booking.save();

    if (paymentData.isFinal) {
      await Lead.findByIdAndUpdate(booking.lead, { stage: 'Completed' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('lead').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('lead').populate('quotation');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN CONSTANTS  (matches the Gabha Studio branded layout)
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
  green: '#2E7D32',   // used for "PAID" / final invoice badge
};

const PAGE_W = 595.28;   // A4 points
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
  doc.save()
    .moveTo(x1, y).lineTo(x2, y)
    .lineWidth(thickness).strokeColor(color).stroke()
    .restore();
}

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: draw the branded header (gold bar + dark band + contact)
// ─────────────────────────────────────────────────────────────────────────────
function drawHeader(doc) {
  // Gold top bar
  fillRect(doc, COLOR.gold, 0, 0, PAGE_W, 40);

  // Dark studio name band
  fillRect(doc, COLOR.black, 0, 40, PAGE_W, 95);

  // Studio name
  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLOR.white)
    .text('GABHA STUDIO', MARGIN, 58, { lineBreak: false });

  // Tagline
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLOR.gold)
    .text('Art Gallery & Photography Services', MARGIN, 86, { lineBreak: false });

  // Contact – right-aligned
  doc.font('Helvetica').fontSize(8).fillColor(COLOR.ccGray)
    .text('123 Creative Avenue, Mumbai, India', 0, 64,
      { align: 'right', width: PAGE_W - MARGIN, lineBreak: false });
  doc.text('+91 9876543210  |  hello@gabhastudio.com', 0, 78,
    { align: 'right', width: PAGE_W - MARGIN, lineBreak: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: draw the gold footer bar
// ─────────────────────────────────────────────────────────────────────────────
function drawFooter(doc) {
  fillRect(doc, COLOR.gold, 0, PAGE_H - 28, PAGE_W, 28);
  doc.font('Helvetica').fontSize(8).fillColor(COLOR.white)
    .text(
      'Thank you for your business  •  hello@gabhastudio.com  •  +91 9876543210',
      0, PAGE_H - 18,
      { align: 'center', width: PAGE_W, lineBreak: false }
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: draw signature block near the bottom
// ─────────────────────────────────────────────────────────────────────────────
function drawSignature(doc) {
  const sigBaseY = PAGE_H - 110;

  // Authorized Signatory – right
  const sigRightX = PAGE_W - MARGIN - 130;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.midGray)
    .text('Authorized Signatory', sigRightX, sigBaseY, { width: 130, align: 'left', lineBreak: false });
  hRule(doc, sigBaseY + 35, sigRightX, sigRightX + 130, COLOR.darkGray, 0.6);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
    .text('Gabha Studio', sigRightX, sigBaseY + 40, { lineBreak: false });

  // Company Stamp – left
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.midGray)
    .text('Company Stamp', MARGIN, sigBaseY, { width: 130, align: 'left', lineBreak: false });
  hRule(doc, sigBaseY + 35, MARGIN, MARGIN + 130, COLOR.divider, 0.6);
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate Invoice PDF
// @route   GET /api/bookings/:bookingId/invoice/:paymentId
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const generateInvoicePDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('lead')
      .populate('quotation');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const payment = booking.payments.id(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 0, compress: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=invoice-${payment.invoiceNumber}.pdf`
    );
    doc.pipe(res);

    const lead = booking.lead;

    // ── 1. HEADER ─────────────────────────────────────────────
    drawHeader(doc);

    // ── 2. INVOICE TITLE + META ───────────────────────────────
    let y = 155;

    const invoiceTitle = payment.isFinal
      ? 'FINAL SETTLEMENT INVOICE'
      : 'PAYMENT RECEIPT / INVOICE';

    doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR.black)
      .text(invoiceTitle, MARGIN, y, { lineBreak: false });

    // Status badge
    if (payment.isFinal) {
      const badgeX = MARGIN + doc.widthOfString(invoiceTitle, { fontSize: 16 }) + 12;
      fillRect(doc, COLOR.green, badgeX, y + 1, 42, 16);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR.white)
        .text('FINAL', badgeX + 5, y + 4, { lineBreak: false });
    }

    // Meta block – right side
    const metaX = PAGE_W - MARGIN - 185;
    const metaRows = [
      ['Invoice No:', payment.invoiceNumber],
      ['Booking ID:', booking.bookingId],
      ['Date:', fmtDate(payment.date || new Date())],
    ];
    if (booking.deliveryDate) {
      metaRows.push(['Delivery Date:', fmtDate(booking.deliveryDate)]);
    }

    let metaY = y;
    metaRows.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.midGray)
        .text(label, metaX, metaY, { lineBreak: false, width: 80 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
        .text(value, metaX + 82, metaY, { lineBreak: false });
      metaY += 16;
    });

    y += 55;
    hRule(doc, y);
    y += 12;

    // ── 3. BILL TO / PREPARED BY ──────────────────────────────
    const colMid = PAGE_W / 2;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
      .text('BILL TO', MARGIN, y, { lineBreak: false });
    y += 14;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.darkGray)
      .text(lead.name, MARGIN, y, { lineBreak: false });
    y += 13;
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.darkGray)
      .text(lead.phone, MARGIN, y, { lineBreak: false });
    y += 13;
    if (lead.email) {
      doc.text(lead.email, MARGIN, y, { lineBreak: false });
      y += 13;
    }
    if (lead.location) {
      doc.text(lead.location, MARGIN, y, { lineBreak: false });
      y += 13;
    }

    // Prepared By – right column (same starting y)
    let prepY = y - 13 - (lead.email ? 13 : 0) - (lead.location ? 13 : 0) - 14;
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
    y += 14;

    // ── 4. PAYMENT SUMMARY CARD ───────────────────────────────
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
      .text('PAYMENT SUMMARY', MARGIN, y, { lineBreak: false });
    y += 12;

    const TABLE_RIGHT = PAGE_W - MARGIN;
    const LABEL_W = 160;
    const VAL_X = MARGIN + LABEL_W + 10;
    const ROW_H = 26;

    const summaryRows = [
      ['Total Project Amount', `Rs. ${fmt(booking.totalAmount)}`, false],
      ['Amount Received (This Payment)', `Rs. ${fmt(payment.amount)}`, false],
      ['Payment Method', payment.method || '—', false],
    ];
    if (payment.reference) {
      summaryRows.push(['Reference / Transaction No.', payment.reference, false]);
    }

    summaryRows.forEach(([label, value, bold], idx) => {
      const bg = idx % 2 === 0 ? COLOR.white : COLOR.lightGray;
      fillRect(doc, bg, MARGIN, y, TABLE_RIGHT - MARGIN, ROW_H);
      hRule(doc, y, MARGIN, TABLE_RIGHT, COLOR.divider, 0.3);

      const textY = y + 8;
      doc.font('Helvetica').fontSize(9).fillColor(COLOR.midGray)
        .text(label, MARGIN + 8, textY, { width: LABEL_W, lineBreak: false });
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(COLOR.darkGray)
        .text(value, VAL_X, textY, { lineBreak: false });
      y += ROW_H;
    });

    // Balance Due row – highlighted
    const totalPaidSoFar = booking.paidAmount;
    const balance = booking.totalAmount - totalPaidSoFar;

    fillRect(doc, COLOR.black, MARGIN, y, TABLE_RIGHT - MARGIN, ROW_H);
    const balTextY = y + 8;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.ccGray)
      .text('Total Paid So Far', MARGIN + 8, balTextY, { width: LABEL_W, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.white)
      .text(`Rs. ${fmt(totalPaidSoFar)}`, VAL_X, balTextY, { lineBreak: false });
    y += ROW_H;

    // Grand balance row – gold
    fillRect(doc, COLOR.gold, MARGIN, y, TABLE_RIGHT - MARGIN, ROW_H);
    const gtTextY = y + 8;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.white)
      .text('Remaining Balance', MARGIN + 8, gtTextY, { width: LABEL_W, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.white)
      .text(`Rs. ${fmt(Math.max(0, balance))}`, VAL_X, gtTextY, { lineBreak: false });
    y += ROW_H + 18;

    // ── 5. COMPLETE PAYMENT HISTORY (Final Invoice only) ──────
    if (payment.isFinal && booking.payments.length > 0) {
      hRule(doc, y);
      y += 12;

      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
        .text('COMPLETE PAYMENT HISTORY', MARGIN, y, { lineBreak: false });
      y += 12;

      // History table header
      fillRect(doc, COLOR.black, MARGIN, y, TABLE_RIGHT - MARGIN, 22);
      const hY = y + 6;
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.white);
      doc.text('#', MARGIN + 6, hY, { width: 20, align: 'left', lineBreak: false });
      doc.text('Date', MARGIN + 30, hY, { width: 90, align: 'left', lineBreak: false });
      doc.text('Invoice No', MARGIN + 125, hY, { width: 100, align: 'left', lineBreak: false });
      doc.text('Method', MARGIN + 230, hY, { width: 90, align: 'left', lineBreak: false });
      doc.text('Amount (INR)', TABLE_RIGHT - 100, hY, { width: 95, align: 'right', lineBreak: false });
      y += 22;

      booking.payments.forEach((p, idx) => {
        const bg = idx % 2 === 0 ? COLOR.white : COLOR.lightGray;
        fillRect(doc, bg, MARGIN, y, TABLE_RIGHT - MARGIN, 22);
        const rY = y + 6;
        doc.font('Helvetica').fontSize(8.5).fillColor(COLOR.darkGray);
        doc.text(String(idx + 1), MARGIN + 6, rY, { width: 20, align: 'left', lineBreak: false });
        doc.text(fmtDate(p.date || new Date()), MARGIN + 30, rY, { width: 90, align: 'left', lineBreak: false });
        doc.text(p.invoiceNumber || '—', MARGIN + 125, rY, { width: 100, align: 'left', lineBreak: false });
        doc.text(p.method || '—', MARGIN + 230, rY, { width: 90, align: 'left', lineBreak: false });
        doc.text(`Rs. ${fmt(p.amount)}`, TABLE_RIGHT - 100, rY, { width: 95, align: 'right', lineBreak: false });
        y += 22;
      });

      // Total paid – gold band
      fillRect(doc, COLOR.gold, MARGIN, y, TABLE_RIGHT - MARGIN, 26);
      const totY = y + 8;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.white)
        .text('Total Paid', MARGIN + 6, totY, { lineBreak: false });
      doc.text(`Rs. ${fmt(booking.paidAmount)}`, TABLE_RIGHT - 100, totY,
        { width: 95, align: 'right', lineBreak: false });
      y += 26 + 18;
    }

    // ── 6. NOTES ──────────────────────────────────────────────
    if (booking.notes) {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gold)
        .text('NOTES', MARGIN, y, { lineBreak: false });
      y += 12;
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(COLOR.midGray)
        .text(booking.notes, MARGIN, y, { width: PAGE_W - 2 * MARGIN, lineBreak: true });
      y = doc.y + 8;
    }

    // ── 7. TERMS ──────────────────────────────────────────────
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLOR.midGray)
      .text(
        'This document serves as an official payment receipt. ' +
        'Please retain for your records. All payments are non-refundable unless otherwise agreed in writing.',
        MARGIN, y,
        { width: (PAGE_W / 2) - MARGIN - 10, lineBreak: true }
      );

    // ── 8. SIGNATURE ──────────────────────────────────────────
    drawSignature(doc);

    // ── 9. FOOTER ─────────────────────────────────────────────
    drawFooter(doc);

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBookingWithAdvance,
  addPayment,
  getBookings,
  getBookingDetails,
  generateInvoicePDF
};