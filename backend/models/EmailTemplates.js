const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);
