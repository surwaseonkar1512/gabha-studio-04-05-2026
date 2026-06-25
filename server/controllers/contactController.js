const ContactInquiry = require('../models/ContactInquiry');

const getContactInquiries = async (req, res) => {
  try {
    const { search, status, exportCSV } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { message: regex },
        { subject: regex }
      ];
    }

    const inquiries = await ContactInquiry.find(filter).sort({ createdAt: -1 });

    if (exportCSV === 'true') {
      let csv = 'Date,Name,Email,Phone,Subject,Message,Status\n';
      inquiries.forEach(inq => {
        const dateStr = new Date(inq.createdAt).toLocaleDateString('en-IN');
        const cleanMsg = (inq.message || '').replace(/"/g, '""').replace(/\n/g, ' ');
        csv += `"${dateStr}","${inq.name}","${inq.email}","${inq.phone}","${inq.subject}","${cleanMsg}","${inq.status}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=Contact_Inquiries.csv');
      return res.send(csv);
    }

    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createContactInquiry = async (req, res) => {
  try {
    const { name, email, phone, location, productName, message, subject } = req.body;
    const inquiry = new ContactInquiry({
      name,
      email,
      phone,
      subject: productName || subject || 'General Inquiry',
      message: message || `Location: ${location || 'N/A'}`
    });
    await inquiry.save();
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateContactInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getContactInquiries,
  createContactInquiry,
  updateContactInquiryStatus
};
