const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const getNewsletterSubscribers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.email = new RegExp(search, 'i');
    }

    const subscribers = await NewsletterSubscriber.find(filter).sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNewsletterSubscriber = async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already exists, reactivate if unsubscribed
    let subscriber = await NewsletterSubscriber.findOne({ email });
    if (subscriber) {
      if (subscriber.status === 'Unsubscribed') {
        subscriber.status = 'Active';
        subscriber.source = source || subscriber.source;
        await subscriber.save();
        return res.status(200).json(subscriber);
      }
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    subscriber = new NewsletterSubscriber({
      email,
      source: source || 'Website Footer'
    });
    await subscriber.save();
    res.status(201).json(subscriber);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateNewsletterSubscriberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    res.status(200).json(subscriber);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getNewsletterSubscribers,
  createNewsletterSubscriber,
  updateNewsletterSubscriberStatus
};
