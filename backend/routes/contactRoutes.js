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

module.exports = router;