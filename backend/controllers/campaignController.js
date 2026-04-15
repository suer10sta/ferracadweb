const Campaign = require('../models/Campaign');
const { validationResult } = require('express-validator');

exports.createCampaign = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { type, subject, content, totalSenders, status } = req.body;

        const campaignData = {
            type,
            subject,
            content,
            totalSenders,
            status,
        };

        const campaign = new Campaign(campaignData);
        await campaign.save();

        res.status(201).json({ message: 'Campaign created', data: campaign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCampaign = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { type, subject, content, totalSenders, status } = req.body;

        const updateData = {};

        if (type !== undefined) updateData.type = type;
        if (subject !== undefined) updateData.subject = subject;
        if (content !== undefined) updateData.content = content;
        if (totalSenders !== undefined) updateData.totalSenders = totalSenders;
        if (status !== undefined) updateData.status = status;

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        res.status(200).json({ message: 'Campaign updated', data: campaign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.status(200).json({ data: campaigns });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single campaign by ID
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        res.status(200).json({ data: campaign });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        res.status(200).json({ message: 'Campaign deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
