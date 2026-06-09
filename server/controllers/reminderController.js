const Reminder = require('../models/Reminder');
const Lead = require('../models/Lead');

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({}).populate('lead', 'name phone').sort({ reminderDate: 1, reminderTime: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const { title, description, reminderDate, reminderTime, priority, leadId } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const reminder = new Reminder({
      title,
      description,
      reminderDate,
      reminderTime,
      priority,
      lead: leadId,
      assignedUser: req.user._id,
    });

    const createdReminder = await reminder.save();

    lead.reminders.push(createdReminder._id);
    await lead.save();

    res.status(201).json(createdReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    const { title, description, reminderDate, reminderTime, priority, isCompleted } = req.body;

    const reminder = await Reminder.findById(req.params.id);

    if (reminder) {
      reminder.title = title || reminder.title;
      reminder.description = description !== undefined ? description : reminder.description;
      reminder.reminderDate = reminderDate || reminderDate;
      reminder.reminderTime = reminderTime || reminderTime;
      reminder.priority = priority || reminder.priority;
      if (isCompleted !== undefined) {
        reminder.isCompleted = isCompleted;
      }

      const updatedReminder = await reminder.save();
      res.json(updatedReminder);
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (reminder) {
      await Lead.updateOne({ _id: reminder.lead }, { $pull: { reminders: reminder._id } });
      await reminder.deleteOne();
      res.json({ message: 'Reminder removed' });
    } else {
      res.status(404).json({ message: 'Reminder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
};
