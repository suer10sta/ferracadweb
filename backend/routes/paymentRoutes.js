const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const auth = require("../middlewares/auth")

// Middleware validation result handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Routes

// Create
router.post('/', auth, validateRequest, paymentController.createPayment);

// Route pour récupérer le taux TVA de l'utilisateur connecté
router.get('/taux-tva/:id', auth, paymentController.getTauxTva);

// Read all
router.get('/', auth, paymentController.getAllPayments);

// Read one
router.get('/:id', auth, paymentController.getPaymentById);

// Update
router.put('/:id', auth, validateRequest, paymentController.updatePayment);

// Delete
router.delete('/:id', auth, paymentController.deletePayment);

// double check
router.post('/create-setup-intent', auth, paymentController.createSetupIntent);

module.exports = router;