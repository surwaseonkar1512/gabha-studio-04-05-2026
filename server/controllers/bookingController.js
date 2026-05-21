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
    let { leadId, quotationId, totalAmount, payment } = req.body;
    
    // If sent via FormData, payment might be stringified
    if (typeof payment === 'string') {
      payment = JSON.parse(payment);
    }

    // Process image uploads
    const proofUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        proofUrls.push(url);
      }
    }
    
    // Generate IDs
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
      payments: [newPayment]
    });

    // Update Lead stage
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
    // If sent via FormData, data might be flattened or stringified. 
    // We assume the frontend either stringifies or sends fields directly.
    if (req.body.payment) {
        paymentData = typeof req.body.payment === 'string' ? JSON.parse(req.body.payment) : req.body.payment;
    } else if (req.body.amount && typeof req.body.amount === 'string') {
        paymentData = { ...req.body, isFinal: req.body.isFinal === 'true' };
    }

    // Process image uploads
    const proofUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        proofUrls.push(url);
      }
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const newPayment = {
      ...paymentData,
      invoiceNumber,
      proofUrls
    };

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
    const bookings = await Booking.find()
      .populate('lead', 'name phone email stage')
      .sort({ createdAt: -1 });
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
    const booking = await Booking.findById(req.params.id)
      .populate('lead')
      .populate('quotation');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Invoice PDF
// @route   GET /api/bookings/:bookingId/invoice/:paymentId
// @access  Public
const generateInvoicePDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('lead').populate('quotation');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const payment = booking.payments.id(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${payment.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('GABHA STUDIO', { align: 'center' });
    doc.fontSize(10).text('Art Gallery & Photography Services', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(10).text('123 Creative Avenue, Mumbai, India');
    doc.text('Phone: +91 9876543210 | Email: hello@gabhastudio.com');
    doc.moveDown();
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Invoice Details
    doc.fontSize(14).text(payment.isFinal ? 'FINAL SETTLEMENT INVOICE' : 'PAYMENT RECEIPT / INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice No: ${payment.invoiceNumber}`, { align: 'right' });
    doc.text(`Booking ID: ${booking.bookingId}`, { align: 'right' });
    doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, { align: 'right' });
    
    // Customer Details
    doc.moveUp(4);
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(booking.lead.name);
    doc.text(booking.lead.phone);
    if(booking.lead.email) doc.text(booking.lead.email);
    doc.moveDown(2);

    // Payment Info
    doc.font('Helvetica-Bold').fontSize(12).text('Payment Summary', 50, doc.y);
    doc.font('Helvetica').fontSize(10);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.text('Total Project Amount:', 50, tableTop);
    doc.text(`Rs. ${booking.totalAmount.toLocaleString('en-IN')}`, 200, tableTop);
    
    doc.text('Amount Received Now:', 50, tableTop + 20);
    doc.text(`Rs. ${payment.amount.toLocaleString('en-IN')}`, 200, tableTop + 20);
    
    doc.text('Payment Method:', 50, tableTop + 40);
    doc.text(payment.method, 200, tableTop + 40);

    if (payment.reference) {
      doc.text('Reference No:', 50, tableTop + 60);
      doc.text(payment.reference, 200, tableTop + 60);
    }

    doc.moveDown(5);

    // If Final Invoice, show history
    if (payment.isFinal) {
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Complete Payment History');
      doc.moveDown(0.5);
      doc.font('Helvetica');

      let historyY = doc.y;
      booking.payments.forEach((p, index) => {
        doc.text(`${index + 1}. ${new Date(p.date).toLocaleDateString()} - ${p.method}`, 50, historyY);
        doc.text(`Rs. ${p.amount.toLocaleString('en-IN')}`, 400, historyY, { width: 100, align: 'right' });
        historyY += 20;
      });
      
      doc.moveTo(50, historyY).lineTo(550, historyY).stroke();
      doc.font('Helvetica-Bold');
      doc.text('Total Paid:', 300, historyY + 10);
      doc.text(`Rs. ${booking.paidAmount.toLocaleString('en-IN')}`, 400, historyY + 10, { width: 100, align: 'right' });
      
      const balance = booking.totalAmount - booking.paidAmount;
      doc.text('Remaining Balance:', 300, historyY + 30);
      doc.text(`Rs. ${balance.toLocaleString('en-IN')}`, 400, historyY + 30, { width: 100, align: 'right' });
    }

    // Footer
    const bottomY = doc.page.height - 150;
    doc.font('Helvetica').fontSize(10);
    doc.text('Authorized Signatory', 400, bottomY, { width: 150, align: 'center' });
    doc.text('___________________', 400, bottomY + 50, { width: 150, align: 'center' });
    
    doc.text('Company Stamp', 50, bottomY, { width: 150, align: 'center' });
    doc.text('___________________', 50, bottomY + 50, { width: 150, align: 'center' });
    
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
