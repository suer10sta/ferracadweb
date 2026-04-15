const LoginLog = require('../models/LoginLog');
const { validationResult } = require('express-validator');

// Create a login log (usually internal)
exports.createLoginLog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { userId, ip } = req.body;

        const logData = { userId, ip };

        const loginLog = new LoginLog(logData);
        await loginLog.save();

        res.status(201).json({ message: 'Login log created', data: loginLog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all login logs (optional filtering)
exports.getAllLoginLogs = async (req, res) => {
    try {
        const filters = {};
        const { userId, ip } = req.query;

        if (userId) filters.userId = userId;
        if (ip) filters.ip = new RegExp(ip, 'i');

        const logs = await LoginLog.find(filters)
            .populate('userId', 'email') // show basic user info
            .sort({ createdAt: -1 });

        res.status(200).json({ data: logs });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single log
exports.getLoginLogById = async (req, res) => {
    try {
        const log = await LoginLog.findById(req.params.id)
            .populate('userId', 'email');
        if (!log) return res.status(404).json({ message: 'Login log not found' });

        res.status(200).json({ data: log });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};