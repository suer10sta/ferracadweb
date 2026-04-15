const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const logController = require('../controllers/activityLogController');
const auth = require("../middlewares/auth")

// Create a log (usually done internally)
router.post(
    '/',
    [
        body('userId').isMongoId().withMessage('Valid userId is required'),
        body('userType').isIn(['admin', 'client']),
        body('action').isString().notEmpty(),
        body('actionId').optional().isString(),
    ],
    logController.createLog
);

// Get all logs (optional filters)
router.get(
    '/',
    auth,
    [
        query('userType').optional().isIn(['admin', 'client']),
        query('userId').optional().isMongoId(),
        query('action').optional().isString(),
    ],
    logController.getAllLogs
);

// Get a single log by ID
router.get('/:id', logController.getLogById);

module.exports = router;