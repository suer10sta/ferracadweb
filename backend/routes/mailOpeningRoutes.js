const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const mailOpeningController = require('../controllers/mailOpeningController');

// Create mail opening
router.post(
    '/',
    [
        body('campaignId').isMongoId().withMessage('Valid campaignId required'),
        body('userId').isMongoId().withMessage('Valid userId required')
    ],
    mailOpeningController.createMailOpening
);

// Get all mail openings
router.get('/', mailOpeningController.getAllMailOpenings);

// Get one
router.get('/:id', mailOpeningController.getMailOpeningById);

// Delete
router.delete('/:id', mailOpeningController.deleteMailOpening);

module.exports = router;