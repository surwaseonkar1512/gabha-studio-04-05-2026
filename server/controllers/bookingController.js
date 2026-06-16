const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const SiteSettings = require('../models/SiteSettings');
const cloudinary = require('../config/cloudinary');
const puppeteer = require('puppeteer');
const { generatePDFHTML } = require('../utils/pdfTemplate');

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

    const settings = await SiteSettings.findOne() || {};

    const lead = booking.lead;

    const invoiceTitle = payment.isFinal
      ? 'FINAL SETTLEMENT INVOICE'
      : 'PAYMENT RECEIPT / INVOICE';

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    let items = [];
    if (booking.quotation && booking.quotation.items) {
      items = booking.quotation.items.map(i => ({
        description: i.description,
        qty: 1,
        rate: i.amount,
        amount: i.amount
      }));
    } else {
      items = [{
        description: 'Project Cost',
        qty: 1,
        rate: booking.totalAmount,
        amount: booking.totalAmount
      }];
    }

    const data = {
      type: invoiceTitle,
      documentNo: payment.invoiceNumber,
      date: fmtDate(payment.date || new Date()),
      preparedBy: 'Gabha Studio',
      customer: {
        name: lead?.name || 'Valued Customer',
        phone: lead?.phone || '-',
        email: lead?.email || '',
        location: lead?.location || ''
      },
      items,
      subTotal: booking.totalAmount, // Assuming total includes gst if there was any in booking
      gstEnabled: false,
      gstPercentage: 0,
      gstAmount: 0,
      total: booking.totalAmount,
      paidAmount: booking.paidAmount,
      notes: booking.notes ? [booking.notes] : [],
      terms: [
        'This document serves as an official payment receipt.',
        'Please retain for your records.',
        'All payments are non-refundable unless otherwise agreed in writing.'
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
    res.setHeader('Content-Disposition', `inline; filename="Invoice_${payment.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
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