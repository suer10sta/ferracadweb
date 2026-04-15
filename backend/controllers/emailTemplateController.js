const EmailTemplate = require('../models/EmailTemplates');
const EmailSendsLog = require('../models/EmailSendsLog');
const sendEmail = require('../utils/sendMail');

exports.getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const template = new EmailTemplate({ name, subject, body });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const template = await EmailTemplate.findByIdAndUpdate(
      id,
      { name, subject, body },
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json(template);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByIdAndDelete(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendCustomEmail = async (req, res) => {
  try {
    const { email, subject, body, userId } = req.body;

    if (!email || !subject || !body) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await sendEmail({
      type: "custom",
      email,
      data: { subject, html: body }
    });

    // Log the send
    if (userId) {
      await EmailSendsLog.create({
        userId: userId,
        adminId: req.user.id,
        subject,
        body
      });
    }

    res.status(200).json({ message: "E-mail envoyé avec succès." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmailLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await EmailSendsLog.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


