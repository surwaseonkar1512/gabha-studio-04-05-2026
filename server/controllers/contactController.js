const Contact = require('../models/Contact');
const { createNotification } = require('./notificationController');

// @desc    Submit Contact Us inquiry (Public)
// @route   POST /api/contacts/public
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Name, email, phone number, and message are required' });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject: subject || 'General Inquiry',
      message
    });

    // Create a real-time admin notification
    await createNotification({
      title: 'New Contact Us Inquiry!',
      message: `${name} has sent a message: "${subject || 'General Inquiry'}"`,
      type: 'lead',
      link: '/admin/contacts',
    });

    // Emit socket event to connected admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_contact_inquiry', contact);
    }

    res.status(201).json({ message: 'Inquiry submitted successfully!', contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact inquiries (Private)
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res) => {
  try {
    const { search, status, exportCSV } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex }
      ];
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    if (exportCSV === 'true') {
      let csv = 'Created Date,Name,Email,Phone,Subject,Message,Status\n';
      contacts.forEach(c => {
        const date = new Date(c.createdAt).toLocaleDateString();
        const name = c.name.replace(/"/g, '""');
        const email = c.email.replace(/"/g, '""');
        const phone = c.phone.replace(/"/g, '""');
        const subject = (c.subject || '').replace(/"/g, '""');
        const message = (c.message || '').replace(/"/g, '""');
        csv += `"${date}","${name}","${email}","${phone}","${subject}","${message}","${c.status}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="contact_inquiries.csv"');
      return res.send(csv);
    }

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact inquiry status (Private)
// @route   PUT /api/contacts/:id/status
// @access  Private
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    contact.status = status;
    await contact.save();

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitContact,
  getContacts,
  updateContactStatus
};
