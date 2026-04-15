const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const paymentConfigController = require('../controllers/paymentConfigController');
const auth = require("../middlewares/auth")

// Middleware pour gérer les erreurs de validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules pour création et mise à jour
const paymentConfigValidationRules = [
  body('userId').notEmpty().withMessage('userId is required'),
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .isIn(['cart', 'paypal'])
    .withMessage('type must be either "cart" or "paypal"'),
  body('email').optional().isEmail(),
  body('numberCart').optional().isString(),
  body('dateExp').optional().isString(),
  body('cvc').optional().isString(),
  body('nameCart').optional().isString(),
];

// Create
router.post(
  '/', 
  auth,
  paymentConfigValidationRules,
  validateRequest,
  paymentConfigController.createPaymentConfig
);

// Read all
router.get('/', auth, paymentConfigController.getAllPaymentConfigs);

// Read one
router.get('/:id', auth, paymentConfigController.getPaymentConfigById);

// Update
router.put(
  '/:id', auth,
  paymentConfigValidationRules,
  validateRequest,
  paymentConfigController.updatePaymentConfig
);

// Delete
router.delete('/:id', auth, paymentConfigController.deletePaymentConfig);

module.exports = router;
