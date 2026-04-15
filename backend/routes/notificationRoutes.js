const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require("../middlewares/auth")

router.get('/', auth, notificationController.getAllNotifications);
router.get('/:id', auth, notificationController.getNotificationById);
router.put('/:id', auth, notificationController.markReadNotification);
router.put('/', auth, notificationController.allAsRead);

module.exports = router;