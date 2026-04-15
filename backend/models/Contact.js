const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    ip: String,
    name: String,
    email: String,
    subject: String,
    message: String,
    isActiveAcc: { type: Boolean, default: false },
}, { timestamps: true });
  
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;