const express = require('express');
const router = express.Router();
const controller = require('../controllers/downloadController');
const auth = require("../middlewares/auth")

router.get('/', auth, controller.getAllDownloads);

module.exports = router;