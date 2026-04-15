const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

// Create a log entry
exports.createLog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { userId, userType, action, actionId } = req.body;

        const logData = {
            userId,
            userType,
            action,
            actionId,
        };

        const log = new ActivityLog(logData);
        await log.save();

        res.status(201).json({ message: 'Log created', data: log });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all logs (with optional filtering)
exports.getAllLogs = async (req, res) => {
    try {
        const { role } = req.user;
        if(role !== "admin") {
            return res.status(401).json({ message: "Accès non autorisé. Droits administrateur requis." });
        }

        const filters = {};
        const { userType, userId, action } = req.query;

        if (userType) filters.userType = userType;
        if (userId) filters.userId = userId;
        if (action) filters.action = new RegExp(action, 'i'); // case-insensitive match

        const logs = await ActivityLog.find(filters)
            .populate('userId') // populate basic user info
            .sort({ createdAt: -1 });

        res.status(200).json({ logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single log by ID
exports.getLogById = async (req, res) => {
    try {
        const log = await ActivityLog.findById(req.params.id).populate('userId', 'email').sort({ createdAt: -1 });
        if (!log) return res.status(404).json({ message: 'Log not found' });

        res.status(200).json({ data: log });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};