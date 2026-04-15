const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const loginLogController = require('../controllers/loginLogController');

// Create (internal use)
router.post(
    '/',
    [
        body('userId').isMongoId().withMessage('Invalid user ID'),
        body('ip').isIP().withMessage('Invalid IP address'),
    ],
    loginLogController.createLoginLog
);

// Get all logs (with optional filtering)
router.get(
    '/',
    [
        query('userId').optional().isMongoId(),
        query('ip').optional().isString(),
    ],
    loginLogController.getAllLoginLogs
);

// Get one log
router.get('/:id', loginLogController.getLoginLogById);

module.exports = router;