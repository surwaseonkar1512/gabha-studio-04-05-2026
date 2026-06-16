const Lead = require('../models/Lead');
const { createNotification } = require('./notificationController');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .sort({ createdAt: -1 })
      .populate('notes.addedBy', 'name')
      .populate('assignedTo', 'name');
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
    const lead = await Lead.findById(req.params.id)
      .populate('notes.addedBy', 'name')
      .populate('assignedTo', 'name');
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
      notesRequirements,
      // Nested Details
      customerDetails,
      productDetails,
      requirementDetails,
      priority,
      assignedTo,
      status
    } = req.body;

    const finalName = name || customerDetails?.name || 'Inquiry';
    const finalPhone = phone || customerDetails?.phone || '0000000000';
    const finalEmail = email || customerDetails?.email || '';
    const finalProductName = productName || productDetails?.productName || 'General Service';
    const finalLocation = location || requirementDetails?.location || '';
    const finalNotes = notesRequirements || message || requirementDetails?.notes || '';

    const lead = new Lead({
      name: finalName,
      phone: finalPhone,
      email: finalEmail,
      message: message || finalNotes,
      source: source || 'Manual Entry',
      productReference,
      productName: finalProductName,
      location: finalLocation,
      fullAddress,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      locationType: locationType || 'Manual',
      notesRequirements: finalNotes,
      priority: priority || 'Medium',
      assignedTo: assignedTo || undefined,
      status: status || 'New',
      customerDetails: {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        company: customerDetails?.company || ''
      },
      productDetails: {
        productName: finalProductName,
        productImage: productDetails?.productImage || '',
        productPrice: productDetails?.productPrice ? Number(productDetails.productPrice) : undefined,
        SKU: productDetails?.SKU || '',
        category: productDetails?.category || ''
      },
      requirementDetails: {
        quantity: requirementDetails?.quantity ? Number(requirementDetails.quantity) : 1,
        size: requirementDetails?.size || '',
        color: requirementDetails?.color || '',
        location: finalLocation,
        deliveryDate: requirementDetails?.deliveryDate ? new Date(requirementDetails.deliveryDate) : undefined,
        notes: finalNotes
      }
    });

    const createdLead = await lead.save();

    // Save notification to database
    await createNotification({
      title: 'New Lead Received!',
      message: `${createdLead.name} just sent an inquiry.`,
      type: 'lead',
      link: `/crm/leads/${createdLead._id}`,
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
      status,
      priority,
      assignedTo,
      source, 
      quotationSkipped,
      productName,
      location,
      fullAddress,
      latitude,
      longitude,
      locationType,
      notesRequirements,
      customerDetails,
      productDetails,
      requirementDetails
    } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (lead) {
      const oldValues = { ...lead.toObject() };

      lead.name = name || lead.name;
      lead.phone = phone || lead.phone;
      lead.email = email !== undefined ? email : lead.email;
      lead.message = message !== undefined ? message : lead.message;
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

      if (priority) lead.priority = priority;
      if (assignedTo !== undefined) lead.assignedTo = assignedTo || null;

      // Sync customer details nested properties
      if (!lead.customerDetails) lead.customerDetails = {};
      if (customerDetails) {
        lead.customerDetails.name = customerDetails.name || lead.name;
        lead.customerDetails.email = customerDetails.email !== undefined ? customerDetails.email : lead.email;
        lead.customerDetails.phone = customerDetails.phone || lead.phone;
        lead.customerDetails.company = customerDetails.company !== undefined ? customerDetails.company : lead.customerDetails.company;
      }

      // Sync product details nested properties
      if (!lead.productDetails) lead.productDetails = {};
      if (productDetails) {
        lead.productDetails.productName = productDetails.productName || lead.productName;
        lead.productDetails.productImage = productDetails.productImage !== undefined ? productDetails.productImage : lead.productDetails.productImage;
        lead.productDetails.productPrice = productDetails.productPrice !== undefined ? Number(productDetails.productPrice) : lead.productDetails.productPrice;
        lead.productDetails.SKU = productDetails.SKU !== undefined ? productDetails.SKU : lead.productDetails.SKU;
        lead.productDetails.category = productDetails.category !== undefined ? productDetails.category : lead.productDetails.category;
      }

      // Sync requirement details nested properties
      if (!lead.requirementDetails) lead.requirementDetails = {};
      if (requirementDetails) {
        lead.requirementDetails.quantity = requirementDetails.quantity !== undefined ? Number(requirementDetails.quantity) : lead.requirementDetails.quantity;
        lead.requirementDetails.size = requirementDetails.size !== undefined ? requirementDetails.size : lead.requirementDetails.size;
        lead.requirementDetails.color = requirementDetails.color !== undefined ? requirementDetails.color : lead.requirementDetails.color;
        lead.requirementDetails.location = requirementDetails.location !== undefined ? requirementDetails.location : lead.location;
        lead.requirementDetails.deliveryDate = requirementDetails.deliveryDate !== undefined ? (requirementDetails.deliveryDate ? new Date(requirementDetails.deliveryDate) : undefined) : lead.requirementDetails.deliveryDate;
        lead.requirementDetails.notes = requirementDetails.notes !== undefined ? requirementDetails.notes : lead.notesRequirements;
      }

      // If status is passed, update status, and pre-save hook will keep stage in sync
      if (status) {
        lead.status = status;
      } else if (stage && stage !== lead.stage) {
        // Direct stage change (keeps older UI columns transitions working)
        lead.stage = stage;
      }

      const fieldsToCheck = [
        'name', 'phone', 'email', 'message', 'stage', 'status', 'priority', 'source', 'quotationSkipped',
        'productName', 'location', 'fullAddress', 'latitude', 'longitude', 'locationType', 'notesRequirements'
      ];
      
      fieldsToCheck.forEach(field => {
        if (lead[field] !== oldValues[field] && String(lead[field]) !== String(oldValues[field])) {
          lead.activityLogs.push({
            field,
            oldValue: oldValues[field],
            newValue: lead[field],
            updatedBy: req.user ? req.user._id : undefined,
            ipAddress: req.ip || req.connection?.remoteAddress
          });
        }
      });

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
      // Allow deletion for New/Contacted/Lost leads
      if (lead.status !== 'New' && lead.status !== 'Contacted' && lead.status !== 'Lost' && lead.stage !== 'New Lead' && lead.stage !== 'Contacted') {
        return res.status(403).json({ message: `Deletion not allowed for active leads.` });
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
