const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const newsletterController = require('../controllers/newsletterController');
const auth = require("../middlewares/auth")

// Create subscriber
router.post(
    '/',
    body('email').isEmail().normalizeEmail(),
    newsletterController.createNewsletter
);

// Get all subscribers
router.get('/', auth, newsletterController.getAllNewsletters);

// Get subscriber by ID
router.get('/:id', auth, newsletterController.getNewsletterById);

// Update subscriber (status)
router.put(
    '/:id',
    auth,
    body('status').isIn(['active', 'inactive']),
    newsletterController.updateNewsletter
);

// Delete subscriber
router.delete('/:id', auth, newsletterController.deleteNewsletter);

module.exports = router;