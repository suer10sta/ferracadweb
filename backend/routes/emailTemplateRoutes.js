const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const auth = require("../middlewares/auth")

// Normally we should protect these routes
router.get('/', auth, emailTemplateController.getEmailTemplates);
router.post('/', auth, emailTemplateController.createEmailTemplate);
router.put('/:id', auth, emailTemplateController.updateEmailTemplate);
router.delete('/:id', auth, emailTemplateController.deleteEmailTemplate);
router.post('/send', auth, emailTemplateController.sendCustomEmail);
router.get('/email-logs/:userId', auth, emailTemplateController.getEmailLogs);

module.exports = router;

