const express = require('express');
const router = express.Router();
const controller = require('../controllers/factureController');
const auth = require("../middlewares/auth")
const upload = require('../middlewares/upload');
const Facture = require('../models/Facture');

router.get('/', auth, controller.getFactures);
router.delete('/:id', auth, controller.deleteFacture);
router.post('/send', auth, upload.single('facture'), controller.sendFacture);

module.exports = router;