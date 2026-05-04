const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    ip: String,
    name: String,
    email: String,
    subject: String,
    message: String,
    isActiveAcc: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'replied', 'closed'], default: 'pending' },
    ticketNum: Number,
    replies: [{
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });
  
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;