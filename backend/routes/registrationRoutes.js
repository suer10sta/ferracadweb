const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const registrationController = require('../controllers/registrationController');
const auth = require("../middlewares/auth")
const rateLimit = require('express-rate-limit');

const freeTrialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // nombre maximum de requêtes par IP dans la période
  message: {
    success: false,
    message: "Trop de tentatives. Veuillez réessayer dans 1 heure."
  },
  standardHeaders: true, // ajoute les headers RateLimit
  legacyHeaders: false // désactive les anciens headers
});

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const registrationValidationRules = [
  body('userId').optional().isMongoId().withMessage('Invalid userId'),
  body('rentalId').optional().isMongoId().withMessage('Invalid rentalId'),
  body('company').optional().isString(),
  body('username').optional().isString(),
  body('status').optional().isString(),
  body('computerName').optional().isString(),
  body('computerCode').optional().isString(),
  body('authCode').optional().isString(),
  body('expirationDate').optional().isISO8601().toDate(),
];

// Routes
router.post('/', auth, registrationValidationRules, validateRequest, registrationController.createRegistration);
router.get('/', auth, registrationController.getAllRegistrations);
router.put('/:id', auth, registrationValidationRules, validateRequest, registrationController.updateRegistration);
router.delete('/:id', auth, registrationController.deleteRegistration);
router.post('/ferracad-plugin', registrationController.insertLicenseData);
router.post('/free-trial', freeTrialLimiter, registrationController.freeTrialLicense);

router.put('/transter/:registerId/:userId', auth, registrationController.transferLicence);

module.exports = router;