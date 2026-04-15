const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rentalController = require('../controllers/rentalController');
const auth = require("../middlewares/auth")

// Middleware validation result handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Create
router.post('/', auth, validateRequest, rentalController.createRental);
router.post('/create-payment-intent', auth, rentalController.createPaymentIntent);
router.post('/confirm-payment', auth, rentalController.confirmPayment);

// Create
router.post('/admin', auth, validateRequest, rentalController.createCommandByAdmin);

// get Rental
router.get('/', auth, rentalController.getRental);

// update rental
router.put('/:id', auth, rentalController.updateRental);

// update rental
router.delete('/:id', auth, rentalController.removeRental);

module.exports = router;
