const MailOpening = require('../models/MailOpening');
const { validationResult } = require('express-validator');

exports.createMailOpening = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { campaignId, userId } = req.body;

        const mailOpeningData = {
            campaignId,
            userId
        };

        const mailOpening = new MailOpening(mailOpeningData);
        await mailOpening.save();

        res.status(201).json({ message: 'Mail opening logged', data: mailOpening });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllMailOpenings = async (req, res) => {
    try {
        const openings = await MailOpening.find()
            .populate('campaignId', 'subject')
            .populate('userId', 'email');
        res.status(200).json({ data: openings });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMailOpeningById = async (req, res) => {
    try {
        const opening = await MailOpening.findById(req.params.id)
            .populate('campaignId', 'subject')
            .populate('userId', 'email');

        if (!opening) return res.status(404).json({ message: 'Mail opening not found' });

        res.status(200).json({ data: opening });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteMailOpening = async (req, res) => {
    try {
        const opening = await MailOpening.findByIdAndDelete(req.params.id);
        if (!opening) return res.status(404).json({ message: 'Mail opening not found' });

        res.status(200).json({ message: 'Mail opening deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
