const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const campaignController = require('../controllers/campaignController');

// Allowed types
const allowedTypes = ['newsletter', 'newsletter_noaccount', 'expirationUsers', 'activeUsers', 'non-subscription users'];

// Create campaign
router.post(
    '/',
    [
        body('type').isIn(allowedTypes),
        body('subject').isString().trim().notEmpty(),
        body('content').isString().trim().notEmpty(),
        body('totalSenders').optional().isNumeric(),
        body('status').optional().isString().trim()
    ],
    campaignController.createCampaign
);

// Get all campaigns
router.get('/', campaignController.getAllCampaigns);

// Get campaign by ID
router.get('/:id', campaignController.getCampaignById);

// Update campaign
router.put(
    '/:id',
    [
        body('type').optional().isIn(allowedTypes),
        body('subject').optional().isString().trim(),
        body('content').optional().isString().trim(),
        body('totalSenders').optional().isNumeric(),
        body('status').optional().isString().trim()
    ],
    campaignController.updateCampaign
);

// Delete campaign
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
