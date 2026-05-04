const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const auth = require("../middlewares/auth")

// Validation rules
const contactValidation = [
    body('nom').isString().trim().notEmpty(),
    body('mail').isEmail().normalizeEmail(),
    body('sujet').isString().trim().notEmpty(),
    body('message').isString().trim().notEmpty(),
    body('newsletter').optional().isBoolean()
];

// Create
router.post('/', contactValidation, contactController.createContact);

// Get all
router.get('/', auth, contactController.getAllContacts);

// Reply
router.post('/reply/:id', auth, contactController.replyContact);

// Close
router.patch('/close/:id', auth, contactController.closeContact);

// Delete
router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;