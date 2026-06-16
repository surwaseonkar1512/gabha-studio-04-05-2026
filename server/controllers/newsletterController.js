const Newsletter = require('../models/Newsletter');
const { createNotification } = require('./notificationController');

// @desc    Subscribe to newsletter (Public)
// @route   POST /api/newsletter/public
// @access  Public
const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email });
    if (subscriber) {
      if (subscriber.status === 'Active') {
        return res.status(400).json({ message: 'Email is already subscribed to our newsletter!' });
      } else {
        subscriber.status = 'Active';
        subscriber.source = source || subscriber.source;
        await subscriber.save();
      }
    } else {
      subscriber = await Newsletter.create({
        email,
        source: source || 'Website Footer'
      });
    }

    // Create a real-time admin notification
    await createNotification({
      title: 'New Newsletter Subscriber!',
      message: `${email} has subscribed to the newsletter.`,
      type: 'lead',
      link: '/admin/newsletter',
    });

    // Emit socket event to connected admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_subscriber', subscriber);
    }

    res.status(201).json({ message: 'Subscribed successfully!', subscriber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all subscribers (Private)
// @route   GET /api/newsletter
// @access  Private
const getSubscribers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.email = new RegExp(search, 'i');
    }

    const subscribers = await Newsletter.find(query).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subscriber status (Private)
// @route   PUT /api/newsletter/:id/status
// @access  Private
const updateSubscriberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subscriber = await Newsletter.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    subscriber.status = status;
    await subscriber.save();

    res.json(subscriber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  subscribeNewsletter,
  getSubscribers,
  updateSubscriberStatus
};
