const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const settingsController = require('../controllers/settingsController');
const auth = require("../middlewares/auth")

router.get('/', settingsController.getSettings);

router.put(
    '/',
    auth,
    settingsController.updateSettings
);

module.exports = router;
