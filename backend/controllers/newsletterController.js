const Newsletter = require('../models/Newsletter');
const { validationResult } = require('express-validator');

// Create a new subscriber
exports.createNewsletter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email } = req.body;

        const existing = await Newsletter.findOne({ email });
        if (existing) return res.status(409).json({ message: 'Email already subscribed.' });

        const subscriber = new Newsletter({ email });
        await subscriber.save();

        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all subscribers
exports.getAllNewsletters = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        res.status(200).json({ data: subscribers });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single subscriber
exports.getNewsletterById = async (req, res) => {
    try {
        const subscriber = await Newsletter.findById(req.params.id);
        if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

        res.status(200).json({ data: subscriber });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update subscriber status
exports.updateNewsletter = async (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const subscriber = await Newsletter.findByIdAndUpdate(
            req.params.id,
            {
                status,
                unsubscribeDate: status === 'inactive' ? new Date() : null
            },
            { new: true }
        );

        if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

        res.status(200).json({ message: 'Subscriber updated', data: subscriber });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a subscriber
exports.deleteNewsletter = async (req, res) => {
    try {
        const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
        if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

        res.status(200).json({ message: 'Subscriber deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
