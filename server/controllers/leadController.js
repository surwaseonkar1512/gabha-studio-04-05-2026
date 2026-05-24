const Lead = require('../models/Lead');
const { createNotification } = require('./notificationController');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 }).populate('notes.addedBy', 'name');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('notes.addedBy', 'name');
    if (lead) {
      res.json(lead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a lead
// @route   POST /api/leads
// @access  Private (or Public for Website Form if configured)
const createLead = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      message, 
      source, 
      productReference,
      productName,
      location,
      fullAddress,
      latitude,
      longitude,
      locationType,
      notesRequirements
    } = req.body;

    const lead = new Lead({
      name,
      phone,
      email,
      message,
      source: source || 'Manual Entry',
      productReference,
      productName: productName || productReference || 'General Service',
      location,
      fullAddress,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      locationType: locationType || 'Manual',
      notesRequirements: notesRequirements || message
    });

    const createdLead = await lead.save();

    // Save notification to database
    await createNotification({
      title: 'New Lead Received!',
      message: `${createdLead.name} just sent an inquiry.`,
      type: 'lead',
    });

    // Emit socket event to connected admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_lead', createdLead);
    }

    res.status(201).json(createdLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      message, 
      stage, 
      source, 
      quotationSkipped,
      productName,
      location,
      fullAddress,
      latitude,
      longitude,
      locationType,
      notesRequirements
    } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (lead) {
      if (stage && stage !== lead.stage) {
        const STAGES = ['New Lead', 'Contacted', 'Quote Sent', 'Booking', 'Completed'];
        const currentIndex = STAGES.indexOf(lead.stage);
        const newIndex = STAGES.indexOf(stage);

        if (newIndex !== currentIndex + 1 && newIndex !== currentIndex) {
          return res.status(400).json({ message: `Invalid stage transition. You can only move forward one step at a time. Cannot move from ${lead.stage} to ${stage}` });
        }
        lead.stage = stage;
      }

      lead.name = name || lead.name;
      lead.phone = phone || lead.phone;
      lead.email = email || lead.email;
      lead.message = message || lead.message;
      lead.source = source || lead.source;
      if (quotationSkipped !== undefined) {
        lead.quotationSkipped = quotationSkipped;
      }

      if (productName) lead.productName = productName;
      if (location !== undefined) lead.location = location;
      if (fullAddress !== undefined) lead.fullAddress = fullAddress;
      if (latitude !== undefined) lead.latitude = latitude ? Number(latitude) : undefined;
      if (longitude !== undefined) lead.longitude = longitude ? Number(longitude) : undefined;
      if (locationType !== undefined) lead.locationType = locationType;
      if (notesRequirements !== undefined) lead.notesRequirements = notesRequirements;

      const updatedLead = await lead.save();
      res.json(updatedLead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      if (lead.stage !== 'New Lead' && lead.stage !== 'Contacted') {
        return res.status(403).json({ message: `Deletion not allowed for leads in the "${lead.stage}" stage.` });
      }
      
      await lead.deleteOne();
      res.json({ message: 'Lead removed' });
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a note to a lead
// @route   POST /api/leads/:id/notes
// @access  Private
const addLeadNote = async (req, res) => {
  try {
    const { text } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      const note = {
        text,
        addedBy: req.user._id,
      };

      lead.notes.push(note);
      await lead.save();
      res.status(201).json(lead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addLeadNote,
};
