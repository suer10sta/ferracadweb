const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const licenseHistoryController = require('../controllers/licenseHistoryController');
const auth = require("../middlewares/auth")

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const licenseHistoryValidationRules = [
  body('registerId').notEmpty().withMessage('registerId est requis').isMongoId().withMessage('registerId invalide'),
  body('startAt').optional().isISO8601().toDate().withMessage('startAt doit être une date valide'),
  body('expirationDate').optional().isISO8601().toDate().withMessage('expirationDate doit être une date valide'),
];

// Routes
router.post('/', auth, licenseHistoryValidationRules, validateRequest, licenseHistoryController.createLicenseHistory);
router.get('/', auth, licenseHistoryController.getAllLicenseHistories);
router.get('/:id', auth, licenseHistoryController.getLicenseHistoryById);
router.put('/:id', auth, licenseHistoryValidationRules, validateRequest, licenseHistoryController.updateLicenseHistory);
router.delete('/:id', auth, licenseHistoryController.deleteLicenseHistory);

module.exports = router;
