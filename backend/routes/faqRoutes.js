const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const faqController = require('../controllers/faqController');
const auth = require("../middlewares/auth")

// Validation
const faqValidation = [
    body('category').optional().isString().trim(),
    body('question').isString().trim().notEmpty(),
    body('answer').isString().trim().notEmpty(),
    body('isItPrincipale').optional().isBoolean(),
    body('isDraft').optional().isBoolean(),
    body('lang').optional().isString(),
];

// Create
router.post('/', auth, faqValidation, faqController.createFaq);

// Get all
router.get('/', faqController.getAllFaqs);

// Update
router.put('/:id', auth, faqController.updateFaq);

// Delete
router.delete('/:id', faqController.deleteFaq);

module.exports = router;