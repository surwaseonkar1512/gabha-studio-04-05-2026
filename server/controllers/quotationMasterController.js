const QuotationMaster = require('../models/QuotationMaster');

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
    const { name, items } = req.body;
    if (!name || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Template name and items are required' });
    }

    const exists = await QuotationMaster.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'A template with this name already exists' });
    }

    const master = await QuotationMaster.create({ name, items });
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
    const { name, items } = req.body;
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

module.exports = {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster
};
